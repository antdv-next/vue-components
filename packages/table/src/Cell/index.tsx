import type { CSSProperties } from 'vue'
import type {
  AlignType,
  CellEllipsisType,
  ColumnType,
  CustomizeComponent,
  DataIndex,
  DefaultRecordType,
  ScopeType,
} from '../interface'
import { clsx } from '@v-c/util'
import { filterEmpty, getStylePxValue } from '@v-c/util/dist/props-util'
import { computed, defineComponent, isVNode, toRef } from 'vue'
import { useInjectTableContext } from '../context/TableContext'
import useCellRender from './useCellRender'
import useHoverState from './useHoverState'

export interface CellProps<RecordType extends DefaultRecordType> {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  record?: RecordType
  /** `column` index is the real show rowIndex */
  index?: number
  /** the index of the record. For the render(value, record, renderIndex) */
  renderIndex?: number
  dataIndex?: DataIndex<RecordType>
  render?: ColumnType<RecordType>['render']
  component?: CustomizeComponent
  // children?: any
  children?: any
  colSpan?: number
  rowSpan?: number
  scope?: ScopeType
  ellipsis?: CellEllipsisType
  align?: AlignType

  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean

  column?: ColumnType<RecordType>

  // Fixed
  fixStart?: number | false
  fixEnd?: number | false
  fixedStartShadow?: boolean
  fixedEndShadow?: boolean
  offsetFixedStartShadow?: number
  offsetFixedEndShadow?: number
  zIndex?: number
  zIndexReverse?: number
  allColsFixedLeft?: boolean

  // ====================== Private Props ======================
  /** @private Used for `expandable` with nest tree */
  appendNode?: any
  additionalProps?: Record<string, any>

  rowType?: 'header' | 'body' | 'footer'

  isSticky?: boolean
}

function getTitleFromCellRenderChildren({
  ellipsis,
  rowType,
  children,
}: Pick<CellProps<any>, 'ellipsis' | 'rowType' | 'children'>) {
  const ellipsisConfig = ellipsis === true ? { showTitle: true } : ellipsis
  const showTitle = !!(ellipsisConfig && typeof ellipsisConfig === 'object' && ellipsisConfig.showTitle)
  if (ellipsisConfig && (showTitle || rowType === 'header')) {
    if (typeof children === 'string' || typeof children === 'number') {
      return children.toString()
    }
    if (isVNode(children) && typeof children.children === 'string') {
      return children.children
    }
    if (Array.isArray(children)) {
      const first = filterEmpty(children)[0]
      if (typeof first === 'string' || typeof first === 'number') {
        return first.toString()
      }
      if (isVNode(first) && typeof first.children === 'string') {
        return first.children
      }
    }
  }
  return undefined
}

