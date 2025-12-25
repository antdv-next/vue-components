import type { CSSProperties } from 'vue'
import type {
  ColumnsType,
  ColumnType,
  CustomizeComponent,
  CustomizeScrollBody,
  DefaultRecordType,
  Direction,
  ExpandableConfig,
  GetComponentProps,
  GetRowKey,
  Key,
  LegacyExpandableProps,
  PanelRender,
  Reference,
  RowClassName,
  ScrollConfig,
  TableClassNames,
  TableComponents,
  TableLayout,
  TableSticky,
  TableStyles,
  TransformCellText,
  TriggerEventHandler,
} from './interface'
import ResizeObserver from '@v-c/resize-observer'
import { clsx } from '@v-c/util'
import isVisible from '@v-c/util/dist/Dom/isVisible'
import { getTargetScrollBarSize } from '@v-c/util/dist/getScrollBarSize'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, nextTick, onMounted, onUpdated, reactive, ref, shallowRef, toRef, watch, watchEffect } from 'vue'
import type { Ref } from 'vue'
import Body from './Body'
import ColGroup from './ColGroup'
import { INTERNAL_HOOKS } from './constant'
import { useProvideBody } from './context/BodyContext'
import { useProvideExpandedRow } from './context/ExpandedRowContext'
import { useProvideResize } from './context/ResizeContext'
import { useProvideResizeColumn, useProvideSlots } from './context/SlotsContext'
import { useProvideSticky } from './context/StickyContext'
import { useProvideTable } from './context/TableContext'
import FixedHolder from './FixedHolder'
import Footer from './Footer'
import Header from './Header/Header'
import useColumns from './hooks/useColumns'
import { useLayoutState, useTimeoutLock } from './hooks/useFrame'
import useSticky from './hooks/useSticky'
import useStickyOffsets from './hooks/useStickyOffsets'
import Panel from './Panel'
import StickyScrollBar from './stickyScrollBar'
import { findAllChildrenKeys, renderExpandIcon } from './utils/expandUtil'
import { getCellFixedInfo } from './utils/fixUtil'
import { getExpandableProps } from './utils/legacyUtil'
import { getColumnsKey, getPathValue, mergeObject, validateValue, validNumberValue } from './utils/valueUtil'

// Used for conditions cache
const EMPTY_DATA: DefaultRecordType[] = []

// Used for customize scroll
const EMPTY_SCROLL_TARGET: Record<string, any> = {}

const DEFAULT_PREFIX = 'vc-table'

export interface TableProps<RecordType = DefaultRecordType>
  extends Omit<LegacyExpandableProps<RecordType>, 'showExpandColumn'> {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  classNames?: TableClassNames
  styles?: TableStyles
  children?: any
  data?: readonly RecordType[]
  columns?: ColumnsType<RecordType>
  rowKey?: string | keyof RecordType | GetRowKey<RecordType>
  tableLayout?: TableLayout

  // Fixed Columns
  scroll?: { x?: number | true | string, y?: number | string }

  // Expandable
  /** Config expand rows */
  expandable?: ExpandableConfig<RecordType>
  indentSize?: number
  rowClassName?: string | RowClassName<RecordType>

  // Additional Part
  footer?: PanelRender<RecordType>
  summary?: (data: readonly RecordType[]) => any
  caption?: any

  // Customize
  id?: string
  showHeader?: boolean
  components?: TableComponents<RecordType>
  onRow?: GetComponentProps<RecordType>
  onHeaderRow?: GetComponentProps<readonly ColumnType<RecordType>[]>
  emptyText?: any

  direction?: Direction

  sticky?: boolean | TableSticky

  rowHoverable?: boolean

  // Events
  onScroll?: (e: Event) => void

  // =================================== Internal ===================================
  /**
   * @private Internal usage, may remove by refactor. Should always use `columns` instead.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  internalHooks?: string

  /**
   * @private Internal usage, may remove by refactor. Should always use `columns` instead.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  transformColumns?: (columns: ColumnsType<RecordType>) => ColumnsType<RecordType>

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  // Force trade scrollbar as 0 size.
  // Force column to be average width if not set
  tailor?: boolean

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  // Pass the way to get real width. e.g. exclude the border width
  getContainerWidth?: (ele: HTMLElement, width: number) => number

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  internalRefs?: {
    body: HTMLDivElement
  }

  /**
   * @private Internal usage, may remove by refactor.
   *
   * !!! DO NOT USE IN PRODUCTION ENVIRONMENT !!!
   */
  measureRowRender?: (measureRow: any) => any

  transformCellText?: TransformCellText<RecordType>
}

