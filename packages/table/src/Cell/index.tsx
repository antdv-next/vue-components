import type { CSSProperties } from 'vue'
import type {
  AlignType,
  CellEllipsisType,
  CellType,
  ColumnType,
  CustomizeComponent,
  DataIndex,
  DefaultRecordType,
  RenderedCell,
  ScopeType,
} from '../interface'
import { clsx, warning } from '@v-c/util'
import { filterEmpty, getStylePxValue } from '@v-c/util/dist/props-util'
import getValue from '@v-c/util/dist/utils/get'
import { computed, defineComponent, isVNode, shallowRef, toRaw, watch } from 'vue'
import { useInjectPerfContext } from '../context/PerfContext'
import { useInjectTableContext } from '../context/TableContext'
import { validateValue } from '../utils/valueUtil'
import useHoverState from './useHoverState'

export interface CellProps<RecordType extends DefaultRecordType> {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  record?: RecordType
  /** `column` index is the real show rowIndex */
  index?: number
  /** `colIndex` is for column position, mainly for header cells */
  colIndex?: number
  /** the index of the record. For the render(value, record, renderIndex) */
  renderIndex?: number
  dataIndex?: DataIndex<RecordType>
  render?: ColumnType<RecordType>['render']
  component?: CustomizeComponent
  // children?: any
  children?: any
  colSpan?: number
  rowSpan?: number
  /** @private Original rowSpan before patching it for expanded rows */
  hoverRowSpan?: number
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

function isRenderCell<RecordType>(data: any): data is RenderedCell<RecordType> {
  return data && typeof data === 'object' && !Array.isArray(data) && !isVNode(data)
}

function resolveCellRender<RecordType>({
  record,
  dataIndex,
  renderIndex,
  children,
  render,
  perfRecord,
}: {
  record: RecordType | undefined
  dataIndex: DataIndex<RecordType> | undefined
  renderIndex: number
  children: any
  render?: ColumnType<RecordType>['render']
  perfRecord?: { renderWithProps: boolean }
}): [any, CellType<RecordType>?] | [any] {
  if (validateValue(children)) {
    return [children]
  }

  const path
    = dataIndex === null || dataIndex === undefined || dataIndex === ''
      ? []
      : Array.isArray(dataIndex)
        ? dataIndex
        : [dataIndex]

  const value: any = getValue(record as any, path as any)
  let returnChildNode = value
  let returnCellProps: CellType<RecordType> | undefined

  if (render) {
    const renderData = render(value, record as RecordType, renderIndex)
    if (isRenderCell<RecordType>(renderData)) {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          false,
          '`columns.render` return cell props is deprecated with perf issue, please use `onCell` instead.',
        )
      }
      returnChildNode = renderData.props?.children ?? renderData.children
      returnCellProps = renderData.props
      if (perfRecord) {
        perfRecord.renderWithProps = true
      }
    }
    else {
      returnChildNode = renderData
    }
  }

  return [returnChildNode, returnCellProps] as [any, CellType<RecordType>?] | [any]
}

