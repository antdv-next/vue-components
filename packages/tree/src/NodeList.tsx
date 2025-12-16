import type { ListRef } from '@v-c/virtual-list'
import type { FlattenNode, Key, KeyEntities, ScrollTo } from './interface'
import VirtualList from '@v-c/virtual-list'
import { Fragment, computed, defineComponent, ref } from 'vue'
import TreeNode from './TreeNode'
import { getKey, getTreeNodeProps } from './utils/treeUtil'

const HIDDEN_STYLE = {
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

function itemKey(item: FlattenNode) {
  const { key, pos } = item
  return String(getKey(key, pos))
}

function getAccessibilityPath(item: FlattenNode): string {
  let path = String(item.data.key)
  let current = item

  while (current.parent) {
    current = current.parent
    path = `${current.data.key} > ${path}`
  }

  return path
}

export interface NodeListRef {
  scrollTo: ScrollTo
  getIndentWidth: () => number
}

export interface NodeListProps {
  prefixCls: string
  style?: any
  data?: FlattenNode[]
  focusable?: boolean
  focused?: boolean
  tabIndex?: number
  selectable?: boolean
  checkable?: boolean
  disabled?: boolean

  expandedKeys: Key[]
  selectedKeys: Key[]
  checkedKeys: Key[]
  loadedKeys: Key[]
  loadingKeys: Key[]
  halfCheckedKeys: Key[]
  keyEntities: KeyEntities

  dragging?: boolean
  dragOverNodeKey: Key | null
  dropPosition: number | null

  // Virtual list
  height?: number
  itemHeight?: number
  virtual?: boolean
  scrollWidth?: number

  activeItem?: FlattenNode | null

  onKeyDown?: (e: KeyboardEvent) => void
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
  onActiveChange?: (key: Key | null) => void

  onContextmenu?: (e: MouseEvent) => void
  onScroll?: (e: Event) => void
}

const NodeList = defineComponent<NodeListProps>(
  (props, { attrs, expose }) => {
    const listRef = ref<ListRef>()
    const indentMeasurerRef = ref<HTMLDivElement>()

    const treeNodeRequiredProps = computed(() => ({
      expandedKeys: props.expandedKeys || [],
      selectedKeys: props.selectedKeys || [],
      loadedKeys: props.loadedKeys || [],
      loadingKeys: props.loadingKeys || [],
      checkedKeys: props.checkedKeys || [],
      halfCheckedKeys: props.halfCheckedKeys || [],
      dragOverNodeKey: props.dragOverNodeKey,
      dropPosition: props.dropPosition,
      keyEntities: props.keyEntities,
    }))

    expose<NodeListRef>({
      scrollTo: (scroll) => {
        listRef.value?.scrollTo(scroll)
      },
      getIndentWidth: () => indentMeasurerRef.value?.offsetWidth || 0,
    })

    const VirtualListAny = VirtualList as any

    return () => {
      return (
        <Fragment>
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
              onKeydown={props.onKeyDown}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
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
            ref={listRef}
            role="tree"
            style={props.style}
            onContextmenu={props.onContextmenu}
            onScroll={props.onScroll}
          >
            {({ item: treeNode }: any) => {
              const { pos, data: nodeData, title, key, isStart, isEnd } = treeNode
              const mergedKey = getKey(key, pos)
              const treeNodeProps = getTreeNodeProps(mergedKey, treeNodeRequiredProps.value)
              const active = !!props.activeItem && mergedKey === props.activeItem.key

              const restProps = { ...(nodeData || {}) }
              delete restProps.key
              delete restProps.children

              return (
                <TreeNode
                  {...restProps}
                  {...treeNodeProps}
                  title={title}
                  active={active}
                  pos={pos}
                  data={nodeData}
                  isStart={isStart}
                  isEnd={isEnd}
                  onMouseMove={() => props.onActiveChange?.(null)}
                />
              )
            }}
          </VirtualListAny>
        </Fragment>
      )
    }
  },
  {
    name: 'NodeList',
    inheritAttrs: false,
  },
)

export default NodeList
