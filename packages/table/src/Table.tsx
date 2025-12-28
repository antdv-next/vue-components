/**
 * Feature:
 *  - fixed not need to set width
 *  - support `rowExpandable` to config row expand logic
 *  - add `summary` to support `() => VueNode`
 *
 * Update:
 *  - `dataIndex` is `array[]` now
 *  - `expandable` wrap all the expand related props
 *
 * Removed:
 *  - expandIconAsCell
 *  - useFixedHeader
 *  - rowRef
 *  - columns[number].onCellClick
 *  - onRowClick
 *  - onRowDoubleClick
 *  - onRowMouseEnter
 *  - onRowMouseLeave
 *  - getBodyWrapper
 *  - bodyStyle
 *
 * Deprecated:
 *  - All expanded props, move into expandable
 */
import type { CSSProperties } from 'vue'
import type { ScrollInfoType } from './context/TableContext'
import type { FixedHeaderProps } from './FixedHolder'
import type { SummaryProps } from './Footer/Summary'
import type {
  ColumnsType,
  ColumnType,
  CustomizeScrollBody,
  DefaultRecordType,
  Direction,
  ExpandableConfig,
  GetComponent,
  GetComponentProps,
  GetRowKey,
  LegacyExpandableProps,
  PanelRender,
  Reference,
  RowClassName,
  TableComponents,
  TableLayout,
  TableSticky,
} from './interface'
import ResizeObserver from '@v-c/resize-observer'
import { clsx, get, warning } from '@v-c/util'
import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { getTargetScrollBarSize } from '@v-c/util/dist/getScrollBarSize'
import isEqual from '@v-c/util/dist/isEqual'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import {
  computed,
  defineComponent,
  isVNode,
  nextTick,
  onMounted,
  reactive,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from 'vue'
import Body from './Body'
import ColGroup from './ColGroup'
import { EXPAND_COLUMN, INTERNAL_HOOKS } from './constant'
import { useProvideTableContext } from './context/TableContext'
import FixedHolder from './FixedHolder'
import Footer, { FooterComponents } from './Footer'
import Summary from './Footer/Summary'
import Header from './Header/Header'
import useColumns from './hooks/useColumns'
import useExpand from './hooks/useExpand'
import useFixedInfo from './hooks/useFixedInfo'
import { useTimeoutLock } from './hooks/useFrame'
import useHover from './hooks/useHover'
import useSticky from './hooks/useSticky'
import useStickyOffsets from './hooks/useStickyOffsets'
import Panel from './Panel'
import StickyScrollBar from './stickyScrollBar'
import Column from './sugar/Column'
import ColumnGroup from './sugar/ColumnGroup'
import { getColumnsKey, validateValue, validNumberValue } from './utils/valueUtil'

export const DEFAULT_PREFIX = 'vc-table'

const EMPTY_DATA: any[] = []
const EMPTY_SCROLL_TARGET = {}

export type SemanticName = 'section' | 'title' | 'footer' | 'content'
export type ComponentsSemantic = 'wrapper' | 'cell' | 'row'

export interface TableProps<RecordType = any>
  extends Omit<LegacyExpandableProps<RecordType>, 'showExpandColumn'> {
  'prefixCls'?: string
  'className'?: string
  'style'?: CSSProperties
  'classNames'?: Partial<Record<SemanticName, string>> & {
    body?: Partial<Record<ComponentsSemantic, string>>
    header?: Partial<Record<ComponentsSemantic, string>>
  }
  'styles'?: Partial<Record<SemanticName, CSSProperties>> & {
    body?: Partial<Record<ComponentsSemantic, CSSProperties>>
    header?: Partial<Record<ComponentsSemantic, CSSProperties>>
  }
  // children?: any
  'data'?: readonly RecordType[]
  'columns'?: ColumnsType<RecordType>
  'rowKey'?: string | keyof RecordType | GetRowKey<RecordType>
  'tableLayout'?: TableLayout

  'scroll'?: { x?: number | true | string, y?: number | string }

  'expandable'?: ExpandableConfig<RecordType>
  'indentSize'?: number
  'rowClassName'?: string | RowClassName<RecordType>

  'title'?: PanelRender<RecordType>
  'footer'?: PanelRender<RecordType>
  'summary'?: (data: readonly RecordType[]) => any
  'headerCell'?: (ctx: { column: ColumnType<any>, index: number, text: any }) => any
  'bodyCell'?: (ctx: { column: ColumnType<any>, index: number, text: any, record: RecordType }) => any
  'caption'?: any

  'id'?: string
  'showHeader'?: boolean
  'components'?: TableComponents<RecordType>
  'onRow'?: GetComponentProps<RecordType>
  'onHeaderRow'?: GetComponentProps<readonly ColumnType<RecordType>[]>
  'emptyText'?: any | (() => any)

  'direction'?: Direction
  'sticky'?: boolean | TableSticky
  'rowHoverable'?: boolean

  'onScroll'?: (event: Event) => void

  'internalHooks'?: string
  'transformColumns'?: (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>
  'tailor'?: boolean
  'getContainerWidth'?: (ele: HTMLElement, width: number) => number
  'internalRefs'?: {
    body: { value?: HTMLDivElement | null }
  }
  'measureRowRender'?: (measureRow: any) => any
  'getPopupContainer'?: (triggerNode?: HTMLElement) => HTMLElement

  'onUpdate:expandedRowKeys'?: (keys: readonly any[]) => void
}

function defaultEmpty() {
  return 'No Data'
}

const defaults = {
  rowKey: 'key',
  prefixCls: DEFAULT_PREFIX,
  emptyText: defaultEmpty,
  rowHoverable: true,
} as any

const Table = defineComponent<TableProps<DefaultRecordType>>((props = defaults, { attrs, slots, expose }) => {
  const mergedData = computed(() => props.data || EMPTY_DATA)
  const hasData = computed(() => !!mergedData.value.length)
  const useInternalHooks = computed(() => props.internalHooks === INTERNAL_HOOKS)

  const mergedPrefixCls = computed(() => props.prefixCls || DEFAULT_PREFIX)
  const mergedRowHoverable = computed(() => props.rowHoverable !== undefined ? props.rowHoverable : true)
  const mergedEmptyText = computed(() => props.emptyText ?? defaultEmpty)
  const mergedDirection = computed<Direction>(() => props.direction || 'ltr')

  const getComponent: GetComponent = (path, defaultComponent) => {
    return get(props.components, path as any) || defaultComponent
  }

  const getRowKey = computed<GetRowKey<any>>(() => {
    if (typeof props.rowKey === 'function') {
      return props.rowKey
    }
    const rowKey = props.rowKey ?? 'key'
    return (record: any) => {
      const key = record && record[rowKey]
      if (process.env.NODE_ENV !== 'production') {
        warning(
          key !== undefined,
          'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.',
        )
      }
      return key
    }
  })

  const customizeScrollBody = computed(() => getComponent(['body']) as CustomizeScrollBody<any>)

  const [startRow, endRow, onHover] = useHover()

  const [
    expandableConfig,
    expandableType,
    mergedExpandedKeys,
    mergedExpandIcon,
    mergedChildrenColumnName,
    onTriggerExpand,
  ] = useExpand(props, mergedData, getRowKey)

  const componentWidth = ref(0)

  const slotChildren = shallowRef<any>(null)

  const [columns, flattenColumns, flattenScrollX] = useColumns(
    {
      prefixCls: mergedPrefixCls,
      columns: computed(() => props.columns),
      children: slotChildren,
      expandable: computed(() => !!expandableConfig.value.expandedRowRender),
      columnTitle: computed(() => expandableConfig.value.columnTitle),
      expandedKeys: mergedExpandedKeys,
      getRowKey,
      onTriggerExpand,
      expandIcon: mergedExpandIcon,
      rowExpandable: computed(() => expandableConfig.value.rowExpandable),
      expandIconColumnIndex: computed(() => expandableConfig.value.expandIconColumnIndex),
      expandedRowOffset: expandableConfig.value.expandedRowOffset,
      direction: mergedDirection,
      expandRowByClick: computed(() => expandableConfig.value.expandRowByClick),
      columnWidth: computed(() => expandableConfig.value.columnWidth),
      fixed: computed(() => expandableConfig.value.fixed),
      scrollWidth: computed(() =>
        useInternalHooks.value && props.tailor && typeof props.scroll?.x === 'number'
          ? props.scroll?.x
          : null,
      ),
      clientWidth: componentWidth,
    },
    computed(() => (useInternalHooks.value ? (props.transformColumns || null) : null)),
  )

  const mergedScrollX = computed(() => flattenScrollX.value ?? props.scroll?.x)

  const fullTableRef = ref<HTMLDivElement | null>(null)
  const scrollHeaderRef = ref<any>(null)
  const scrollBodyRef = ref<any>(null)
  const scrollBodyContainerRef = ref<HTMLDivElement | null>(null)

  expose({
    get nativeElement() {
      return fullTableRef.value as HTMLDivElement
    },
    scrollTo: (config: any) => {
      const targetRef = scrollBodyRef.value
      const targetElement = getDOM(targetRef)
      if (targetElement instanceof HTMLElement) {
        const { index, top, key, offset } = config || {}
        if (validNumberValue(top)) {
          targetElement.scrollTo({ top })
        }
        else {
          const mergedKey = key ?? getRowKey.value(mergedData.value[index])
          const rowElement = targetElement.querySelector(`[data-row-key="${mergedKey}"]`) as HTMLElement | null
          if (rowElement) {
            if (!offset) {
              rowElement.scrollIntoView()
            }
            else {
              targetElement.scrollTo({ top: rowElement.offsetTop + offset })
            }
          }
        }
      }
      else if (targetRef?.scrollTo) {
        targetRef.scrollTo(config)
      }
    },
  } as Reference)

  const scrollSummaryRef = ref<any>(null)
  const shadowStart = ref(false)
  const shadowEnd = ref(false)
  const colsWidths = ref(new Map<string | number, number>())

  const colsKeys = computed(() => getColumnsKey(flattenColumns.value))
  const colWidths = computed(() => colsKeys.value.map(columnKey => colsWidths.value.get(columnKey)))
  const stickyRef = ref<any>(null)
  const stickyConfig = useSticky(computed(() => props.sticky), mergedPrefixCls)

  const stickyOffsets = useStickyOffsets(colWidths, flattenColumns)
  const mergedStickyOffsets = computed(() => ({
    ...stickyOffsets.value,
    isSticky: stickyConfig.value.isSticky,
  }))
  const fixHeader = computed(() => !!(props.scroll && validateValue(props.scroll.y)))
  const horizonScroll = computed(
    () => (!!(props.scroll && validateValue(mergedScrollX.value)) || !!expandableConfig.value.fixed),
  )
  const fixColumn = computed(() => horizonScroll.value && flattenColumns.value.some(({ fixed }) => fixed))

  const summaryNode = computed(() => props.summary?.(mergedData.value))
  const fixFooter = computed(() => {
    const node = summaryNode.value
    if (!node || Array.isArray(node) || !isVNode(node)) {
      return false
    }
    return (
      (fixHeader.value || stickyConfig.value.isSticky)
      && node.type === Summary
      && (node.props as SummaryProps).fixed
    )
  })

  const scrollXStyle = computed<CSSProperties | undefined>(() => {
    if (horizonScroll.value) {
      return { overflowX: 'auto' }
    }
    return undefined
  })

  const scrollYStyle = computed<CSSProperties | undefined>(() => {
    if (fixHeader.value) {
      return {
        overflowY: hasData.value ? 'scroll' : 'auto',
        maxHeight: typeof props.scroll?.y === 'number' ? `${props.scroll?.y}px` : props.scroll?.y,
      }
    }
    if (horizonScroll.value && !fixHeader.value) {
      return { overflowY: 'hidden' }
    }
    return undefined
  })

  const scrollTableStyle = computed<CSSProperties | undefined>(() => {
    if (!horizonScroll.value) {
      return undefined
    }
    const width = mergedScrollX.value === true
      ? 'auto'
      : typeof mergedScrollX.value === 'number'
        ? `${mergedScrollX.value}px`
        : mergedScrollX.value
    return {
      width,
      minWidth: '100%',
    }
  })

  const onColumnResize = (columnKey: string | number, width: number) => {
    if (colsWidths.value.get(columnKey) !== width) {
      const newWidths = new Map(colsWidths.value)
      newWidths.set(columnKey, width)
      colsWidths.value = newWidths
    }
  }

  const [setScrollTarget, getScrollTarget] = useTimeoutLock<HTMLElement | null>(null)

  function forceScroll(scrollLeft: number, target: any) {
    if (!target) {
      return
    }
    if (typeof target === 'function') {
      target(scrollLeft)
      return
    }
    if (target.scrollTo) {
      target.scrollTo({ left: scrollLeft })
      return
    }
    const element = getDOM(target) as HTMLElement | null
    if (element && element.scrollLeft !== scrollLeft) {
      element.scrollLeft = scrollLeft
      if (element.scrollLeft !== scrollLeft) {
        setTimeout(() => {
          element.scrollLeft = scrollLeft
        }, 0)
      }
    }
  }

  const scrollInfo = ref<ScrollInfoType>([0, 0])

  const onInternalScroll = (info: { currentTarget?: HTMLElement, scrollLeft?: number }) => {
    const currentTarget = info.currentTarget || (scrollBodyRef.value as HTMLElement)
    const mergedScrollLeft = typeof info.scrollLeft === 'number'
      ? info.scrollLeft
      : currentTarget?.scrollLeft || 0
    const compareTarget = currentTarget || EMPTY_SCROLL_TARGET
    if (!getScrollTarget() || getScrollTarget() === compareTarget) {
      setScrollTarget(compareTarget)
      forceScroll(mergedScrollLeft, scrollHeaderRef.value)
      forceScroll(mergedScrollLeft, scrollBodyRef.value)
      forceScroll(mergedScrollLeft, scrollSummaryRef.value)
      forceScroll(mergedScrollLeft, stickyRef.value?.setScrollLeft)
    }

    const measureTarget = currentTarget || getDOM(scrollHeaderRef.value)
    if (measureTarget) {
      const scrollWidth
        = useInternalHooks.value && props.tailor && typeof mergedScrollX.value === 'number'
          ? mergedScrollX.value
          : measureTarget.scrollWidth
      const clientWidth = measureTarget.clientWidth
      const absScrollStart = Math.abs(mergedScrollLeft)
      const nextScrollInfo: ScrollInfoType = [absScrollStart, scrollWidth - clientWidth]
      scrollInfo.value = isEqual(scrollInfo.value, nextScrollInfo) ? scrollInfo.value : nextScrollInfo

      if (scrollWidth === clientWidth) {
        shadowStart.value = false
        shadowEnd.value = false
        return
      }
      shadowStart.value = absScrollStart > 0
      shadowEnd.value = absScrollStart < scrollWidth - clientWidth - 1
    }
  }

  const onBodyScroll = (event: Event) => {
    onInternalScroll({ currentTarget: event.currentTarget as HTMLElement })
    props.onScroll?.(event)
  }

  const triggerOnScroll = () => {
    if (horizonScroll.value && scrollBodyRef.value) {
      const bodyElement = getDOM(scrollBodyRef.value) as HTMLElement
      onInternalScroll({
        currentTarget: bodyElement,
        scrollLeft: bodyElement?.scrollLeft,
      })
    }
    else {
      shadowStart.value = false
      shadowEnd.value = false
    }
  }

  const onFullTableResize = (offsetWidth?: number) => {
    stickyRef.value?.checkScrollBarVisible?.()
    let mergedWidth = offsetWidth ?? fullTableRef.value?.offsetWidth ?? 0
    if (useInternalHooks.value && props.getContainerWidth && fullTableRef.value) {
      mergedWidth = props.getContainerWidth(fullTableRef.value, mergedWidth) || mergedWidth
    }
    if (mergedWidth !== componentWidth.value) {
      triggerOnScroll()
      componentWidth.value = mergedWidth
    }
  }

  watch(horizonScroll, () => {
    if (horizonScroll.value) {
      onFullTableResize()
    }
  }, { immediate: true, flush: 'post' })

  const mounted = ref(false)
  watch(
    () => [horizonScroll.value, props.data, columns.value.length],
    async () => {
      if (mounted.value) {
        await nextTick()
        triggerOnScroll()
      }
    },
  )
  onMounted(() => {
    mounted.value = true
  })

  const scrollbarSize = ref(0)
  onMounted(() => {
    if (!props.tailor || !useInternalHooks.value) {
      if (scrollBodyRef.value instanceof Element) {
        scrollbarSize.value = getTargetScrollBarSize(scrollBodyRef.value as HTMLElement).width
      }
      else {
        scrollbarSize.value = getTargetScrollBarSize(scrollBodyContainerRef.value as any).width
      }
    }
  })

  watchEffect(() => {
    if (useInternalHooks.value && props.internalRefs?.body) {
      props.internalRefs.body.value = getDOM(scrollBodyRef.value) as HTMLDivElement
    }
  })

  const TableComponent = computed(() => getComponent(['table'], 'table'))

  const mergedTableLayout = computed<TableLayout>(() => {
    if (props.tableLayout) {
      return props.tableLayout
    }
    if (fixColumn.value) {
      return mergedScrollX.value === 'max-content' ? 'auto' : 'fixed'
    }
    if (fixHeader.value || stickyConfig.value.isSticky || flattenColumns.value.some(({ ellipsis }) => ellipsis)) {
      return 'fixed'
    }
    return 'auto'
  })

  const headerProps = computed(() => ({
    colWidths: colWidths.value,
    columCount: flattenColumns.value.length,
    stickyOffsets: mergedStickyOffsets.value,
    onHeaderRow: props.onHeaderRow,
    fixHeader: fixHeader.value,
    scroll: props.scroll,
  }))

  const emptyNode = computed(() => {
    if (hasData.value) {
      return null
    }
    const emptyText = mergedEmptyText.value
    if (typeof emptyText === 'function') {
      return emptyText()
    }
    return emptyText
  })

  const dataProps = pickAttrs(attrs, { data: true })
  const ariaProps = pickAttrs(attrs, { aria: true })

  const fixedInfoList = useFixedInfo(flattenColumns, mergedStickyOffsets)

  const tableContext = reactive<any>({})
  useProvideTableContext(tableContext)

  watchEffect(() => {
    tableContext.scrollX = mergedScrollX.value
    tableContext.scrollInfo = scrollInfo.value
    tableContext.classNames = props.classNames
    tableContext.styles = props.styles
    tableContext.prefixCls = mergedPrefixCls.value
    tableContext.getComponent = getComponent
    tableContext.scrollbarSize = scrollbarSize.value
    tableContext.direction = mergedDirection.value
    tableContext.fixedInfoList = fixedInfoList.value
    tableContext.isSticky = stickyConfig.value.isSticky
    tableContext.componentWidth = componentWidth.value
    tableContext.fixHeader = fixHeader.value
    tableContext.fixColumn = fixColumn.value
    tableContext.horizonScroll = horizonScroll.value
    tableContext.tableLayout = mergedTableLayout.value
    tableContext.rowClassName = props.rowClassName
    tableContext.expandedRowClassName = expandableConfig.value.expandedRowClassName
    tableContext.expandIcon = mergedExpandIcon.value
    tableContext.expandableType = expandableType.value
    tableContext.expandRowByClick = expandableConfig.value.expandRowByClick
    tableContext.expandedRowRender = expandableConfig.value.expandedRowRender
    tableContext.expandedRowOffset = expandableConfig.value.expandedRowOffset
    tableContext.onTriggerExpand = onTriggerExpand
    tableContext.expandIconColumnIndex = expandableConfig.value.expandIconColumnIndex
    tableContext.indentSize = expandableConfig.value.indentSize ?? 15
    tableContext.allColumnsFixedLeft = flattenColumns.value.every(col => col.fixed === 'start')
    tableContext.emptyNode = emptyNode.value
    tableContext.columns = columns.value
    tableContext.flattenColumns = flattenColumns.value
    tableContext.onColumnResize = onColumnResize
    tableContext.colWidths = colWidths.value as number[]
    tableContext.hoverStartRow = startRow.value
    tableContext.hoverEndRow = endRow.value
    tableContext.onHover = onHover
    tableContext.rowExpandable = expandableConfig.value.rowExpandable
    tableContext.onRow = props.onRow
    tableContext.getRowKey = getRowKey.value
    tableContext.expandedKeys = mergedExpandedKeys.value
    tableContext.childrenColumnName = mergedChildrenColumnName.value
    tableContext.rowHoverable = mergedRowHoverable.value
    tableContext.measureRowRender = props.measureRowRender
    tableContext.headerCell = props.headerCell
    tableContext.bodyCell = props.bodyCell
  })
  const setScrollBodyRef = (el: any) => {
    scrollBodyRef.value = el
  }
  return () => {
    slotChildren.value = slots.default?.()
    const renderFixedHeaderTable = (fixedHolderPassProps: FixedHeaderProps<any>) => (
      <>
        <Header {...fixedHolderPassProps} />
        {fixFooter.value === 'top' && (
          <Footer {...fixedHolderPassProps}>{summaryNode.value}</Footer>
        )}
      </>
    )

    const renderFixedFooterTable = (fixedHolderPassProps: FixedHeaderProps<any>) => (
      <Footer {...fixedHolderPassProps}>{summaryNode.value}</Footer>
    )
    const bodyTableNode = (
      <Body
        data={mergedData.value}
        measureColumnWidth={fixHeader.value || horizonScroll.value || stickyConfig.value.isSticky}
      />
    )
    const bodyColGroupNode = (
      <ColGroup
        colWidths={flattenColumns.value.map(({ width }) => width!)}
        columns={flattenColumns.value}
      />
    )

    const captionElement = props.caption !== null && props.caption !== undefined
      ? <caption class={`${mergedPrefixCls.value}-caption`}>{props.caption}</caption>
      : undefined

    let groupTableNode: any
    if (fixHeader.value || stickyConfig.value.isSticky) {
      let bodyContent: any

      if (typeof customizeScrollBody.value === 'function') {
        bodyContent = customizeScrollBody.value(mergedData.value, {
          scrollbarSize: scrollbarSize.value,
          ref: setScrollBodyRef as any,
          onScroll: onInternalScroll,
        })
      }
      else {
        const TableComp = TableComponent.value
        bodyContent = (
          <div
            style={{
              ...scrollXStyle.value,
              ...scrollYStyle.value,
            }}
            onScroll={onBodyScroll}
            ref={setScrollBodyRef}
            class={`${mergedPrefixCls.value}-body`}
          >
            <TableComp
              style={{
                ...scrollTableStyle.value,
                tableLayout: mergedTableLayout.value,
              }}
              {...ariaProps}
            >
              {captionElement}
              {bodyColGroupNode}
              {bodyTableNode}
              {!fixFooter.value && summaryNode.value && (
                <Footer stickyOffsets={mergedStickyOffsets.value} flattenColumns={flattenColumns.value}>
                  {summaryNode.value}
                </Footer>
              )}
            </TableComp>
          </div>
        )
      }

      const fixedHolderProps = {
        noData: !mergedData.value.length,
        maxContentScroll: horizonScroll.value && mergedScrollX.value === 'max-content',
        ...headerProps.value,
        columns: columns.value,
        flattenColumns: flattenColumns.value,
        direction: mergedDirection.value,
        stickyClassName: stickyConfig.value.stickyClassName,
        scrollX: mergedScrollX.value,
        tableLayout: mergedTableLayout.value,
        onScroll: onInternalScroll,
      } as any

      groupTableNode = (
        <>
          {props.showHeader !== false && (
            <FixedHolder
              {...fixedHolderProps}
              stickyTopOffset={stickyConfig.value.offsetHeader}
              className={`${mergedPrefixCls.value}-header`}
              ref={scrollHeaderRef}
              colGroup={bodyColGroupNode}
              v-slots={{ default: renderFixedHeaderTable }}
            />
          )}

          {bodyContent}

          {fixFooter.value && fixFooter.value !== 'top' && (
            <FixedHolder
              {...fixedHolderProps}
              stickyBottomOffset={stickyConfig.value.offsetSummary}
              className={`${mergedPrefixCls.value}-summary`}
              ref={scrollSummaryRef}
              colGroup={bodyColGroupNode}
              v-slots={{ default: renderFixedFooterTable }}
            />
          )}

          {stickyConfig.value.isSticky && scrollBodyRef.value instanceof Element && (
            <StickyScrollBar
              ref={stickyRef}
              offsetScroll={stickyConfig.value.offsetScroll}
              scrollBodyRef={scrollBodyRef}
              onScroll={onInternalScroll}
              container={stickyConfig.value.container}
              direction={mergedDirection.value}
            />
          )}
        </>
      )
    }
    else {
      const TableComp = TableComponent.value
      groupTableNode = (
        <div
          style={{ ...scrollXStyle.value, ...scrollYStyle.value, ...props.styles?.content }}
          class={clsx(`${mergedPrefixCls.value}-content`, props.classNames?.content)}
          onScroll={onBodyScroll}
          ref={scrollBodyRef}
        >
          <TableComp style={{ ...scrollTableStyle.value, tableLayout: mergedTableLayout.value }} {...ariaProps}>
            {captionElement}
            {bodyColGroupNode}
            {props.showHeader !== false && (
              <Header {...headerProps.value} columns={columns.value} flattenColumns={flattenColumns.value} />
            )}
            {bodyTableNode}
            {summaryNode.value && (
              <Footer stickyOffsets={mergedStickyOffsets.value} flattenColumns={flattenColumns.value}>
                {summaryNode.value}
              </Footer>
            )}
          </TableComp>
        </div>
      )
    }

    const tableStyle: CSSProperties = { ...props.style }
    if (stickyConfig.value.isSticky) {
      ;(tableStyle as any)['--columns-count'] = flattenColumns.value.length
    }

    const fullTable = (
      <div
        class={clsx(mergedPrefixCls.value, props.className, {
          [`${mergedPrefixCls.value}-rtl`]: mergedDirection.value === 'rtl',
          [`${mergedPrefixCls.value}-fix-start-shadow`]: horizonScroll.value,
          [`${mergedPrefixCls.value}-fix-end-shadow`]: horizonScroll.value,
          [`${mergedPrefixCls.value}-fix-start-shadow-show`]: horizonScroll.value && shadowStart.value,
          [`${mergedPrefixCls.value}-fix-end-shadow-show`]: horizonScroll.value && shadowEnd.value,
          [`${mergedPrefixCls.value}-layout-fixed`]: props.tableLayout === 'fixed',
          [`${mergedPrefixCls.value}-fixed-header`]: fixHeader.value,
          [`${mergedPrefixCls.value}-fixed-column`]: fixColumn.value,
          [`${mergedPrefixCls.value}-scroll-horizontal`]: horizonScroll.value,
          [`${mergedPrefixCls.value}-has-fix-start`]: flattenColumns.value[0]?.fixed,
          [`${mergedPrefixCls.value}-has-fix-end`]: flattenColumns.value[flattenColumns.value.length - 1]?.fixed === 'end',
        })}
        style={tableStyle}
        id={props.id}
        ref={fullTableRef}
        {...dataProps}
      >
        {props.title && (
          <Panel
            className={clsx(`${mergedPrefixCls.value}-title`, props.classNames?.title)}
            style={props.styles?.title}
          >
            {props.title(mergedData.value)}
          </Panel>
        )}
        <div
          ref={scrollBodyContainerRef}
          class={clsx(`${mergedPrefixCls.value}-container`, props.classNames?.section)}
          style={props.styles?.section}
        >
          {groupTableNode}
        </div>
        {props.footer && (
          <Panel
            className={clsx(`${mergedPrefixCls.value}-footer`, props.classNames?.footer)}
            style={props.styles?.footer}
          >
            {props.footer(mergedData.value)}
          </Panel>
        )}
      </div>
    )

    if (horizonScroll.value) {
      return (
        <ResizeObserver onResize={({ offsetWidth }) => onFullTableResize(offsetWidth)}>
          {fullTable}
        </ResizeObserver>
      )
    }
    return fullTable
  }
})

const ImmutableTable = Table

type ImmutableTableType = typeof ImmutableTable & {
  EXPAND_COLUMN: typeof EXPAND_COLUMN
  INTERNAL_HOOKS: typeof INTERNAL_HOOKS
  Column: typeof Column
  ColumnGroup: typeof ColumnGroup
  Summary: typeof FooterComponents
}

;(ImmutableTable as ImmutableTableType).EXPAND_COLUMN = EXPAND_COLUMN
;(ImmutableTable as ImmutableTableType).INTERNAL_HOOKS = INTERNAL_HOOKS
;(ImmutableTable as ImmutableTableType).Column = Column
;(ImmutableTable as ImmutableTableType).ColumnGroup = ColumnGroup
;(ImmutableTable as ImmutableTableType).Summary = FooterComponents

export default ImmutableTable as ImmutableTableType