const Cell = defineComponent<CellProps<any>>({
  name: 'TableCell',
  props: [
    'prefixCls',
    'className',
    'style',
    'record',
    'index',
    'renderIndex',
    'dataIndex',
    'render',
    'component',
    'children',
    'colSpan',
    'rowSpan',
    'scope',
    'ellipsis',
    'align',
    'shouldCellUpdate',
    'column',
    'fixStart',
    'fixEnd',
    'fixedStartShadow',
    'fixedEndShadow',
    'offsetFixedStartShadow',
    'offsetFixedEndShadow',
    'zIndex',
    'zIndexReverse',
    'allColsFixedLeft',
    'appendNode',
    'additionalProps',
    'rowType',
    'isSticky',
  ] as any,
  setup(props, { slots }) {
    const tableContext = useInjectTableContext()
    const slotChildren = computed(() => props.children ?? slots?.default?.())

    const recordRef = toRef(props, 'record')
    const dataIndexRef = toRef(props, 'dataIndex')
    const renderRef = toRef(props, 'render')
    const shouldCellUpdateRef = toRef(props, 'shouldCellUpdate')
    const renderIndexRef = computed(() => props.renderIndex ?? props.index ?? 0)

    const cellRender = useCellRender(
      recordRef as any,
      dataIndexRef as any,
      renderIndexRef,
      slotChildren,
      renderRef as any,
      shouldCellUpdateRef as any,
    )

    return () => {
      const {
        component: Component = 'td',
        ellipsis,
        scope,
        prefixCls,
        className,
        style,
        align,
        record,
        index,
        rowType,
        colSpan,
        rowSpan,
        fixStart,
        fixEnd,
        fixedStartShadow,
        fixedEndShadow,
        offsetFixedStartShadow,
        offsetFixedEndShadow,
        zIndex,
        zIndexReverse,
        additionalProps = {},
        isSticky,
        appendNode,
      } = props

      const cellPrefixCls = `${prefixCls}-cell`
      const mergedAppendNode = appendNode ?? slots?.appendNode?.()
      const [childNode, legacyCellProps] = cellRender.value

      const fixedStyle: CSSProperties = {}
      const isFixStart = typeof fixStart === 'number' && !tableContext.allColumnsFixedLeft
      const isFixEnd = typeof fixEnd === 'number' && !tableContext.allColumnsFixedLeft

      const [absScroll = 0, scrollWidth = 0] = tableContext.scrollInfo || []
      const [showFixStartShadow, showFixEndShadow] = (() => {
        if (!isFixStart && !isFixEnd) {
          return [false, false]
        }
        const showStartShadow = isFixStart && fixedStartShadow
          ? absScroll - (offsetFixedStartShadow || 0) >= 1
          : false
        const showEndShadow = isFixEnd && fixedEndShadow
          ? scrollWidth - absScroll - (offsetFixedEndShadow || 0) > 1
          : false

        return [showStartShadow, showEndShadow]
      })()

      if (isFixStart) {
        fixedStyle.insetInlineStart = getStylePxValue(fixStart as number)
        fixedStyle['--z-offset' as any] = zIndex
        fixedStyle['--z-offset-reverse' as any] = zIndexReverse
      }
      if (isFixEnd) {
        fixedStyle.insetInlineEnd = getStylePxValue(fixEnd as number)
        fixedStyle['--z-offset' as any] = zIndex
        fixedStyle['--z-offset-reverse' as any] = zIndexReverse
      }

      const mergedColSpan = legacyCellProps?.colSpan ?? additionalProps.colSpan ?? colSpan ?? 1
      const mergedRowSpan = legacyCellProps?.rowSpan ?? additionalProps.rowSpan ?? rowSpan ?? 1

      const [hovering, onHover] = useHoverState(index!, mergedRowSpan)

      const onMouseEnter = (event: MouseEvent) => {
        if (record) {
          onHover(index!, index! + mergedRowSpan - 1)
        }
        const onMouseEnterHandler = additionalProps.onMouseEnter || additionalProps.onMouseenter
        onMouseEnterHandler?.(event)
      }

      const onMouseLeave = (event: MouseEvent) => {
        if (record) {
          onHover(-1, -1)
        }
        const onMouseLeaveHandler = additionalProps.onMouseLeave || additionalProps.onMouseleave
        onMouseLeaveHandler?.(event)
      }

      if (mergedColSpan === 0 || mergedRowSpan === 0) {
        return null
      }

      const title = additionalProps.title ?? getTitleFromCellRenderChildren({
        rowType,
        ellipsis,
        children: childNode,
      })

      const additionalClassName = additionalProps.className || additionalProps.class
      const mergedClassName = clsx(
        cellPrefixCls,
        className,
        {
          [`${cellPrefixCls}-fix`]: isFixStart || isFixEnd,
          [`${cellPrefixCls}-fix-start`]: isFixStart,
          [`${cellPrefixCls}-fix-end`]: isFixEnd,
          [`${cellPrefixCls}-fix-start-shadow`]: fixedStartShadow,
          [`${cellPrefixCls}-fix-start-shadow-show`]: fixedStartShadow && showFixStartShadow,
          [`${cellPrefixCls}-fix-end-shadow`]: fixedEndShadow,
          [`${cellPrefixCls}-fix-end-shadow-show`]: fixedEndShadow && showFixEndShadow,
          [`${cellPrefixCls}-ellipsis`]: ellipsis,
          [`${cellPrefixCls}-with-append`]: mergedAppendNode,
          [`${cellPrefixCls}-fix-sticky`]: (isFixStart || isFixEnd) && isSticky,
          [`${cellPrefixCls}-row-hover`]: !legacyCellProps && hovering.value,
        },
        additionalClassName,
        legacyCellProps?.className,
      )

      const alignStyle: CSSProperties = {}
      if (align) {
        alignStyle.textAlign = align as any
      }

      const mergedStyle: CSSProperties = {
        ...legacyCellProps?.style,
        ...fixedStyle,
        ...alignStyle,
        ...additionalProps.style,
        ...style,
      }

      let mergedChildNode: any = childNode
      if (typeof mergedChildNode === 'object' && !Array.isArray(mergedChildNode) && !isVNode(mergedChildNode)) {
        mergedChildNode = null
      }

      if (ellipsis && (fixedStartShadow || fixedEndShadow)) {
        mergedChildNode = <span class={`${cellPrefixCls}-content`}>{mergedChildNode}</span>
      }

      return (
        <Component
          {...legacyCellProps}
          {...additionalProps}
          class={mergedClassName}
          style={mergedStyle}
          title={title}
          scope={scope}
          onMouseenter={tableContext.rowHoverable ? onMouseEnter : undefined}
          onMouseleave={tableContext.rowHoverable ? onMouseLeave : undefined}
          colSpan={mergedColSpan !== 1 ? mergedColSpan : null}
          rowSpan={mergedRowSpan !== 1 ? mergedRowSpan : null}
        >
          {mergedAppendNode}
          {mergedChildNode}
        </Component>
      )
    }
  },
})

export default Cell as any
