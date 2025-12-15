import type { ListRef } from '@v-c/virtual-list'
import type { PropType } from 'vue'
import type { FlattenNode, Key, KeyEntities, ScrollTo } from './interface'
import VirtualList from '@v-c/virtual-list'
import { defineComponent, ref } from 'vue'
import TreeNode from './TreeNode'
import { getKey, getTreeNodeProps } from './utils/treeUtil'

const HIDDEN_STYLE: any = {
  width: 0,
  height: 0,
  display: 'flex',
  overflow: 'hidden',
  opacity: 0,
  border: 0,
  padding: 0,
  margin: 0,
}

function noop() {}

export interface NodeListRef {
  scrollTo: ScrollTo
  getIndentWidth: () => number
}

function itemKey(item: FlattenNode) {
  const { key, pos } = item
  return String(getKey(key, pos))
}

function getAccessibilityPath(item: FlattenNode): string {
  let path = String((item.data as any).key)
  let current = item

  while (current.parent) {
    current = current.parent
    path = `${(current.data as any).key} > ${path}`
  }

  return path
}

export default defineComponent({
  name: 'NodeList',
  props: {
    prefixCls: { type: String, required: true },
    style: Object as PropType<any>,
    data: { type: Array as PropType<FlattenNode<any>[]>, default: () => [] },
    focusable: { type: Boolean, default: true },
    focused: Boolean,
    tabIndex: { type: Number, default: 0 },
    selectable: Boolean,
    checkable: Boolean,
    disabled: Boolean,

    expandedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    selectedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    checkedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    loadedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    loadingKeys: { type: Array as PropType<Key[]>, default: () => [] },
    halfCheckedKeys: { type: Array as PropType<Key[]>, default: () => [] },
    keyEntities: { type: Object as PropType<KeyEntities>, default: () => ({}) },

    dragging: Boolean,
    dragOverNodeKey: [String, Number] as PropType<Key>,
    dropPosition: Number,

    height: Number,
    itemHeight: Number,
    virtual: { type: Boolean, default: true },
    scrollWidth: Number,

    activeItem: Object as PropType<FlattenNode<any> | null>,

    onKeyDown: Function as PropType<(e: KeyboardEvent) => void>,
    onFocus: Function as PropType<(e: FocusEvent) => void>,
    onBlur: Function as PropType<(e: FocusEvent) => void>,
    onActiveChange: Function as PropType<(key: Key | null) => void>,
    onContextmenu: Function as PropType<(e: MouseEvent) => void>,
    onScroll: Function as PropType<(e: Event) => void>,
  },
  inheritAttrs: false,
  setup(props, { attrs, expose }) {
    const listRef = ref<ListRef>()
    const indentMeasurerRef = ref<HTMLDivElement>()

    expose({
      scrollTo: (scroll: any) => {
        listRef.value?.scrollTo(scroll)
      },
      getIndentWidth: () => indentMeasurerRef.value?.offsetWidth || 0,
    } satisfies NodeListRef)

    const VirtualListAny = VirtualList as any

    return () => {
      const treeNodeRequiredProps = {
        expandedKeys: props.expandedKeys || [],
        selectedKeys: props.selectedKeys || [],
        loadedKeys: props.loadedKeys || [],
        loadingKeys: props.loadingKeys || [],
        checkedKeys: props.checkedKeys || [],
        halfCheckedKeys: props.halfCheckedKeys || [],
        dragOverNodeKey: props.dragOverNodeKey,
        dropPosition: props.dropPosition,
        keyEntities: props.keyEntities,
      }

      return (
        <>
          {props.focused && props.activeItem && (
            <span style={HIDDEN_STYLE} aria-live="assertive">
              {getAccessibilityPath(props.activeItem)}
            </span>
          )}

          <div>
            <input
              style={HIDDEN_STYLE}
              disabled={props.focusable === false || props.disabled}
              tabindex={props.focusable !== false ? props.tabIndex : undefined}
              onKeydown={props.onKeyDown as any}
              onFocus={props.onFocus as any}
              onBlur={props.onBlur as any}
              value=""
              onInput={noop}
              aria-label="for screen reader"
            />
          </div>

          <div
            class={`${props.prefixCls}-treenode`}
            aria-hidden
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              visibility: 'hidden',
              height: 0,
              overflow: 'hidden',
              border: 0,
              padding: 0,
            }}
          >
            <div class={`${props.prefixCls}-indent`}>
              <div ref={indentMeasurerRef} class={`${props.prefixCls}-indent-unit`} />
            </div>
          </div>

          <VirtualListAny
            {...attrs}
            data={props.data}
            itemKey={itemKey}
            height={props.height}
            fullHeight={false}
            virtual={props.virtual}
            itemHeight={props.itemHeight}
            scrollWidth={props.scrollWidth}
            prefixCls={`${props.prefixCls}-list`}
            ref={listRef as any}
            role="tree"
            style={props.style}
            onContextmenu={props.onContextmenu as any}
            onScroll={props.onScroll as any}
          >
            {({ item: treeNode }: { item: FlattenNode<any> }) => {
              const { pos, data, title, key, isStart, isEnd } = treeNode
              const mergedKey = getKey(key, pos)

              const treeNodeProps = getTreeNodeProps(mergedKey, treeNodeRequiredProps as any)
              const active = !!props.activeItem && mergedKey === props.activeItem.key

              return (
                <TreeNode
                  {...(data as any)}
                  {...treeNodeProps}
                  title={title}
                  active={active}
                  pos={pos}
                  data={treeNode.data}
                  isStart={isStart}
                  isEnd={isEnd}
                  onMouseMove={() => props.onActiveChange?.(null)}
                />
              )
            }}
          </VirtualListAny>
        </>
      )
    }
  },
})
