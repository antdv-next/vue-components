import type { TreeNodeProps } from './interface'
import { clsx } from '@v-c/util'
import { getId } from '@v-c/util/dist/hooks/useId'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, defineComponent, inject, ref, watchEffect } from 'vue'
import { TreeContextKey, UnstableContextKey } from './contextTypes'
import Indent from './Indent'
import getEntity from './utils/keyUtil'
import { convertNodePropsToEventData, isLeafNode } from './utils/treeUtil'

const ICON_OPEN = 'open'
const ICON_CLOSE = 'close'
const defaultTitle = '---'

const TreeNode = defineComponent<TreeNodeProps>(
  (props, { attrs }) => {
    const context = inject(TreeContextKey, null as any)
    const unstableContext = inject(UnstableContextKey, {} as any)

    const nodeId = computed(() => getId(props.treeId || '', `${props.eventKey!}`))

    const dragNodeHighlight = ref(false)

    const isDisabled = computed(() => {
      return !!(context.disabled || props.disabled || unstableContext.nodeDisabled?.(props.data))
    })

    const isCheckable = computed(() => {
      if (!context.checkable || props.checkable === false)
        return false
      return context.checkable
    })

    const isSelectable = computed(() => {
      if (typeof props.selectable === 'boolean')
        return props.selectable
      return context.selectable
    })

    const hasChildren = computed(() => {
      const { children } = getEntity(context.keyEntities, props.eventKey!) || {}
      return Boolean((children || []).length)
    })

    const memoizedIsLeaf = computed(() => {
      return isLeafNode(props.isLeaf, context.loadData, hasChildren.value, props.loaded)
    })

    watchEffect(() => {
      if (props.loading)
        return
      if (typeof context.loadData === 'function' && props.expanded && !memoizedIsLeaf.value && !props.loaded) {
        context.onNodeLoad(convertNodePropsToEventData(props))
      }
    })

    const nodeState = computed(() => {
      if (memoizedIsLeaf.value)
        return null
      return props.expanded ? ICON_OPEN : ICON_CLOSE
    })

    const onSelect = (e: MouseEvent) => {
      if (isDisabled.value)
        return
      context.onNodeSelect(e, convertNodePropsToEventData(props))
    }

    const onCheck = (e: MouseEvent) => {
      if (isDisabled.value)
        return
      if (!isCheckable.value || props.disableCheckbox)
        return
      context.onNodeCheck(e, convertNodePropsToEventData(props), !props.checked)
    }

    const onSelectorClick = (e: MouseEvent) => {
      context.onNodeClick(e, convertNodePropsToEventData(props))
      if (isSelectable.value)
        onSelect(e)
      else onCheck(e)
    }

    const onSelectorDoubleClick = (e: MouseEvent) => {
      context.onNodeDoubleClick(e, convertNodePropsToEventData(props))
    }

    const onMouseEnter = (e: MouseEvent) => {
      context.onNodeMouseEnter(e, convertNodePropsToEventData(props))
    }

    const onMouseLeave = (e: MouseEvent) => {
      context.onNodeMouseLeave(e, convertNodePropsToEventData(props))
    }

    const onContextMenu = (e: MouseEvent) => {
      context.onNodeContextMenu(e, convertNodePropsToEventData(props))
    }

    const isDraggable = computed(() => {
      return !!(context.draggable && (!context.draggable.nodeDraggable || context.draggable.nodeDraggable(props.data)))
    })

    const onDragStart = (e: DragEvent) => {
      e.stopPropagation()
      dragNodeHighlight.value = true
      context.onNodeDragStart(e, props)
      try {
        e.dataTransfer?.setData('text/plain', '')
      }
      catch {}
    }

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      context.onNodeDragEnter(e, props)
    }

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      context.onNodeDragOver(e, props)
    }

    const onDragLeave = (e: DragEvent) => {
      e.stopPropagation()
      context.onNodeDragLeave(e, props)
    }

    const onDragEnd = (e: DragEvent) => {
      e.stopPropagation()
      dragNodeHighlight.value = false
      context.onNodeDragEnd(e, props)
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragNodeHighlight.value = false
      context.onNodeDrop(e, props)
    }

    const onExpand = (e: MouseEvent) => {
      if (props.loading)
        return
      context.onNodeExpand(e, convertNodePropsToEventData(props))
    }

    const renderSwitcherIconDom = (isInternalLeaf: boolean) => {
      const switcherIcon = props.switcherIcon || context.switcherIcon
      if (typeof switcherIcon === 'function')
        return (switcherIcon as any)({ ...props, isLeaf: isInternalLeaf })
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
      if (!(!props.disabled && rootDraggable && context.dragOverNodeKey === props.eventKey))
        return null
      if (context.dropPosition === null || context.dropLevelOffset === null || context.indent === null)
        return null

      return context.dropIndicatorRender({
        dropPosition: context.dropPosition,
        dropLevelOffset: context.dropLevelOffset,
        indent: context.indent,
        prefixCls: context.prefixCls,
        direction: context.direction,
      })
    })

    const checkboxNode = computed(() => {
      if (!isCheckable.value)
        return null
      const { checked, halfChecked, disableCheckbox } = props
      const prefixCls = context.prefixCls

      const custom = typeof isCheckable.value !== 'boolean' ? isCheckable.value : null

      return (
        <span
          class={clsx(`${prefixCls}-checkbox`, {
            [`${prefixCls}-checkbox-checked`]: checked,
            [`${prefixCls}-checkbox-indeterminate`]: !checked && halfChecked,
            [`${prefixCls}-checkbox-disabled`]: isDisabled.value || disableCheckbox,
          })}
          onClick={onCheck}
          role="checkbox"
          aria-checked={halfChecked ? 'mixed' : checked}
          aria-disabled={isDisabled.value || disableCheckbox}
          aria-labelledby={nodeId.value}
        >
          {custom}
        </span>
      )
    })

    const selectorNode = computed(() => {
      const title = props.title ?? defaultTitle
      const wrapClass = `${context.prefixCls}-node-content-wrapper`

      let icon
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
                {typeof currentIcon === 'function' ? (currentIcon as any)(props) : currentIcon}
              </span>
            )
          : iconNode.value
      }
      else if (context.loadData && props.loading) {
        icon = iconNode.value
      }

      let titleNode
      if (typeof title === 'function') {
        titleNode = (title as any)(props.data)
      }
      else if (context.titleRender) {
        let _titleRender = context.titleRender(props.data)
        _titleRender = Array.isArray(_titleRender) ? _titleRender : [_titleRender]
        _titleRender = filterEmpty(_titleRender).filter(Boolean)
        titleNode = _titleRender.length ? _titleRender : title
      }
      else {
        titleNode = title
      }

      return (
        <span
          title={typeof title === 'string' ? title : ''}
          class={clsx(wrapClass, `${wrapClass}-${nodeState.value || 'normal'}`, {
            [`${context.prefixCls}-node-selected`]:
              !isDisabled.value && (props.selected || dragNodeHighlight.value),
          })}
          onMouseenter={onMouseEnter}
          onMouseleave={onMouseLeave}
          onContextmenu={onContextMenu}
          onClick={onSelectorClick}
          onDblclick={onSelectorDoubleClick}
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
      if (!context.draggable?.icon)
        return null
      return <span class={`${context.prefixCls}-draggable-icon`}>{context.draggable.icon}</span>
    })

    const dataOrAriaAttributeProps = computed(() => pickAttrs(attrs, { aria: true, data: true }))

    const level = computed(() => (getEntity(context.keyEntities, props.eventKey!) || {}).level || 0)
    const isEndNode = computed(() => !!props.isEnd?.[props.isEnd.length - 1])
    const draggableWithoutDisabled = computed(() => !isDisabled.value && isDraggable.value)

    return () => {
      const filterNode = context.filterTreeNode?.(convertNodePropsToEventData(props))

      return (
        <div
          role="treeitem"
          id={nodeId.value}
          aria-expanded={memoizedIsLeaf.value ? undefined : props.expanded}
          aria-selected={isSelectable.value && !isDisabled.value ? props.selected : undefined}
          aria-checked={isCheckable.value && !isDisabled.value ? (props.halfChecked ? 'mixed' : props.checked) : undefined}
          aria-disabled={isDisabled.value}
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
            'dragging': context.draggingNodeKey === props.eventKey,
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
          onDragstart={draggableWithoutDisabled.value ? onDragStart : undefined}
          onDragenter={isDraggable.value ? onDragEnter : undefined}
          onDragover={isDraggable.value ? onDragOver : undefined}
          onDragleave={isDraggable.value ? onDragLeave : undefined}
          onDrop={isDraggable.value ? onDrop : undefined}
          onDragend={isDraggable.value ? onDragEnd : undefined}
          onMousemove={props.onMouseMove}
          {...dataOrAriaAttributeProps.value}
        >
          <Indent
            prefixCls={context.prefixCls}
            level={level.value}
            isStart={props.isStart || []}
            isEnd={props.isEnd || []}
          />
          {dragHandlerNode.value}
          {renderSwitcher()}
          {checkboxNode.value}
          {selectorNode.value}
        </div>
      )
    }
  },
  {
    name: 'TreeNode',
    inheritAttrs: false,
  },
)

;(TreeNode as any).isTreeNode = true

export default TreeNode
