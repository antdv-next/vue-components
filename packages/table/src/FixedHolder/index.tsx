import type { HeaderProps } from '../Header/Header'
import ColGroup from '../ColGroup'
import type { ColumnsType, ColumnType, DefaultRecordType, Direction, TableLayout } from '../interface'
import type { Ref } from 'vue'
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  watchEffect,
} from 'vue'
import { useInjectTable } from '../context/TableContext'
import { classNames } from '@v-c/util'
import { addEventListener } from '@v-c/util/dist/Dom/addEventListener'

function useColumnWidth(colWidthsRef: Ref<readonly number[]>, columCountRef: Ref<number>) {
  return computed(() => {
    const cloneColumns: number[] = []
    const colWidths = colWidthsRef.value
    const columCount = columCountRef.value
    for (let i = 0; i < columCount; i += 1) {
      const val = colWidths[i]
      if (val !== undefined) {
        cloneColumns[i] = val
      } else {
        return null
      }
    }
    return cloneColumns
  })
}

export interface FixedHeaderProps<RecordType> extends HeaderProps<RecordType> {
  noData: boolean
  maxContentScroll: boolean
  colWidths: readonly number[]
  columCount: number
  direction: Direction
  fixHeader: boolean
  stickyTopOffset?: number
  stickyBottomOffset?: number
  stickyClassName?: string
  scrollX?: number | string | true
  tableLayout?: TableLayout
  onScroll: (info: { currentTarget: HTMLDivElement; scrollLeft?: number }) => void
}

export default defineComponent<FixedHeaderProps<DefaultRecordType>>({
  name: 'FixedHolder',
  inheritAttrs: false,
  props: [
    'columns',
    'flattenColumns',
    'stickyOffsets',
    'onHeaderRow',
    'noData',
    'maxContentScroll',
    'colWidths',
    'columCount',
    'direction',
    'fixHeader',
    'stickyTopOffset',
    'stickyBottomOffset',
    'stickyClassName',
    'scrollX',
    'tableLayout',
  ] as any,
  emits: ['scroll'],
  setup(props, { attrs, slots, emit }) {
    const tableContext = useInjectTable()
    const combinationScrollBarSize = computed(() =>
      tableContext.isSticky && !props.fixHeader ? 0 : tableContext.scrollbarSize,
    )
    const scrollRef = ref()
    const onWheel = (e: WheelEvent) => {
      const { currentTarget, deltaX } = e
      if (deltaX) {
        emit('scroll', { currentTarget, scrollLeft: (currentTarget as any).scrollLeft + deltaX })
        e.preventDefault()
      }
    }
    const wheelEvent = ref<{ remove: () => void }>()
    onMounted(() => {
      nextTick(() => {
        wheelEvent.value = addEventListener(scrollRef.value as any, 'wheel', onWheel as any)
      })
    })
    onBeforeUnmount(() => {
      wheelEvent.value?.remove()
    })

    const allFlattenColumnsWithWidth = computed(() =>
      props.flattenColumns.every(
        column => column.width && column.width !== 0 && column.width !== '0px',
      ),
    )

    const columnsWithScrollbar = ref<ColumnsType<DefaultRecordType>>([])
    const flattenColumnsWithScrollbar = ref<ColumnsType<DefaultRecordType>>([])

    watchEffect(() => {
      const lastColumn = props.flattenColumns[props.flattenColumns.length - 1]
      const ScrollBarColumn: ColumnType<DefaultRecordType> & { scrollbar: true } = {
        fixed: lastColumn?.fixed,
        scrollbar: true,
        onHeaderCell: () => ({
          class: `${tableContext.prefixCls}-cell-scrollbar`,
        }),
      }

      columnsWithScrollbar.value = combinationScrollBarSize.value
        ? [...props.columns, ScrollBarColumn]
        : props.columns

      flattenColumnsWithScrollbar.value = combinationScrollBarSize.value
        ? [...props.flattenColumns, ScrollBarColumn]
        : props.flattenColumns
    })

    const headerStickyOffsets = computed(() => {
      const { start, end } = props.stickyOffsets
      const nextEnd = [...end.map(width => width + combinationScrollBarSize.value), 0]
      const nextStart = start
      const isRtl = props.direction === 'rtl'
      return {
        ...props.stickyOffsets,
        start: nextStart,
        end: nextEnd,
        left: isRtl ? nextEnd : nextStart,
        right: isRtl ? nextStart : nextEnd,
        isSticky: tableContext.isSticky,
      }
    })

    const mergedColumnWidth = useColumnWidth(toRef(props, 'colWidths'), toRef(props, 'columCount'))

    return () => {
      const {
        noData,
        columCount,
        stickyTopOffset,
        stickyBottomOffset,
        stickyClassName,
        maxContentScroll,
        scrollX,
        tableLayout = 'fixed',
      } = props
      const { isSticky, getComponent } = tableContext
      const TableComponent = getComponent(['header', 'table'], 'table')
      const mergedScrollX = scrollX === true ? undefined : scrollX

      const stickyClasses = stickyClassName ? { [stickyClassName]: true } : null
      return (
        <div
          style={{
            overflow: 'hidden',
            ...(isSticky ? { top: `${stickyTopOffset}px`, bottom: `${stickyBottomOffset}px` } : {}),
            ...((attrs.style as any) || {}),
          }}
          ref={scrollRef}
          class={classNames(attrs.class as any, stickyClasses)}
        >
          <TableComponent
            style={{
              tableLayout,
              minWidth: '100%',
              width: mergedScrollX,
            }}
          >
            {(!noData || !maxContentScroll || allFlattenColumnsWithWidth.value) && (
                <ColGroup
                  colWidths={
                    mergedColumnWidth.value
                      ? [...mergedColumnWidth.value, combinationScrollBarSize.value]
                      : []
                  }
                  columCount={columCount + 1}
                  columns={flattenColumnsWithScrollbar.value as any}
                />
            )}
            {slots.default?.({
              ...props,
              stickyOffsets: headerStickyOffsets.value,
              columns: columnsWithScrollbar.value,
              flattenColumns: flattenColumnsWithScrollbar.value,
            })}
          </TableComponent>
        </div>
      )
    }
  },
})
