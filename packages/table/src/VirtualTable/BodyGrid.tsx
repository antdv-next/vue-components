import type { ListRef } from '@v-c/virtual-list'
import type { CSSProperties } from 'vue'
import type { ColumnType, Key, OnCustomizeScroll, ScrollConfig } from '../interface'
import VirtualList from '@v-c/virtual-list'
import { computed, defineComponent, reactive, ref, watch, watchEffect } from 'vue'
import { useInjectTableContext } from '../context/TableContext'
import useFlattenRecords from '../hooks/useFlattenRecords'
import BodyLine from './BodyLine'
import { useInjectStaticContext, useProvideGridContext } from './context'

export interface GridProps<RecordType = any> {
  data: RecordType[]
  onScroll: OnCustomizeScroll
}

export interface GridRef {
  scrollLeft: number
  nativeElement: HTMLDivElement
  scrollTo: (scrollConfig: ScrollConfig) => void
}

const BodyGrid = defineComponent<GridProps<any>>({
  name: 'TableBodyGrid',
  props: ['data', 'onScroll'] as any,
  setup(props, { expose }) {
    const tableContext = useInjectTableContext()
    const staticContext = useInjectStaticContext()
    const listRef = ref<ListRef | null>(null)

    const flattenData = useFlattenRecords(
      computed(() => props.data),
      computed(() => tableContext.childrenColumnName),
      computed(() => tableContext.expandedKeys),
      computed(() => tableContext.getRowKey),
    )

    const columnsWidth = computed<[key: Key, width: number, total: number][]>(() => {
      let total = 0
      return tableContext.flattenColumns.map(({ width, minWidth, key }) => {
        const finalWidth = Math.max((width as number) || 0, (minWidth as number) || 0)
        total += finalWidth
        return [key as Key, finalWidth, total]
      })
    })

    const columnsOffset = computed(() => columnsWidth.value.map(colWidth => colWidth[2]))

    watch(
      columnsWidth,
      (newColumns) => {
        newColumns.forEach(([key, width]) => {
          tableContext.onColumnResize(key, width)
        })
      },
      { immediate: true },
    )

    const gridContext = reactive({
      columnsOffset: [] as number[],
    })
    watchEffect(() => {
      gridContext.columnsOffset = columnsOffset.value
    })
    useProvideGridContext(gridContext)

    const getRowSpan = (column: ColumnType<any>, index: number): number => {
      const record = flattenData.value[index]?.record
      const { onCell } = column

      if (onCell) {
        const cellProps = onCell(record, index) as any
        return cellProps?.rowSpan ?? 1
      }
      return 1
    }

    const extraRender = (info: any) => {
      const { start, end, getSize, offsetY } = info

      if (end < 0) {
        return null
      }

      let firstRowSpanColumns = tableContext.flattenColumns.filter(
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

      let lastRowSpanColumns = tableContext.flattenColumns.filter(
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

      const spanLines: number[] = []
      for (let i = startIndex; i <= endIndex; i += 1) {
        const item = flattenData.value[i]
        if (!item) {
          continue
        }

        if (tableContext.flattenColumns.some(column => getRowSpan(column, i) > 1)) {
          spanLines.push(i)
        }
      }

      if (!spanLines.length) {
        return null
      }

      return spanLines.map((index) => {
        const item = flattenData.value[index]
        if (!item) {
          return null
        }

        const rowKey = item.rowKey

        const getHeight = (rowSpan: number) => {
          const endItemIndex = index + rowSpan - 1
          const endItem = flattenData.value[endItemIndex]
          if (!endItem) {
            return 0
          }
          const endItemKey = endItem.rowKey
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
            style={{
              top: -offsetY + sizeInfo.top,
            }}
            extra
            getHeight={getHeight}
          />
        )
      })
    }

    const exposed: any = {
      scrollTo: (config: ScrollConfig) => {
        if (!listRef.value) {
          return
        }
        const { offset, ...restConfig } = config || {}
        if (offset) {
          listRef.value.scrollTo({ ...restConfig, offset, align: 'top' } as any)
        }
        else {
          listRef.value.scrollTo(config as any)
        }
      },
      get nativeElement() {
        const native = listRef.value?.nativeElement as any
        return native && typeof native === 'object' && 'value' in native ? native.value : native
      },
    }

    Object.defineProperty(exposed, 'scrollLeft', {
      get: () => listRef.value?.getScrollInfo().x || 0,
      set: (value: number) => {
        listRef.value?.scrollTo({ left: value })
      },
    })

    Object.defineProperty(exposed, 'scrollTop', {
      get: () => listRef.value?.getScrollInfo().y || 0,
      set: (value: number) => {
        listRef.value?.scrollTo({ top: value })
      },
    })

    expose(exposed)

    return () => {
      const tblPrefixCls = `${tableContext.prefixCls}-tbody`
      const wrapperComponent = staticContext.getComponent?.(['body', 'wrapper'], 'div') || 'div'

      const horizontalScrollBarStyle: CSSProperties = {}
      if (staticContext.sticky) {
        horizontalScrollBarStyle.position = 'sticky'
        horizontalScrollBarStyle.bottom = 0
        if (typeof staticContext.sticky === 'object' && staticContext.sticky.offsetScroll) {
          horizontalScrollBarStyle.bottom = staticContext.sticky.offsetScroll
        }
      }

      const VirtualListAny = VirtualList as any

      return (
        <VirtualListAny
          fullHeight={false}
          ref={listRef}
          prefixCls={`${tblPrefixCls}-virtual`}
          styles={{ horizontalScrollBar: horizontalScrollBarStyle }}
          class={tblPrefixCls}
          height={staticContext.scrollY}
          itemHeight={staticContext.listItemHeight || 24}
          data={flattenData.value}
          itemKey={(item: any) => item.rowKey}
          component={wrapperComponent}
          scrollWidth={tableContext.scrollX as number}
          direction={tableContext.direction}
          onVirtualScroll={({ x }: { x: number }) => {
            props.onScroll?.({
              currentTarget: exposed.nativeElement,
              scrollLeft: x,
            })
          }}
          onScroll={staticContext.onScroll as any}
          extraRender={extraRender}
        >
          {(dataInfo: Record<string, any>) => {
            const { item, index, ...itemProps } = dataInfo
            return (
              <BodyLine
                data={dataInfo.item}
                rowKey={item.rowKey}
                index={index}
                style={itemProps?.style}
              />
            )
          }}
        </VirtualListAny>
      )
    }
  },
})

export default BodyGrid
