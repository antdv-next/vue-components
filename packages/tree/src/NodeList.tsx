import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { ListRef } from '@v-c/virtual-list'
import type { DataEntity, DataNode, FlattenNode, Key, KeyEntities, ScrollTo } from './interface'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import VirtualList from '@v-c/virtual-list'
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import MotionTreeNode from './MotionTreeNode'
import { findExpandedKeys, getExpandRange } from './utils/diffUtil'
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

export const MOTION_KEY = `VC_TREE_MOTION_${Math.random()}`

const MotionNode: DataNode = {
  key: MOTION_KEY,
}

export const MotionEntity: DataEntity = {
  key: MOTION_KEY,
  level: 0,
  index: 0,
  pos: '0',
  node: MotionNode,
  nodes: [MotionNode],
}

const MotionFlattenData: FlattenNode = {
  parent: null,
  children: [],
  pos: MotionEntity.pos,
  data: MotionNode,
  title: null,
  key: MOTION_KEY,
  isStart: [],
  isEnd: [],
}

function getMinimumRangeTransitionRange(
  list: FlattenNode[],
  virtual: boolean | undefined,
  height: number | undefined,
  itemHeight: number | undefined,
) {
  if (virtual === false || !height || !itemHeight) {
    return list
  }

  return list.slice(0, Math.ceil(height / itemHeight) + 1)
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
  motion?: CSSMotionProps

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

  onListChangeStart?: () => void
  onListChangeEnd?: () => void

  onContextmenu?: (e: MouseEvent) => void
  onScroll?: (e: Event) => void
}

const NodeList = defineComponent<NodeListProps>(
  (props, { attrs, expose }) => {
    const listRef = ref<ListRef>()
    const indentMeasurerRef = ref<HTMLDivElement>()
    const { expandedKeys, data } = toPropsRefs(props, 'expandedKeys', 'data')

    const treeNodeRequiredProps = computed(() => ({
      expandedKeys: expandedKeys.value || [],
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

    // ============================== Motion ==============================
    const prevExpandedKeys = shallowRef<Key[]>(props.expandedKeys)
    const prevData = shallowRef<FlattenNode[]>(props.data || [])
    const transitionData = shallowRef<FlattenNode[]>(props.data || [])
    const transitionRange = shallowRef<FlattenNode[]>([])
    const motionType = ref<'show' | 'hide' | null>(null)

    const dataRef = shallowRef<FlattenNode[]>(props.data || [])
    watch(
      data,
      (newData) => {
        dataRef.value = (newData || []) as any
      },
      { immediate: true },
    )

    function onMotionEnd() {
      const latestData = dataRef.value
      prevData.value = latestData
      transitionData.value = latestData
      transitionRange.value = []
      motionType.value = null

      props.onListChangeEnd?.()
    }

    watch(
      () => props.dragging,
      (dragging) => {
        if (!dragging) {
          onMotionEnd()
        }
      },
      { immediate: true },
    )

    watch(
      [expandedKeys, data],
      () => {
        const diffExpanded = findExpandedKeys(prevExpandedKeys.value, expandedKeys.value)
        if (diffExpanded.key !== null) {
          if (diffExpanded.add) {
            const keyIndex = prevData.value?.findIndex?.(({ key }) => key === diffExpanded.key)
            const rangeNodes = getMinimumRangeTransitionRange(
              getExpandRange(prevData.value!, data.value!, diffExpanded.key),
              props.virtual,
              props.height,
              props.itemHeight,
            )

            const newTransitionData: FlattenNode[] = prevData.value?.slice?.() ?? []
            newTransitionData.splice(keyIndex! + 1, 0, MotionFlattenData)
            transitionData.value = newTransitionData
            transitionRange.value = rangeNodes
            motionType.value = 'show'
          }
          else {
            const keyIndex = data.value?.findIndex?.(({ key }) => key === diffExpanded.key)
            const rangeNodes = getMinimumRangeTransitionRange(
              getExpandRange(data.value!, prevData.value!, diffExpanded.key),
              props.virtual,
              props.height,
              props.itemHeight,
            )

            const newTransitionData: FlattenNode[] = data.value?.slice?.() ?? []
            newTransitionData.splice(keyIndex! + 1, 0, MotionFlattenData)
            transitionData.value = newTransitionData
            transitionRange.value = rangeNodes
            motionType.value = 'hide'
          }
        }
        else if (prevData.value !== data.value) {
          // If whole data changed, we just refresh the list
          prevData.value = data.value || []
          transitionData.value = data.value || []
        }
        prevExpandedKeys.value = expandedKeys.value || []
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    const mergedData = computed(() => (props.motion ? transitionData.value : (props.data || [])))

    return () => {
      const { motion, focused, activeItem, focusable, disabled, tabIndex, prefixCls } = props
      return (
        <>
          {focused && activeItem && (
            <span style={HIDDEN_STYLE} aria-live="assertive">
              {getAccessibilityPath(activeItem)}
            </span>
          )}

          <div>
            <input
              style={HIDDEN_STYLE}
              disabled={focusable === false || disabled}
              tabindex={focusable !== false ? tabIndex : undefined}
              onKeydown={props.onKeyDown}
              onFocus={props.onFocus}
              onBlur={props.onBlur}
              value=""
              onInput={noop}
              aria-label="for screen reader"
            />
          </div>

          <div
            class={`${prefixCls}-treenode`}
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
            <div class={`${prefixCls}-indent`}>
              <div ref={indentMeasurerRef} class={`${prefixCls}-indent-unit`} />
            </div>
          </div>

          <VirtualListAny
            {...attrs}
            data={mergedData.value}
            itemKey={itemKey}
            height={props.height}
            fullHeight={false}
            virtual={props.virtual}
            itemHeight={props.itemHeight}
            scrollWidth={props.scrollWidth}
            prefixCls={`${prefixCls}-list`}
            ref={listRef}
            role="tree"
            style={props.style}
            onContextmenu={props.onContextmenu}
            onScroll={props.onScroll}
            onVisibleChange={(originList: FlattenNode[]) => {
              // The best match is using `fullList` - `originList` = `restList`
              // and check the `restList` to see if has the MOTION_KEY node
              // but this will cause performance issue for long list compare
              // we just check `originList` and repeat trigger `onMotionEnd`
              if (motionType.value && originList.every(item => itemKey(item) !== MOTION_KEY)) {
                onMotionEnd()
              }
            }}
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
                <MotionTreeNode
                  {...restProps}
                  {...treeNodeProps}
                  title={title}
                  active={active}
                  pos={pos}
                  data={nodeData}
                  isStart={isStart}
                  isEnd={isEnd}
                  motion={motion}
                  motionNodes={key === MOTION_KEY ? transitionRange.value : null}
                  motionType={motionType.value}
                  onMotionStart={props.onListChangeStart}
                  onMotionEnd={onMotionEnd}
                  treeNodeRequiredProps={treeNodeRequiredProps.value}
                  onMouseMove={() => props.onActiveChange?.(null)}
                />
              )
            }}
          </VirtualListAny>
        </>
      )
    }
  },
  {
    name: 'NodeList',
    inheritAttrs: false,
  },
)

export default NodeList