const tableDefaults = {
  prefixCls: DEFAULT_PREFIX,
  rowKey: 'key',
  direction: 'ltr',
  rowHoverable: true,
} as any

const Table = defineComponent<TableProps>(
  (props = tableDefaults, { attrs, slots, emit, expose }) => {
    const mergedPrefixCls = computed(() => props.prefixCls ?? DEFAULT_PREFIX)
    const mergedDirection = computed<Direction>(() => props.direction ?? 'ltr')
    const mergedRowHoverable = computed(() => props.rowHoverable !== false)
    const useInternalHooks = computed(() => props.internalHooks === INTERNAL_HOOKS)

    const mergedData = computed(() => (props.data || EMPTY_DATA) as DefaultRecordType[])
    const hasData = computed(() => !!mergedData.value.length)

    useProvideSlots(computed(() => slots as any))
    useProvideResizeColumn({
      onResizeColumn: () => {},
    })

    // ==================== Customize =====================
    const mergedComponents = computed(() =>
      mergeObject<TableComponents<any>>(props.components || {}, {}),
    )

    const getComponent = (path: readonly string[], defaultComponent?: string) =>
      getPathValue<CustomizeComponent, TableComponents<any>>(mergedComponents.value, path)
      || defaultComponent

    const getRowKey = computed<GetRowKey<any>>(() => {
      const rowKey = props.rowKey || 'key'
      if (typeof rowKey === 'function') {
        return rowKey
      }
      return (record) => {
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

    // ====================== Expand ======================
    const expandableConfig = computed(() => getExpandableProps(props))

    const mergedExpandIcon = computed(() => expandableConfig.value.expandIcon || renderExpandIcon)

    const mergedChildrenColumnName = computed(() =>
      expandableConfig.value.childrenColumnName || 'children',
    )

    const expandableType = computed(() => {
      if (expandableConfig.value.expandedRowRender) {
        return 'row'
      }
      if (
        props.expandable
        && useInternalHooks.value
        && (props.expandable as any).__PARENT_RENDER_ICON__
      ) {
        return 'nest'
      }
      if (
        mergedData.value.some(
          record => record && typeof record === 'object' && record[mergedChildrenColumnName.value],
        )
      ) {
        return 'nest'
      }
      return false
    })

    const innerExpandedKeys = shallowRef<Key[]>([])
    const stop = watchEffect(() => {
      if (expandableConfig.value.defaultExpandedRowKeys) {
        innerExpandedKeys.value = [...expandableConfig.value.defaultExpandedRowKeys]
      }
      if (expandableConfig.value.defaultExpandAllRows) {
        innerExpandedKeys.value = findAllChildrenKeys(
          mergedData.value,
          getRowKey.value,
          mergedChildrenColumnName.value,
        )
      }
    })
    stop()

    const mergedExpandedKeys = computed<Set<Key>>(
      () => new Set(expandableConfig.value.expandedRowKeys || innerExpandedKeys.value || []),
    )

    const onTriggerExpand: TriggerEventHandler<any> = (record, event) => {
      const key = getRowKey.value(record, mergedData.value.indexOf(record))

      let newExpandedKeys: Key[]
      const hasKey = mergedExpandedKeys.value.has(key)
      if (hasKey) {
        mergedExpandedKeys.value.delete(key)
        newExpandedKeys = [...(mergedExpandedKeys.value as any)]
      }
      else {
        newExpandedKeys = [...(mergedExpandedKeys.value as any), key]
      }
      innerExpandedKeys.value = newExpandedKeys

      expandableConfig.value.onExpand?.(!hasKey, record)
      expandableConfig.value.onExpandedRowsChange?.(newExpandedKeys)

      emit('expand', !hasKey, record)
      emit('update:expandedRowKeys', newExpandedKeys)
      emit('expandedRowsChange', newExpandedKeys)

      event?.stopPropagation?.()
    }

    // Warning if use `expandedRowRender` and nest children in the same time
    if (
      process.env.NODE_ENV !== 'production'
      && expandableConfig.value.expandedRowRender
      && mergedData.value.some(record => Array.isArray(record?.[mergedChildrenColumnName.value]))
    ) {
      warning(false, '`expandedRowRender` should not use with nested Table')
    }

    const componentWidth = ref(0)
    const scrollX = computed(() => props.scroll?.x)

    const [columns, flattenColumns, flattenScrollX] = useColumns(
      {
        prefixCls: mergedPrefixCls,
        columns: computed(() => props.columns || []),
        children: computed(() => slots.default?.() || []),
        expandable: computed(() => !!expandableConfig.value.expandedRowRender),
        expandedKeys: mergedExpandedKeys,
        columnTitle: computed(() => expandableConfig.value.columnTitle),
        getRowKey,
        onTriggerExpand,
        expandIcon: mergedExpandIcon,
        rowExpandable: computed(() => expandableConfig.value.rowExpandable) as any,
        expandIconColumnIndex: computed(
          () => expandableConfig.value.expandIconColumnIndex ?? 0,
        ),
        expandRowByClick: computed(() => !!expandableConfig.value.expandRowByClick),
        columnWidth: computed(() => expandableConfig.value.columnWidth) as any,
        fixed: computed(() => expandableConfig.value.fixed) as any,
        expandedRowOffset: computed(() => expandableConfig.value.expandedRowOffset || 0),
        scrollWidth: computed(() =>
          useInternalHooks.value && props.tailor && typeof scrollX.value === 'number'
            ? scrollX.value
            : null,
        ),
        clientWidth: componentWidth,
      },
      computed(() => (useInternalHooks.value ? props.transformColumns : null)) as any,
    )

    const mergedScrollX = computed(() => flattenScrollX.value ?? scrollX.value)

    const columnContext = computed(() => ({
      columns: columns.value,
      flattenColumns: flattenColumns.value,
    }))

    // ======================= Refs =======================
    const fullTableRef = ref<HTMLDivElement>()
    const scrollHeaderRef = ref<HTMLDivElement>()
    const scrollBodyRef = ref<HTMLDivElement>()
    const scrollSummaryRef = ref<HTMLDivElement>()
    const scrollBodySizeInfo = ref<{ scrollWidth: number, clientWidth: number }>({
      scrollWidth: 0,
      clientWidth: 0,
    })

    const scrollTo = (config: ScrollConfig) => {
      const bodyRef = scrollBodyRef.value as any
      if (bodyRef && typeof bodyRef.scrollTo === 'function' && !(bodyRef instanceof HTMLElement)) {
        bodyRef.scrollTo(config)
        return
      }
      const scrollTarget = bodyRef?.$el || bodyRef
      if (scrollTarget instanceof HTMLElement) {
        const { index, top, key, offset } = config

        if (validNumberValue(top)) {
          scrollTarget.scrollTo({ top })
        }
        else {
          if (key === undefined && typeof index !== 'number') {
            return
          }
          const targetIndex = typeof index === 'number' ? index : 0
          const mergedKey
            = key ?? getRowKey.value(mergedData.value[targetIndex], targetIndex)
          const targetElement = scrollTarget.querySelector(`[data-row-key="${mergedKey}"]`)
          if (targetElement) {
            if (!offset) {
              targetElement.scrollIntoView()
            }
            else {
              const elementTop = (targetElement as HTMLElement).offsetTop
              scrollTarget.scrollTo({ top: elementTop + offset })
            }
          }
        }
      }
    }

    expose({
      get nativeElement() {
        return fullTableRef.value as HTMLDivElement
      },
      scrollTo,
    } as Reference)

    // ====================== Scroll ======================
    const shadowStart = ref(false)
    const shadowEnd = ref(false)
    const [colsWidths, updateColsWidths] = useLayoutState(new Map<Key, number>())

    // Convert map to number width
    const colsKeys = computed(() => getColumnsKey(flattenColumns.value))
    const colWidths = computed(() =>
      colsKeys.value.map(columnKey => colsWidths.value.get(columnKey) || 0),
    )
    const columnCount = computed(() => flattenColumns.value.length)
    const stickyOffsets = useStickyOffsets(colWidths, columnCount, mergedDirection)
    const fixHeader = computed(() => !!(props.scroll && validateValue(props.scroll.y)))
    const horizonScroll = computed(
      () =>
        (props.scroll && validateValue(mergedScrollX.value))
        || Boolean(expandableConfig.value.fixed),
    )
    const fixColumn = computed(
      () => horizonScroll.value && flattenColumns.value.some(({ fixed }) => fixed),
    )

    // Sticky
    const stickyRef = ref<{ setScrollLeft: (left: number) => void }>()
    const stickyState = useSticky(
      toRef(props, 'sticky') as Ref<boolean | TableSticky>,
      mergedPrefixCls,
    )

    const summaryFixedInfos = reactive<Record<string, boolean | string>>({})
    const fixFooter = computed(() => {
      const info = Object.values(summaryFixedInfos)[0]
      return (fixHeader.value || stickyState.value.isSticky) && info
    })

    const summaryCollect = (uniKey: string, fixed: boolean | string) => {
      if (fixed) {
        summaryFixedInfos[uniKey] = fixed
      }
      else {
        delete summaryFixedInfos[uniKey]
      }
    }

    // Scroll
    const scrollXStyle = ref<CSSProperties>({})
    const scrollYStyle = ref<CSSProperties>({})
    const scrollTableStyle = ref<CSSProperties>({})

    watchEffect(() => {
      scrollXStyle.value = {}
      scrollYStyle.value = {}
      scrollTableStyle.value = {}

      if (fixHeader.value) {
        scrollYStyle.value = {
          overflowY: 'scroll',
          maxHeight: props.scroll?.y,
        }
      }

      if (horizonScroll.value) {
        scrollXStyle.value = { overflowX: 'auto' }
        if (!fixHeader.value) {
          scrollYStyle.value = { overflowY: 'hidden' }
        }
        scrollTableStyle.value = {
          width: mergedScrollX.value === true ? 'auto' : mergedScrollX.value,
          minWidth: '100%',
        }
      }
    })

    const onColumnResize = (columnKey: Key, width: number) => {
      if (fullTableRef.value && isVisible(fullTableRef.value)) {
        updateColsWidths((widths) => {
          if (widths.get(columnKey) !== width) {
            const newWidths = new Map(widths)
            newWidths.set(columnKey, width)
            return newWidths
          }
          return widths
        })
      }
    }

    const [setScrollTarget, getScrollTarget] = useTimeoutLock<HTMLElement | Record<string, any>>(
      EMPTY_SCROLL_TARGET,
    )

    function forceScroll(scrollLeft: number, target?: HTMLDivElement | ((left: number) => void)) {
      if (!target) {
        return
      }

      if (typeof target === 'function') {
        target(scrollLeft)
        return
      }
      if (typeof target === 'object' && 'scrollLeft' in (target as any) && !(target instanceof HTMLElement)) {
        (target as any).scrollLeft = scrollLeft
        return
      }
      const domTarget = (target as any).$el || target
      if (domTarget && domTarget.scrollLeft !== scrollLeft) {
        domTarget.scrollLeft = scrollLeft
      }
    }

    const onInternalScroll = ({
      currentTarget,
      scrollLeft,
    }: {
      currentTarget?: HTMLElement
      scrollLeft?: number
    }) => {
      const mergedScrollLeft
        = typeof scrollLeft === 'number'
          ? scrollLeft
          : currentTarget
            ? currentTarget.scrollLeft
            : 0

      const compareTarget = currentTarget || EMPTY_SCROLL_TARGET
      if (!getScrollTarget() || getScrollTarget() === compareTarget) {
        setScrollTarget(compareTarget)

        forceScroll(mergedScrollLeft, scrollHeaderRef.value)
        forceScroll(mergedScrollLeft, scrollBodyRef.value)
        forceScroll(mergedScrollLeft, scrollSummaryRef.value)
        forceScroll(mergedScrollLeft, stickyRef.value?.setScrollLeft)
      }

      const measureTarget
        = currentTarget
          || (scrollBodyRef.value as any)?.nativeElement
          || (scrollBodyRef.value as any)?.$el
          || scrollBodyRef.value
          || (scrollHeaderRef.value as any)?.$el
          || scrollHeaderRef.value
      const measureElement = measureTarget instanceof Element
        ? measureTarget
        : (measureTarget as any)?.$el || (measureTarget as any)?.nativeElement
      if (measureElement instanceof Element) {
        const scrollWidth
          = useInternalHooks.value && props.tailor && typeof mergedScrollX.value === 'number'
            ? mergedScrollX.value
            : measureElement.scrollWidth
        const clientWidth = measureElement.clientWidth
        const absScrollStart = Math.abs(mergedScrollLeft)
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
        const scrollTarget = scrollBodyRef.value as any
        const currentTarget
          = scrollTarget?.nativeElement || scrollTarget?.$el || scrollTarget
        const scrollLeft
          = typeof scrollTarget?.scrollLeft === 'number' ? scrollTarget.scrollLeft : undefined
        onInternalScroll({
          currentTarget: currentTarget instanceof HTMLElement ? currentTarget : undefined,
          scrollLeft,
        })
      }
      else {
        shadowStart.value = false
        shadowEnd.value = false
      }
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const updateWidth = (width: number) => {
      if (width !== componentWidth.value) {
        triggerOnScroll()
        componentWidth.value = width
      }
    }
    const onFullTableResize = ({ offsetWidth }: { offsetWidth?: number }) => {
      clearTimeout(timeoutId)
      const baseWidth = offsetWidth ?? fullTableRef.value?.offsetWidth ?? 0
      const mergedWidth
        = useInternalHooks.value && props.getContainerWidth && fullTableRef.value
          ? props.getContainerWidth(fullTableRef.value, baseWidth) || baseWidth
          : baseWidth
      if (componentWidth.value === 0) {
        updateWidth(mergedWidth)
        return
      }
      timeoutId = setTimeout(() => {
        updateWidth(mergedWidth)
      }, 100)
    }

    watch(
      [horizonScroll, () => props.data, columnCount],
      () => {
        if (horizonScroll.value) {
          triggerOnScroll()
        }
      },
      { flush: 'post' },
    )

    const scrollbarSize = ref(0)
    useProvideSticky()
    onMounted(() => {
      nextTick(() => {
        triggerOnScroll()
        if (scrollBodyRef.value) {
          scrollbarSize.value = getTargetScrollBarSize(scrollBodyRef.value).width
        }
        scrollBodySizeInfo.value = {
          scrollWidth: scrollBodyRef.value?.scrollWidth || 0,
          clientWidth: scrollBodyRef.value?.clientWidth || 0,
        }
      })
    })
    onUpdated(() => {
      nextTick(() => {
        const scrollWidth = scrollBodyRef.value?.scrollWidth || 0
        const clientWidth = scrollBodyRef.value?.clientWidth || 0
        if (
          scrollBodySizeInfo.value.scrollWidth !== scrollWidth
          || scrollBodySizeInfo.value.clientWidth !== clientWidth
        ) {
          scrollBodySizeInfo.value = {
            scrollWidth,
            clientWidth,
          }
        }
      })
    })

    watchEffect(
      () => {
        if (props.internalHooks === INTERNAL_HOOKS && props.internalRefs) {
          props.internalRefs.body = scrollBodyRef.value
            ? (scrollBodyRef.value as any).$el || scrollBodyRef.value
            : null
        }
      },
      { flush: 'post' },
    )

    // Table layout
    const mergedTableLayout = computed(() => {
      if (props.tableLayout) {
        return props.tableLayout
      }
      if (fixColumn.value) {
        return mergedScrollX.value === 'max-content' ? 'auto' : 'fixed'
      }
      if (
        fixHeader.value
        || stickyState.value.isSticky
        || flattenColumns.value.some(({ ellipsis }) => ellipsis)
      ) {
        return 'fixed'
      }
      return 'auto'
    })

    const emptyNode = computed(() => {
      if (hasData.value) {
        return null
      }
      if (typeof props.emptyText === 'function') {
        return props.emptyText()
      }
      if (props.emptyText !== undefined) {
        return props.emptyText
      }
      return slots.emptyText?.() ?? 'No Data'
    })

    useProvideTable(
      reactive({
        prefixCls: mergedPrefixCls,
        classNames: toRef(props, 'classNames'),
        styles: toRef(props, 'styles'),
        getComponent,
        scrollbarSize,
        direction: mergedDirection,
        scrollX: mergedScrollX,
        fixedInfoList: computed(() =>
          flattenColumns.value.map((_, colIndex) =>
            getCellFixedInfo(
              colIndex,
              colIndex,
              flattenColumns.value,
              stickyOffsets.value,
              mergedDirection.value,
            ),
          ),
        ),
        isSticky: computed(() => stickyState.value.isSticky),
        summaryCollect,
        transformCellText: toRef(props, 'transformCellText') as any,
        colWidths,
        getRowKey,
        expandedKeys: mergedExpandedKeys,
        childrenColumnName: mergedChildrenColumnName,
        onRow: toRef(props, 'onRow') as any,
        componentWidth,
        fixColumn,
        horizonScroll,
        rowHoverable: mergedRowHoverable,
      }),
    )

    useProvideBody(
      reactive({
        rowClassName: computed(() => props.rowClassName || ''),
        expandedRowClassName: computed(() => expandableConfig.value.expandedRowClassName || ''),
        columns,
        flattenColumns,
        tableLayout: mergedTableLayout,
        indentSize: computed(() => expandableConfig.value.indentSize || 0),
        expandableType,
        expandRowByClick: computed(() => !!expandableConfig.value.expandRowByClick),
        expandedRowRender: computed(() => expandableConfig.value.expandedRowRender),
        expandIcon: mergedExpandIcon,
        onTriggerExpand,
        expandIconColumnIndex: computed(() => expandableConfig.value.expandIconColumnIndex || 0),
        expandedRowOffset: computed(() => expandableConfig.value.expandedRowOffset),
        rowExpandable: computed(() => expandableConfig.value.rowExpandable),
      }),
    )

    useProvideResize({
      onColumnResize,
    })

    useProvideExpandedRow({
      componentWidth,
      fixHeader,
      fixColumn,
      horizonScroll,
    })

    // Body
    const bodyTable = () => (
      <Body
        data={mergedData.value as any}
        measureColumnWidth={fixHeader.value || horizonScroll.value || stickyState.value.isSticky}
        expandedKeys={mergedExpandedKeys.value}
        rowExpandable={expandableConfig.value.rowExpandable}
        getRowKey={getRowKey.value}
        onRow={props.onRow || (() => ({}))}
        childrenColumnName={mergedChildrenColumnName.value}
        measureRowRender={props.measureRowRender}
        v-slots={{ emptyNode: () => emptyNode.value }}
      />
    )

    const bodyColGroup = () => (
      <ColGroup
        colWidths={flattenColumns.value.map(({ width }) => width ?? 0)}
        columns={flattenColumns.value}
      />
    )

    return () => {
      const {
        className,
        style,
        id,
        showHeader,
      } = props
      const { isSticky, offsetHeader, offsetSummary, offsetScroll, stickyClassName, container }
        = stickyState.value

      const titleNode = props.title
        ? props.title(mergedData.value as any)
        : slots.title?.({ pageData: mergedData.value }) || slots.title?.()
      const footerNode = props.footer
        ? props.footer(mergedData.value as any)
        : slots.footer?.({ pageData: mergedData.value }) || slots.footer?.()
      const summaryNode = props.summary
        ? props.summary(mergedData.value)
        : slots.summary?.({ pageData: mergedData.value })

      const dataProps = pickAttrs(attrs, { data: true })
      const ariaProps = pickAttrs(attrs, { aria: true })

      const captionElement
        = props.caption !== null && props.caption !== undefined
          ? (
              <caption class={`${mergedPrefixCls.value}-caption`}>{props.caption}</caption>
            )
          : null

      const TableComponent = getComponent(['table'], 'table')
      const customizeScrollBody = getComponent(['body']) as unknown as CustomizeScrollBody<any>

      let groupTableNode: () => any = () => null

      const headerProps = {
        colWidths: colWidths.value,
        columCount: flattenColumns.value.length,
        stickyOffsets: stickyOffsets.value,
        onHeaderRow: props.onHeaderRow || (() => ({})),
        fixHeader: fixHeader.value,
        scroll: props.scroll,
      }

      if (
        process.env.NODE_ENV !== 'production'
        && typeof customizeScrollBody === 'function'
        && hasData.value
        && !fixHeader.value
      ) {
        warning(false, '`components.body` with render props is only work on `scroll.y`.')
      }

      if (fixHeader.value || isSticky) {
        let bodyContent: () => any = () => null

        if (typeof customizeScrollBody === 'function') {
          bodyContent = () =>
            customizeScrollBody(mergedData.value, {
              scrollbarSize: scrollbarSize.value,
              ref: scrollBodyRef as any,
              onScroll: onInternalScroll,
            })

          headerProps.colWidths = flattenColumns.value.map(({ width }, index) => {
            const colWidth
              = index === flattenColumns.value.length - 1
                ? (width as number) - scrollbarSize.value
                : width
            if (typeof colWidth === 'number' && !Number.isNaN(colWidth)) {
              return colWidth
            }
            warning(
              false,
              'When use `components.body` with render props. Each column should have a fixed `width` value.',
            )

            return 0
          }) as number[]
        }
        else {
          bodyContent = () => (
            <div
              style={{
                ...scrollXStyle.value,
                ...scrollYStyle.value,
              }}
              onScroll={onBodyScroll}
              ref={scrollBodyRef}
              class={`${mergedPrefixCls.value}-body`}
            >
              <TableComponent
                style={{
                  ...scrollTableStyle.value,
                  tableLayout: mergedTableLayout.value,
                }}
                {...ariaProps}
              >
                {captionElement}
                {bodyColGroup()}
                {bodyTable()}
                {!fixFooter.value && summaryNode && (
                  <Footer stickyOffsets={stickyOffsets.value} flattenColumns={flattenColumns.value}>
                    {summaryNode}
                  </Footer>
                )}
              </TableComponent>
            </div>
          )
        }

        const fixedHolderProps = {
          noData: !mergedData.value.length,
          maxContentScroll: horizonScroll.value && mergedScrollX.value === 'max-content',
          ...headerProps,
          ...columnContext.value,
          direction: mergedDirection.value,
          stickyClassName,
          onScroll: onInternalScroll,
          scrollX: mergedScrollX.value,
          tableLayout: mergedTableLayout.value,
        }

        groupTableNode = () => (
          <>
            {showHeader !== false && (
              <FixedHolder
                {...fixedHolderProps}
                stickyTopOffset={offsetHeader}
                class={`${mergedPrefixCls.value}-header`}
                ref={scrollHeaderRef}
                v-slots={{
                  default: (fixedHolderPassProps: any) => (
                    <>
                      <Header {...fixedHolderPassProps} />
                      {fixFooter.value === 'top' && (
                        <Footer {...fixedHolderPassProps}>{summaryNode}</Footer>
                      )}
                    </>
                  ),
                }}
              >
              </FixedHolder>
            )}

            {bodyContent()}

            {fixFooter.value && fixFooter.value !== 'top' && (
              <FixedHolder
                {...fixedHolderProps}
                stickyBottomOffset={offsetSummary}
                class={`${mergedPrefixCls.value}-summary`}
                ref={scrollSummaryRef}
                v-slots={{
                  default: (fixedHolderPassProps: any) => (
                    <Footer {...fixedHolderPassProps}>{summaryNode}</Footer>
                  ),
                }}
              >
              </FixedHolder>
            )}

            {isSticky && scrollBodyRef.value instanceof Element && (
              <StickyScrollBar
                ref={stickyRef}
                offsetScroll={offsetScroll}
                scrollBodyRef={scrollBodyRef as any}
                onScroll={onInternalScroll}
                container={container as any}
                scrollBodySizeInfo={scrollBodySizeInfo.value}
              />
            )}
          </>
        )
      }
      else {
        groupTableNode = () => (
          <div
            style={{
              ...scrollXStyle.value,
              ...scrollYStyle.value,
              ...props.styles?.content,
            }}
            class={clsx(`${mergedPrefixCls.value}-content`, props.classNames?.content)}
            onScroll={onBodyScroll}
            ref={scrollBodyRef}
          >
            <TableComponent
              style={{ ...scrollTableStyle.value, tableLayout: mergedTableLayout.value }}
              {...ariaProps}
            >
              {captionElement}
              {bodyColGroup()}
              {showHeader !== false && <Header {...headerProps} {...columnContext.value} />}
              {bodyTable()}
              {summaryNode && (
                <Footer stickyOffsets={stickyOffsets.value} flattenColumns={flattenColumns.value}>
                  {summaryNode}
                </Footer>
              )}
            </TableComponent>
          </div>
        )
      }

      const tableStyle: CSSProperties = {
        ...style,
        ...(attrs.style as CSSProperties),
      }
      if (stickyState.value.isSticky) {
        tableStyle['--columns-count'] = flattenColumns.value.length
      }

      const firstFixed = flattenColumns.value[0]?.fixed
      const lastFixed = flattenColumns.value[columnCount.value - 1]?.fixed
      const hasFixStart = firstFixed === true || firstFixed === 'start' || firstFixed === 'left'
      const hasFixEnd = lastFixed === 'end' || lastFixed === 'right'

      let fullTable = (
        <div
          {...dataProps}
          class={clsx(
            mergedPrefixCls.value,
            className,
            {
              [`${mergedPrefixCls.value}-rtl`]: mergedDirection.value === 'rtl',
              [`${mergedPrefixCls.value}-fix-start-shadow`]: horizonScroll.value,
              [`${mergedPrefixCls.value}-fix-end-shadow`]: horizonScroll.value,
              [`${mergedPrefixCls.value}-fix-start-shadow-show`]: horizonScroll.value && shadowStart.value,
              [`${mergedPrefixCls.value}-fix-end-shadow-show`]: horizonScroll.value && shadowEnd.value,
              [`${mergedPrefixCls.value}-layout-fixed`]: mergedTableLayout.value === 'fixed',
              [`${mergedPrefixCls.value}-fixed-header`]: fixHeader.value,
              [`${mergedPrefixCls.value}-fixed-column`]: fixColumn.value,
              [`${mergedPrefixCls.value}-scroll-horizontal`]: horizonScroll.value,
              [`${mergedPrefixCls.value}-has-fix-start`]: hasFixStart,
              [`${mergedPrefixCls.value}-has-fix-end`]: hasFixEnd,
            },
            attrs.class as any,
          )}
          style={tableStyle}
          id={id}
          ref={fullTableRef}
        >
          {titleNode && (
            <Panel
              class={clsx(`${mergedPrefixCls.value}-title`, props.classNames?.title)}
              style={props.styles?.title}
            >
              {titleNode}
            </Panel>
          )}
          <div
            class={clsx(`${mergedPrefixCls.value}-container`, props.classNames?.section)}
            style={props.styles?.section}
          >
            {groupTableNode()}
          </div>
          {footerNode && (
            <Panel
              class={clsx(`${mergedPrefixCls.value}-footer`, props.classNames?.footer)}
              style={props.styles?.footer}
            >
              {footerNode}
            </Panel>
          )}
        </div>
      )

      if (horizonScroll.value) {
        const tableNode = fullTable
        fullTable = (
          <ResizeObserver onResize={onFullTableResize} v-slots={{ default: () => tableNode }} />
        )
      }
      return fullTable
    }
  },
  { name: 'VcTable', inheritAttrs: false },
)

export default Table
