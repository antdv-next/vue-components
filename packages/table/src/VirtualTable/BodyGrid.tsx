import type { CSSProperties } from 'vue'
import { computed, defineComponent, onBeforeUnmount, reactive, ref, shallowRef, toRef, watch } from 'vue'
import type { ListProps, ListRef } from '@v-c/virtual-list'
import VirtualList from '@v-c/virtual-list'
import { classNames } from '@v-c/util'
import type { ColumnType, GetRowKey, Key, OnCustomizeScroll, ScrollConfig } from '../interface'
import useFlattenRecords from '../hooks/useFlattenRecords'
import { useInjectBody } from '../context/BodyContext'
import { useInjectResize } from '../context/ResizeContext'
import { useInjectTable } from '../context/TableContext'
import { useProvideHover } from '../context/HoverContext'
import { getColumnsKey } from '../utils/valueUtil'
import BodyLine from './BodyLine'
import { useInjectStatic, useProvideGrid } from './context'

export interface GridProps<RecordType = any> {
  data: RecordType[]
  onScroll: OnCustomizeScroll
}

export interface GridRef {
  scrollLeft: number
  scrollTop: number
  nativeElement: HTMLDivElement
  scrollTo: (scrollConfig: ScrollConfig) => void
}

const EMPTY_EXPANDED_KEYS = new Set<Key>()