const Cell = defineComponent<CellProps<any>>({
  name: 'TableCell',
  props: [
    'prefixCls',
    'className',
    'style',
    'record',
    'index',
    'colIndex',
    'renderIndex',
    'dataIndex',
    'render',
    'component',
    'children',
    'colSpan',
    'rowSpan',
    'hoverRowSpan',
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
    const perfRecord = useInjectPerfContext()

    const isFixStart = computed(() => {
      return typeof props.fixStart === 'number' && !tableContext.allColumnsFixedLeft
    })

    const isFixEnd = computed(() => {
      return typeof props.fixEnd === 'number' && !tableContext.allColumnsFixedLeft
    })

    const shadowInfo = computed(() => {
      // Skip scrollInfo subscription for non-fixed cells. Reading
      // tableContext.scrollInfo before this early return made every cell
      // re-render on horizontal scroll, even though the result was constant.
      if (!isFixStart.value && !isFixEnd.value) {
        return [false, false]
      }
      const { fixedEndShadow, offsetFixedStartShadow, offsetFixedEndShadow, fixedStartShadow } = props
      const [absScroll = 0, scrollWidth = 0] = tableContext.scrollInfo || []
      const showStartShadow = isFixStart.value && fixedStartShadow
        ? absScroll - (offsetFixedStartShadow || 0) >= 1
        : false
      const showEndShadow = isFixEnd && fixedEndShadow
        ? scrollWidth - absScroll - (offsetFixedEndShadow || 0) > 1
        : false

      return [showStartShadow, showEndShadow]
    })

    // ====================== Render Memo ======================
    // The expensive part of a cell is the user `render` / `bodyCell` (`headerCell`)
    // call. Without memoization every unrelated ancestor re-render (e.g. toggling
    // table `loading`) re-runs them for every cell. We cache the produced child
    // node and only recompute when the inputs that actually feed the render change.
    // This mirrors rc-table's `useCellRender` + `React.memo(Cell)` behavior.
    const computeContent = (): { rawChildNode: any, legacyCellProps: CellType<any> | undefined } => {
      const { record, dataIndex, index, renderIndex, render, rowType } = props
      // `column` / `colIndex` are only forwarded as context to `bodyCell` /
      // `headerCell`. Upstream `useColumns` rebuilds the column objects on every
      // table render, so tracking them would invalidate the memo on unrelated
      // re-renders (e.g. `loading`). Their content is stable, so read them raw to
      // avoid tracking their identity churn (rc-table keeps `column` out of the
      // cell render memo deps for the same reason).
      const rawProps = toRaw(props)
      const column = rawProps.column
      const colIndex = rawProps.colIndex
      const mergedRenderIndex = renderIndex ?? index ?? 0
      const slotChildren = props.children ?? slots?.default?.()
      const [childNode, legacyCellProps] = resolveCellRender({
        record,
        dataIndex,
        renderIndex: mergedRenderIndex,
        children: slotChildren,
        render,
        perfRecord,
      })

      let rawChildNode: any = childNode
      const renderCell = rowType === 'header'
        ? tableContext.headerCell
        : rowType === 'body'
          ? tableContext.bodyCell
          : undefined

      if (renderCell && column) {
        const ctxIndex = rowType === 'header' ? (colIndex ?? 0) : mergedRenderIndex
        const renderCellNode = rowType === 'body'
          ? renderCell({ column, index: ctxIndex, text: childNode, record })
          : renderCell({ column, index: ctxIndex, text: childNode } as any)
        if (Array.isArray(renderCellNode)) {
          const filteredNodes = filterEmpty(renderCellNode)
          if (filteredNodes.length > 0) {
            rawChildNode = filteredNodes
          }
        }
        else if (renderCellNode !== null && renderCellNode !== undefined) {
          rawChildNode = renderCellNode
        }
      }

      return { rawChildNode, legacyCellProps }
    }

    let readContent: () => { rawChildNode: any, legacyCellProps: CellType<any> | undefined }

    if (typeof props.shouldCellUpdate === 'function') {
      // Explicit opt-out: recompute only when `shouldCellUpdate(next, prev)` allows
      // it (compared by record), gating every other input as well. Computed lazily
      // during render so slot invocations stay inside the render phase.
      let dirty = true
      let cached: { rawChildNode: any, legacyCellProps: CellType<any> | undefined }
      const tick = shallowRef(0)
      watch(
        [
          () => props.record,
          () => props.dataIndex,
          () => props.index,
          () => props.renderIndex,
          () => props.render,
          () => props.rowType,
          () => props.children,
          () => tableContext.bodyCell,
          () => tableContext.headerCell,
        ],
        (next, prev) => {
          const nextRecord = next[0]
          const prevRecord = prev[0]
          if (props.shouldCellUpdate && !props.shouldCellUpdate(nextRecord, prevRecord)) {
            return
          }
          dirty = true
          tick.value += 1
        },
      )
      readContent = () => {
        // Subscribe the render effect to recompute decisions.
        void tick.value
        if (dirty || !cached) {
          cached = computeContent()
          dirty = false
        }
        return cached
      }
    }
    else {
      // Default path: a computed auto-tracks the reactive state actually read while
      // rendering (record fields, slot deps, ...), so it never goes stale yet skips
      // recomputation when nothing relevant changed.
      const contentMemo = computed(computeContent)
      readContent = () => contentMemo.value
    }

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
        hoverRowSpan,
        fixStart,
        fixEnd,
        fixedStartShadow,
        fixedEndShadow,
        zIndex,
        zIndexReverse,
        additionalProps = {},
        isSticky,
        appendNode,
      } = props
      const cellPrefixCls = `${prefixCls}-cell`
      const mergedAppendNode = appendNode ?? slots?.appendNode?.()
      const { rawChildNode, legacyCellProps } = readContent()
      const fixedStyle: CSSProperties = {}
      const [showFixStartShadow, showFixEndShadow] = shadowInfo.value
      if (isFixStart.value) {
        fixedStyle.insetInlineStart = getStylePxValue(fixStart as number)
        fixedStyle['--z-offset' as any] = zIndex
        fixedStyle['--z-offset-reverse' as any] = zIndexReverse
      }
      if (isFixEnd.value) {
        fixedStyle.insetInlineEnd = getStylePxValue(fixEnd as number)
        fixedStyle['--z-offset' as any] = zIndex
        fixedStyle['--z-offset-reverse' as any] = zIndexReverse
      }

      const mergedColSpan = legacyCellProps?.colSpan ?? additionalProps.colSpan ?? colSpan ?? 1
      const mergedRowSpan = legacyCellProps?.rowSpan ?? additionalProps.rowSpan ?? rowSpan ?? 1
      const mergedHoverRowSpan = legacyCellProps?.rowSpan ?? hoverRowSpan ?? mergedRowSpan

      const [hovering, onHover] = useHoverState(index!, mergedHoverRowSpan, tableContext)

      const onMouseEnter = (event: MouseEvent) => {
        if (record) {
          onHover(index!, index! + mergedHoverRowSpan - 1)
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

      let mergedChildNode: any = rawChildNode

      const title = additionalProps.title ?? getTitleFromCellRenderChildren({
        rowType,
        ellipsis,
        children: mergedChildNode,
      })

      const additionalClassName = additionalProps.className || additionalProps.class
      const mergedClassName = clsx(
        cellPrefixCls,
        className,
        {
          [`${cellPrefixCls}-fix`]: isFixStart.value || isFixEnd.value,
          [`${cellPrefixCls}-fix-start`]: isFixStart.value,
          [`${cellPrefixCls}-fix-end`]: isFixEnd.value,
          [`${cellPrefixCls}-fix-start-shadow`]: fixedStartShadow,
          [`${cellPrefixCls}-fix-start-shadow-show`]: fixedStartShadow && showFixStartShadow,
          [`${cellPrefixCls}-fix-end-shadow`]: fixedEndShadow,
          [`${cellPrefixCls}-fix-end-shadow-show`]: fixedEndShadow && showFixEndShadow,
          [`${cellPrefixCls}-ellipsis`]: ellipsis,
          [`${cellPrefixCls}-with-append`]: mergedAppendNode,
          [`${cellPrefixCls}-fix-sticky`]: (isFixStart.value || isFixEnd.value) && isSticky,
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
