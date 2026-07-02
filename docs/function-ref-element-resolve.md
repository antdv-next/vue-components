# 函数 ref 解析元素的正确姿势（vue ≥3.5.39 兼容模式）

> 背景 issue：[antdv-next#623](https://github.com/antdv-next/antdv-next/issues/623)
> 上游变更：[vuejs/core#14985 — pause tracking when invoking function refs](https://github.com/vuejs/core/pull/14985)（vue 3.5.39 起）
> 通用工具：`@v-c/util/dist/vnode` 的 **`createElementRef`**

## 一、问题机理

Vue 中两类 ref 的赋值/调用时机**不对称**：

| ref 形式 | 执行时机 |
| --- | --- |
| 函数 ref（`ref={fn}`） | patch 过程中**同步**调用 |
| 模板 ref 对象（`ref={shallowRef}`） | 排入 **post 队列**（`job.id = -1`）延迟赋值 |

因此：在**组件**上挂函数 ref、并在回调里立刻解析该组件 expose 出来的元素（如 `exposed.nativeElement`，本质是一个模板 ref），**首挂载时必然解析不到**——expose 的 ref 还没被赋值。

这个写法在 vue ≤3.5.38 上"能用"纯属意外：函数 ref 是在父组件 render effect 内部同步调用的，回调里对 `nativeElement`（ref）的读取会被**意外收集为父组件渲染依赖**。post 阶段 ref 落地时触发父组件重渲染 → 函数 ref 被再次调用 → 这次解析成功，形成"自愈"。

vue 3.5.39 的 #14985 给函数 ref 调用包上了 `pauseTracking()`（目的是防止依赖污染/渲染死循环，本身是合理修复），**自愈链被切断**：回调只执行一次，元素永远解析不到。

### 在 @v-c/trigger 中的具体表现（#623）

`popupEle` 拿不到 → prepare 阶段对齐 bail → `ready` 永远为 false → 弹层整个 enter 动画都钉在 `left:-1000vw` 屏幕外 → "第一次点击无效、第二次偏移闪现、第三次才正常"。dev/prod 都会复现。

## 二、修复模式：`createElementRef`

统一封装在 `packages/util/src/vnode.ts`：

```ts
export function createElementRef<T extends Element = HTMLElement>(
  apply: (element: T | null, node: any) => void,
  resolve: (node: any) => T | null = resolveToElement,
): (node: any) => void
```

行为约定：

1. 每次调用先用 `resolve`（默认 `resolveToElement`）把节点解析成 DOM 元素；
2. **节点存在但解析失败**（expose 的 ref 还在 post 队列）时，不把 null 交给 `apply`（避免覆盖别处种好的值），改为 `nextTick` 后重试一次；
3. 内部序号守卫：重试落地前如果发生了更新的调用（如卸载传入 null），重试作废，不会写入过期元素；
4. 节点为 null（卸载）时正常把 null 交给 `apply`，清理逻辑不受影响。

### 用法示例

```ts
import { createElementRef } from '@v-c/util/dist/vnode'

// 默认解析器（resolveToElement：__$el / DOM / nativeElement / el / getElement() / $el）
const setPopupRef = createElementRef<HTMLDivElement>((element) => {
  externalPopupRef.value = element
  if (popupEle.value !== element) {
    popupEle.value = element
  }
})

// 自定义解析器（第二参数）
const setWrapperRef = createElementRef((dom) => {
  wrapperRef.value = dom
}, (el) => {
  let _wrapper = el
  if (el?.elementEl && typeof el.elementEl === 'object') {
    _wrapper = el.elementEl
  }
  return getDom(_wrapper)
})
```

```tsx
<Popup ref={setPopupRef} />
```

### 已接入的调用点

| 位置 | 说明 |
| --- | --- |
| `trigger/src/index.tsx` `setPopupRef` | #623 主修复点 |
| `trigger/src/index.tsx` `setTargetRef` | 防止解析失败清空 `targetEle` 导致 Popup 不渲染 |
| `trigger/UniqueProvider` `setPopupRef` | Unique 模式（Two Buttons Unique）同款问题 |
| `resize-observer/SingleObserver` `setWrapperRef` | 组件子节点时 ResizeObserver 观察不到 |

### 配套技巧：动画场景用 Transition 钩子兜底

对时序敏感的场景（首帧就要用元素做测量/对齐），仅靠 `nextTick` 重试可能晚于 post-flush 的消费者（如 `flush: 'post'` 的 watcher）。此时用 **Transition 钩子直接拿元素**做种子——`onBeforeEnter` / `onBeforeAppear` 的参数就是真实 DOM，不依赖任何 ref 时机：

```ts
const onPrepare = (element?: Element) => {
  // 首开时 setPopupRef 还解析不到，先用 transition 元素种上
  if (element && !popupEle.value) {
    popupEle.value = element as HTMLDivElement
  }
  // ...对齐逻辑
}
```

trigger 的 `Popup` 已把元素透传给 `onPrepare(element)`，并显式声明了 `onBeforeAppear` / `onAfterAppear`（防止使用方自定义 appear 钩子顶掉 enter 回退）。

## 三、代码检查清单（Code Review 时对照）

以下写法是**危险**的，必须走 `createElementRef`：

- ❌ 在组件的函数 ref 回调里**立刻**读取 `exposed.nativeElement` / `exposed.getElement()` 等 expose 的模板 ref，并把结果（含 null）直接写入状态；
- ❌ 解析失败时把 null 写进目标 ref（覆盖/清空），或解析失败后直接 `return` 且**没有任何重试机制**；
- ❌ 依赖"函数 ref 回调会因响应式而重新执行"的假设（3.5.39 起不成立）。

以下写法是**安全**的，无需改造：

- ✅ 函数 ref 只**存储原始节点/实例**，在事件回调、watcher 等使用时刻才解析元素（如 dialog/drawer/dropdown/slider/table 的现有写法）；
- ✅ 在 `flush: 'post'` 的 watch 或 `onMounted` 里调用 `resolveToElement`（模板 ref 的 post job 排在 post watcher 之前，如 tour 的 `useTarget`）；
- ✅ 元素类型 vnode 上的函数 ref（拿到的直接就是 DOM，无解析时机问题）。

## 四、新代码规范

1. 需要"组件 ref → DOM 元素"的场合，一律使用 `createElementRef`，不要手写解析 + 赋值；
2. 组件 expose 元素时统一暴露 `nativeElement`（ref）与 `getElement()`，与 `resolveToElement` 的解析顺序保持兼容;
3. 不要在任何函数 ref 回调里依赖响应式重调；需要"元素就绪后做事"，用 `watch(elementRef)`；
4. 升级 vue 版本后，用真实浏览器过一遍浮层类组件的**首次打开**（首开是所有 ref 时序问题的高发点），不要只跑 jsdom 测试。

## 五、发布依赖顺序

`createElementRef` 位于 `@v-c/util`。任何包首次引入它时，发布顺序必须是：**先发 `@v-c/util`，再发引用它的包**（`workspace:^` 在发布时按当时工作区版本解析 floor，先发 util 下游范围才正确）。

## 六、相关链接

- antdv-next issue：<https://github.com/antdv-next/antdv-next/issues/623>
- vue 变更：<https://github.com/vuejs/core/pull/14985>（3.5.39 CHANGELOG "pause tracking when invoking function refs"）
- 纯 Vue 最小复现（SFC Playground，3.5.38 显示 YES / ≥3.5.39 显示 NO）：见 issue 提报草稿