export default defineComponent<GridProps<any>>({
  name: 'BodyGrid',
  inheritAttrs: false,
  props: ['data', 'onScroll'] as any,
  setup(props, { expose }) {
    const tableContext = useInjectTable()
    const bodyContext = useInjectBody()
    const resizeContext = useInjectResize()
    const staticContext = useInjectStatic()

    const listRef = ref<ListRef>()

    const getRowKey = computed<GetRowKey<any>>(() => {
      if (tableContext.getRowKey) {
        return tableContext.getRowKey
      }
      return (record: any, index?: number) => record?.key ?? index
    })

    const expandedKeys = computed(() => tableContext.expandedKeys || EMPTY_EXPANDED_KEYS)
    const childrenColumnName = computed(() => tableContext.childrenColumnName || 'children')

    const flattenData = useFlattenRecords(
      toRef(props, 'data'),
      childrenColumnName,
      expandedKeys,
      getRowKey,
    )

    const columnsKey = computed(() => getColumnsKey(bodyContext.flattenColumns))

    const columnsWidth = computed<[key: Key, width: number, total: number][]>(() => {
      let total = 0
      return bodyContext.flattenColumns.map(({ width, minWidth, key }, index) => {
        const finalWidth = Math.max((width as number) || 0, (minWidth as number) || 0)
        total += finalWidth
        const columnKey = (key ?? columnsKey.value[index]) as Key
        return [columnKey, finalWidth, total]
      })
    })

    const columnsOffset = computed<number[]>(() => columnsWidth.value.map(item => item[2]))

    watch(
      columnsWidth,
      widths => {
        widths.forEach(([key, width]) => {
          resizeContext.onColumnResize(key, width)
        })
      },
      { immediate: true },
    )

    // ========================= Context ==========================
    useProvideGrid(
      reactive({
        columnsOffset,
      }),
    )

    // =========================== Hover ==========================
    const startRow = shallowRef(-1)
    const endRow = shallowRef(-1)
    let hoverTimeoutId: ReturnType<typeof setTimeout> | undefined
    useProvideHover({
      startRow,
      endRow,
      onHover: (start, end) => {
        if (hoverTimeoutId) {
          clearTimeout(hoverTimeoutId)
        }
        hoverTimeoutId = setTimeout(() => {
          startRow.value = start
          endRow.value = end
        }, 100)
      },
    })
    onBeforeUnmount(() => {
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId)
      }
    })

    // =========================== Ref ===========================
    const getNativeElement = () => {
      const native = listRef.value?.nativeElement as any
      if (native && typeof native === 'object' && 'value' in native) {
        return native.value
      }
      return native
    }

    const exposed: GridRef = {
      scrollTo: (config: ScrollConfig) => {
        if (!config) {
          return
        }
        const { offset, ...restConfig } = config
        if (offset) {
          listRef.value?.scrollTo({ ...restConfig, offset, align: 'top' } as any)
        } else {
          listRef.value?.scrollTo(config as any)
        }
      },
      get nativeElement() {
        return getNativeElement()
      },
      get scrollLeft() {
        return listRef.value?.getScrollInfo().x || 0
      },
      set scrollLeft(value: number) {
        listRef.value?.scrollTo({ left: value })
      },
      get scrollTop() {
        return listRef.value?.getScrollInfo().y || 0
      },
      set scrollTop(value: number) {
        listRef.value?.scrollTo({ top: value })
      },
    }

    expose(exposed)

    // ======================= Col/Row Span =======================
    const getRowSpan = (column: ColumnType<any>, index: number): number => {
      const record = flattenData.value[index]?.record
      const cellProps = column.customCell
        ? column.customCell(record, index, column)
        : column.onCell?.(record, index, column)
      const rowSpan = cellProps?.rowSpan ?? (cellProps as any)?.rowspan
      if (rowSpan === undefined || rowSpan === null) {
        return 1
      }
      return rowSpan
    }

    const extraRender: ListProps['extraRender'] = (info: any) => {
      const { start, end, getSize, offsetY } = info

      if (end < 0) {
        return null
      }

      // Find first rowSpan column
      let firstRowSpanColumns = bodyContext.flattenColumns.filter(
        column => getRowSpan(column, start) === 0,
      )

      let startIndex = start
      for (let i = start; i >= 0; i -= 1) {
        firstRowSpanColumns = firstRowSpanColumns.filter(column => getRowSpan(column, i) === 0)

        if (!firstRowSpanColumns.length) {
          startIndex = i
          break
        }
      }

      // Find last rowSpan column
      let lastRowSpanColumns = bodyContext.flattenColumns.filter(
        column => getRowSpan(column, end) !== 1,
      )

      let endIndex = end
      for (let i = end; i < flattenData.value.length; i += 1) {
        lastRowSpanColumns = lastRowSpanColumns.filter(column => getRowSpan(column, i) !== 1)

        if (!lastRowSpanColumns.length) {
          endIndex = Math.max(i - 1, end)
          break
        }
      }

      // Collect the line who has rowSpan
      const spanLines: number[] = []
      for (let i = startIndex; i <= endIndex; i += 1) {
        const item = flattenData.value[i]
        if (!item) {
          continue
        }
        if (bodyContext.flattenColumns.some(column => getRowSpan(column, i) > 1)) {
          spanLines.push(i)
        }
      }

      const nodes = spanLines.map(index => {
        const item = flattenData.value[index]
        const rowKey = getRowKey.value(item.record, index)
        const getHeight = (rowSpan: number) => {
          const endItemIndex = index + rowSpan - 1
          const endItemKey = getRowKey.value(flattenData.value[endItemIndex].record, endItemIndex)
          const sizeInfo = getSize(rowKey, endItemKey)
          return sizeInfo.bottom - sizeInfo.top
        }

        const sizeInfo = getSize(rowKey)

        return (
          <BodyLine
            key={index}
            data={item}
            rowKey={rowKey}
            index={index}
            style={{ top: -offsetY + sizeInfo.top }}
            extra
            getHeight={getHeight}
          />
        )
      })

      return nodes as any
    }

    return () => {
      const { onScroll } = props
      const { prefixCls, direction, scrollX, classNames: tableClassNames, styles } = tableContext
      const { body: bodyCls = {} } = tableClassNames || {}
      const { body: bodyStyles = {} } = styles || {}
      const { scrollY, listItemHeight, sticky, getComponent, onScroll: onTableScroll } = staticContext

      const mergedScrollX = typeof scrollX === 'number' ? scrollX : 0

      const tblPrefixCls = `${prefixCls}-tbody`
      const wrapperComponent = getComponent(['body', 'wrapper'])

      const horizontalScrollBarStyle: CSSProperties = {}
      if (sticky) {
        horizontalScrollBarStyle.position = 'sticky'
        horizontalScrollBarStyle.bottom = 0
        if (typeof sticky === 'object' && sticky.offsetScroll) {
          horizontalScrollBarStyle.bottom = sticky.offsetScroll
        }
      }

      return (
        <VirtualList
          ref={listRef as any}
          fullHeight={false}
          prefixCls={`${tblPrefixCls}-virtual`}
          styles={{ horizontalScrollBar: horizontalScrollBarStyle }}
          class={classNames(tblPrefixCls, bodyCls.wrapper)}
          style={bodyStyles.wrapper}
          height={scrollY}
          itemHeight={listItemHeight || 24}
          data={flattenData.value}
          itemKey={item => getRowKey.value(item.record)}
          component={wrapperComponent}
          scrollWidth={mergedScrollX}
          direction={direction}
          onVirtualScroll={({ x }) => {
            onScroll({
              currentTarget: getNativeElement(),
              scrollLeft: x,
            })
          }}
          onScroll={onTableScroll}
          extraRender={extraRender}
          v-slots={{
            default: (slotProps: { item: any; index: number; style: CSSProperties }) => {
              const { item, index, style } = slotProps
              const rowKey = getRowKey.value(item.record, index)
              return <BodyLine data={item} rowKey={rowKey} index={index} style={style} />
            },
          }}
        />
      )
    }
  },
})
