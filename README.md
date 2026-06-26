# vue components Headless UI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Vue Components (`@v-c/*`) 是一个基于 Vue 3 的无样式（Headless）组件库，为上层 UI 库（如 `antdv-next`）提供组件逻辑与交互能力的底层基础。它不包含任何样式，专注于组件的行为、状态管理和可访问性。

## 特性

- **Headless 架构**：纯逻辑层，样式完全由上层 UI 库定制
- **Vue 3 Composition API**：采用 `<script setup>` + TSX 编写，类型安全
- **高度模块化**：42 个独立包，按需引入，体积轻量
- **完善的测试**：基于 Vitest + jsdom 的单元测试覆盖
- **现代化构建**：Vite + TypeScript + ESM 输出

## 快速开始

### 安装

```bash
# 安装依赖
pnpm i

# 启动开发服务器（Histoires Storybook）
pnpm dev

# 运行测试
pnpm test

# 构建组件
pnpm build

# 代码检查与修复
pnpm lint
```

### 开发

每个组件位于 `packages/<component-name>/` 目录下，结构如下：

```tree
packages/<component-name>/
├── src/          # 组件源码
├── tests/        # 单元测试
├── docs/         # Histoires 
└── package.json  # 独立包配置
```

## 组件列表

### 表单组件

| 组件 | 包名 | 描述 |
| ------ | ------ | ------ |
| Input | `@v-c/input` | 文本输入框 |
| Textarea | `@v-c/textarea` | 多行文本输入 |
| InputNumber | `@v-c/input-number` | 数值输入 |
| Select | `@v-c/select` | 下拉选择器 |
| TreeSelect | `@v-c/tree-select` | 树形选择器 |
| Cascader | `@v-c/cascader` | 级联选择器 |
| Checkbox | `@v-c/checkbox` | 多选框 |
| Switch | `@v-c/switch` | 开关 |
| Radio | `@v-c/radio` | 单选框 |
| Rate | `@v-c/rate` | 评分 |
| Slider | `@v-c/slider` | 滑块 |
| ColorPicker | `@v-c/color-picker` | 颜色选择器 |
| Mentions | `@v-c/mentions` | 提及输入 |
| Upload | `@v-c/upload` | 文件上传 |
| Picker | `@v-c/picker` | 选择器 |
| Segmented | `@v-c/segmented` | 分段控制器 |
| FieldForm | `@v-c/field-form` | 表单字段 |

### 导航组件

| 组件 | 包名 | 描述 |
| ------ | ------ | ------ |
| Menu | `@v-c/menu` | 菜单 |
| Dropdown | `@v-c/dropdown` | 下拉菜单 |
| Tabs | `@v-c/tabs` | 标签页 |
| Steps | `@v-c/steps` | 步骤条 |

### 数据展示

| 组件 | 包名 | 描述 |
| ------ | ------ | ------ |
| Table | `@v-c/table` | 表格 |
| Tree | `@v-c/tree` | 树形控件 |
| List | `@v-c/listy` | 列表 |
| Pagination | `@v-c/pagination` | 分页 |
| Progress | `@v-c/progress` | 进度条 |
| QRCode | `@v-c/qrcode` | 二维码 |
| Image | `@v-c/image` | 图片 |
| Collapse | `@v-c/collapse` | 折叠面板 |
| VirtualList | `@v-c/virtual-list` | 虚拟列表 |
| Slick | `@v-c/slick` | 轮播 |

### 反馈组件

| 组件 | 包名 | 描述 |
| ------ | ------ | ------ |
| Dialog | `@v-c/dialog` | 对话框 |
| Drawer | `@v-c/drawer` | 抽屉 |
| Notification | `@v-c/notification` | 通知提醒 |
| Tooltip | `@v-c/tooltip` | 气泡卡片 |
| Tour | `@v-c/tour` | 新手引导 |

### 布局与基础

| 组件 | 包名 | 描述 |
| ------ | ------ | ------ |
| Trigger | `@v-c/trigger` | 触发器（基础） |
| Portal | `@v-c/portal` | 传送门 |
| Overflow | `@v-c/overflow` | 溢出处理 |
| ResizeObserver | `@v-c/resize-observer` | 尺寸监听 |
| MutateObserver | `@v-c/mutate-observer` | DOM 变更监听 |

### 工具库

| 组件 | 包名 | 描述 |
| ------ | ------ | ------ |
| Util | `@v-c/util` | 工具函数集合 |
| AsyncValidator | `@v-c/async-validator` | 异步校验 |
| FastColor | `@v-c/fast-color` | 颜色处理 |
| MiniDecimal | `@v-c/mini-decimal` | 高精度小数 |

## 技术栈

- **框架**: Vue 3.5+
- **语言**: TypeScript
- **构建**: Vite 8.x + tsup/tsdown
- **测试**: Vitest 3.x + @vue/test-utils
- **文档**: Histoires 1.0
- **代码规范**: ESLint 9.x + @antfu/eslint-config
- **包管理**: pnpm 10.x

## 架构说明

```
vue-components/
├── packages/           # 42 个独立组件包
│   ├── input/
│   ├── select/
│   ├── table/
│   └── ...
├── CLAUDE.md           # Claude Code 开发指南
├── README.md           # 项目说明
└── package.json        # 根配置
```

每个组件包独立版本管理，通过 `pnpm` workspace 统一管理。构建输出仅为 ESM 格式（`preserveModules: true`）。

## 与 antdv-next 的关系

`antdv-next` 依赖所有 `@v-c/*` 包作为其组件的逻辑层。`@v-c/*` 提供无样式的组件能力，`antdv-next` 在此基础上添加 Ant Design 视觉样式。

```
@v-c/* (Headless)  →  antdv-next (Styled)  →  你的应用
   逻辑层              样式层                  业务层
```

## 贡献

非常欢迎您参与到我们的开源项目中来~

**PR流程：**

1. Fork 代码!
2. 创建自己的分支: `git checkout -b feat-xxxx`
3. 提交你的修改: `git commit -m 'feat(xxxx): add xxxxx'`
4. 推送您的分支: `git push origin feat-xxxx`
5. 提交`Pull request`

<a href="https://github.com/antdv-next/vue-components/graphs/contributors">
  <img src="https://opencollective.com/antdv-next/contributors.svg?width=890&limit=500" />
</a>
