import type { PropType } from 'vue'
import type { TreeNodeProps } from './interface'
import { clsx } from '@v-c/util'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed, defineComponent, inject, ref, watchEffect } from 'vue'
import { TreeContextKey, UnstableContextKey } from './contextTypes'
import Indent from './Indent'
import getEntity from './utils/keyUtil'
import { convertNodePropsToEventData } from './utils/treeUtil'

const ICON_OPEN = 'open'
const ICON_CLOSE = 'close'

const defaultTitle = '---'

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    eventKey: [String, Number] as PropType<string | number>,
    className: String,
    style: Object as PropType<any>,
    id: String,
    expanded: Boolean,
    selected: Boolean,
    checked: Boolean,
    loaded: Boolean,
    loading: Boolean,
    halfChecked: Boolean,
    title: [String, Number, Object, Function] as PropType<any>,
    dragOver: Boolean,
    dragOverGapTop: Boolean,
    dragOverGapBottom: Boolean,
    pos: String,
    domRef: Object as PropType<HTMLDivElement>,
    data: Object as PropType<any>,
    isStart: Array as PropType<boolean[]>,
    isEnd: Array as PropType<boolean[]>,
    active: Boolean,
    onMouseMove: Function as PropType<(e: MouseEvent) => void>,
    isLeaf: Boolean,
    checkable: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    selectable: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    disabled: Boolean,
    disableCheckbox: Boolean,
    icon: [String, Number, Object, Function] as PropType<any>,
    switcherIcon: [String, Number, Object, Function] as PropType<any>,
  },
  inheritAttrs: false,
  setup(props, { attrs }) {
    const context = inject(TreeContextKey, null as any)
    const unstableContext = inject(UnstableContextKey, {})

    const dragNodeHighlight = ref(false)

    const isDisabled = computed(
      () => !!(context.disabled || props.disabled || unstableContext.nodeDisabled?.(props.data)),
    )

    const isCheckable = computed(() => {
      if (!context.checkable || props.checkable === false) {
        return false
      }
      return context.checkable
    })

    const isSelectable = computed(() => {
      if (typeof props.selectable === 'boolean') {
        return props.selectable
      }
      return context.selectable
    })

    const hasChildren = computed(() => {
      const { children } = getEntity(context.keyEntities, props.eventKey!) || ({} as any)
      return Boolean((children || []).length)
    })

    const memoizedIsLeaf = computed(() => {
      if (props.isLeaf === false) {
        return false
      }
      return (
        props.isLeaf
        || (!context.loadData && !hasChildren.value)
        || (context.loadData && props.loaded && !hasChildren.value)
      )
    })

    watchEffect(() => {
      if (props.loading) {
        return
      }

      if (typeof context.loadData === 'function' && props.expanded && !memoizedIsLeaf.value && !props.loaded) {
        context.onNodeLoad(convertNodePropsToEventData(props as any))
      }
    })

    const nodeState = computed(() => {
      if (memoizedIsLeaf.value) {
        return null
      }
      return props.expanded ? ICON_OPEN : ICON_CLOSE
    })

    const onSelect = (e: MouseEvent) => {
      if (isDisabled.value) {
        return
      }
      context.onNodeSelect(e, convertNodePropsToEventData(props as any))
    }

    const onCheck = (e: MouseEvent) => {
      if (isDisabled.value) {
        return
      }
      if (!isCheckable.value || props.disableCheckbox) {
        return
      }
      context.onNodeCheck(e, convertNodePropsToEventData(props as any), !props.checked)
    }

    const onSelectorClick = (e: MouseEvent) => {
      context.onNodeClick(e, convertNodePropsToEventData(props as any))
      if (isSelectable.value) {
        onSelect(e)
      }
      else {
        onCheck(e)
      }
    }

    const onSelectorDoubleClick = (e: MouseEvent) => {
      context.onNodeDoubleClick(e, convertNodePropsToEventData(props as any))
    }

    const onMouseEnter = (e: MouseEvent) => {
      context.onNodeMouseEnter(e, convertNodePropsToEventData(props as any))
    }

    const onMouseLeave = (e: MouseEvent) => {
      context.onNodeMouseLeave(e, convertNodePropsToEventData(props as any))
    }

    const onContextMenu = (e: MouseEvent) => {
      context.onNodeContextMenu(e, convertNodePropsToEventData(props as any))
    }

    const isDraggable = computed(() => {
      return !!(
        context.draggable && (!context.draggable.nodeDraggable || context.draggable.nodeDraggable(props.data))
      )
    })

    const onDragStart = (e: DragEvent) => {
      e.stopPropagation()
      dragNodeHighlight.value = true
      context.onNodeDragStart(e, props as any)
      try {
        e.dataTransfer?.setData('text/plain', '')
      }
      catch {
        // noop
      }
    }

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      context.onNodeDragEnter(e, props as any)
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      context.onNodeDragOver(e, props as any)
    }

    const onDragLeave = (e: DragEvent) => {
      e.stopPropagation()
      context.onNodeDragLeave(e, props as any)
    }

    const onDragEnd = (e: DragEvent) => {
      e.stopPropagation()
      dragNodeHighlight.value = false
      context.onNodeDragEnd(e, props as any)
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragNodeHighlight.value = false
      context.onNodeDrop(e, props as any)
    }

    const onExpand = (e: MouseEvent) => {
      if (props.loading) {
        return
      }
      context.onNodeExpand(e, convertNodePropsToEventData(props as any))
    }

    const renderSwitcherIconDom = (isInternalLeaf: boolean) => {
      const switcherIcon = props.switcherIcon || context.switcherIcon
      if (typeof switcherIcon === 'function') {
        return switcherIcon({ ...(props as any), isLeaf: isInternalLeaf })
      }
      return switcherIcon
    }

    const renderSwitcher = () => {
      if (memoizedIsLeaf.value) {
        const switcherIconDom = renderSwitcherIconDom(true)
        return switcherIconDom !== false
          ? (
              <span class={clsx(`${context.prefixCls}-switcher`, `${context.prefixCls}-switcher-noop`)}>
                {switcherIconDom}
              </span>
            )
          : null
      }
      const switcherIconDom = renderSwitcherIconDom(false)
      return switcherIconDom !== false
        ? (
            <span
              onClick={onExpand}
              class={clsx(
                `${context.prefixCls}-switcher`,
                `${context.prefixCls}-switcher_${props.expanded ? ICON_OPEN : ICON_CLOSE}`,
              )}
            >
              {switcherIconDom}
            </span>
          )
        : null
    }

    const iconNode = computed(() => {
      return (
        <span
          class={clsx(
            context.classNames?.itemIcon,
            `${context.prefixCls}-iconEle`,
            `${context.prefixCls}-icon__${nodeState.value || 'docu'}`,
            { [`${context.prefixCls}-icon_loading`]: props.loading },
          )}
          style={context.styles?.itemIcon}
        />
      )
    })

    const dropIndicatorNode = computed(() => {
      const rootDraggable = Boolean(context.draggable)
      const showIndicator = !props.disabled && rootDraggable && context.dragOverNodeKey === props.eventKey
      if (!showIndicator) {
        return null
      }
      if (context.dropPosition === null || context.dropLevelOffset === null || context.indent === null) {
        return null
      }
      return context.dropIndicatorRender({
        dropPosition: context.dropPosition,
        dropLevelOffset: context.dropLevelOffset,
        indent: context.indent,
        prefixCls: context.prefixCls,
        direction: context.direction,
      })
    })

    const checkboxNode = computed(() => {
      if (!isCheckable.value) {
        return null
      }

      const custom = typeof isCheckable.value !== 'boolean' ? isCheckable.value : null

      return (
        <span
          class={clsx(`${context.prefixCls}-checkbox`, {
            [`${context.prefixCls}-checkbox-checked`]: props.checked,
            [`${context.prefixCls}-checkbox-indeterminate`]: !props.checked && props.halfChecked,
            [`${context.prefixCls}-checkbox-disabled`]: isDisabled.value || props.disableCheckbox,
          })}
          onClick={onCheck}
          role="checkbox"
          aria-checked={props.halfChecked ? 'mixed' : props.checked}
          aria-disabled={isDisabled.value || props.disableCheckbox}
          aria-label={`Select ${typeof props.title === 'string' ? props.title : 'tree node'}`}
        >
          {custom}
        </span>
      )
    })

    const selectorNode = computed(() => {
      const title = props.title ?? defaultTitle

      const wrapClass = `${context.prefixCls}-node-content-wrapper`

      let icon: any

      if (context.showIcon) {
        const currentIcon = props.icon || context.icon
        icon = currentIcon
          ? (
              <span
                class={clsx(
                  context.classNames?.itemIcon,
                  `${context.prefixCls}-iconEle`,
                  `${context.prefixCls}-icon__customize`,
                )}
                style={context.styles?.itemIcon}
              >
                {typeof currentIcon === 'function' ? currentIcon(props as any) : currentIcon}
              </span>
            )
          : (
              iconNode.value
            )
      }
      else if (context.loadData && props.loading) {
        icon = iconNode.value
      }

      let titleNode: any
      if (typeof title === 'function') {
        titleNode = title(props.data)
      }
      else if (context.titleRender) {
        titleNode = context.titleRender(props.data)
      }
      else {
        titleNode = title
      }

      return (
        <span
          title={typeof title === 'string' ? title : ''}
          class={clsx(wrapClass, `${wrapClass}-${nodeState.value || 'normal'}`, {
            [`${context.prefixCls}-node-selected`]: !isDisabled.value && (props.selected || dragNodeHighlight.value),
          })}
          onMouseenter={onMouseEnter as any}
          onMouseleave={onMouseLeave as any}
          onContextmenu={onContextMenu as any}
          onClick={onSelectorClick as any}
          onDblclick={onSelectorDoubleClick as any}
        >
          {icon}
          <span class={clsx(`${context.prefixCls}-title`, context.classNames?.itemTitle)} style={context.styles?.itemTitle}>
            {titleNode}
          </span>
          {dropIndicatorNode.value}
        </span>
      )
    })

    const dragHandlerNode = computed(() => {
      if (!context.draggable?.icon) {
        return null
      }
      return <span class={`${context.prefixCls}-draggable-icon`}>{context.draggable.icon}</span>
    })

    const dataOrAriaAttributeProps = computed(() => pickAttrs(attrs, { aria: true, data: true }))

    const level = computed(() => (getEntity(context.keyEntities, props.eventKey!) || ({} as any)).level || 0)
    const isEndNode = computed(() => !!props.isEnd?.[props.isEnd.length - 1])

    const draggableWithoutDisabled = computed(() => !isDisabled.value && isDraggable.value)

    return () => {
      const filterNode = context.filterTreeNode?.(convertNodePropsToEventData(props as any))

      return (
        <div
          role="treeitem"
          aria-expanded={memoizedIsLeaf.value ? undefined : props.expanded}
          aria-selected={context.selectable ? props.selected : undefined}
          data-selectable={props.selectable === false ? 'false' : undefined}
          class={clsx(props.className, `${context.prefixCls}-treenode`, context.classNames?.item, {
            [`${context.prefixCls}-treenode-disabled`]: isDisabled.value,
            [`${context.prefixCls}-treenode-switcher-${props.expanded ? 'open' : 'close'}`]: !memoizedIsLeaf.value,
            [`${context.prefixCls}-treenode-checkbox-checked`]: props.checked,
            [`${context.prefixCls}-treenode-checkbox-indeterminate`]: props.halfChecked,
            [`${context.prefixCls}-treenode-selected`]: props.selected,
            [`${context.prefixCls}-treenode-loading`]: props.loading,
            [`${context.prefixCls}-treenode-active`]: props.active,
            [`${context.prefixCls}-treenode-leaf-last`]: isEndNode.value,
            [`${context.prefixCls}-treenode-draggable`]: isDraggable.value,
            dragging: context.draggingNodeKey === props.eventKey,
            'drop-target': context.dropTargetKey === props.eventKey,
            'drop-container': context.dropContainerKey === props.eventKey,
            'drag-over': !isDisabled.value && props.dragOver,
            'drag-over-gap-top': !isDisabled.value && props.dragOverGapTop,
            'drag-over-gap-bottom': !isDisabled.value && props.dragOverGapBottom,
            'filter-node': !!filterNode,
            [`${context.prefixCls}-treenode-leaf`]: memoizedIsLeaf.value,
          })}
          style={{ ...(props.style || {}), ...(context.styles?.item || {}) }}
          draggable={draggableWithoutDisabled.value}
          onDragstart={draggableWithoutDisabled.value ? (onDragStart as any) : undefined}
          onDragenter={isDraggable.value ? (onDragEnter as any) : undefined}
          onDragover={isDraggable.value ? (onDragOver as any) : undefined}
          onDragleave={isDraggable.value ? (onDragLeave as any) : undefined}
          onDrop={isDraggable.value ? (onDrop as any) : undefined}
          onDragend={isDraggable.value ? (onDragEnd as any) : undefined}
          onMousemove={props.onMouseMove as any}
          {...dataOrAriaAttributeProps.value}
        >
          <Indent prefixCls={context.prefixCls} level={level.value} isStart={props.isStart || []} isEnd={props.isEnd || []} />
          {dragHandlerNode.value}
          {renderSwitcher()}
          {checkboxNode.value}
          {selectorNode.value}
        </div>
      )
    }
  },
})

;(TreeNode as any).isTreeNode = true

export type { TreeNodeProps }
export default TreeNode
