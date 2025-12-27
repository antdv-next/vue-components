import type { CSSProperties } from 'vue'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { clsx } from '@v-c/util'
import { fillRef } from '@v-c/util/dist/createRef'
import ColGroup from '../ColGroup'
import { useInjectTableContext } from '../context/TableContext'
import type { HeaderProps } from '../Header/Header'
import type { ColumnsType, ColumnType, Direction, TableLayout } from '../interface'

function useColumnWidth(colWidths: readonly number[], columnCount: number) {
  return computed(() => {
    const cloneColumns: number[] = []
    for (let i = 0; i < columnCount; i += 1) {
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
  className: string
  style?: CSSProperties
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
  colGroup?: any
}

const FixedHolder = defineComponent<FixedHeaderProps<any>>({
  name: 'TableFixedHolder',
  props: [
    'className',
    'style',
    'noData',
    'columns',
    'flattenColumns',
    'colWidths',
    'colGroup',
    'columCount',
    'stickyOffsets',
    'direction',
    'fixHeader',
    'stickyTopOffset',
    'stickyBottomOffset',
    'stickyClassName',
    'scrollX',
    'tableLayout',
    'onScroll',
    'maxContentScroll',
  ] as any,
  setup(props, { slots, expose }) {
    const context = useInjectTableContext()
    const scrollRef = ref<HTMLDivElement | null>(null)

    expose({
      nativeElement: scrollRef,
    })

    const TableComponent = computed(() => context.getComponent(['header', 'table'], 'table'))
    const combinationScrollBarSize = computed(() => {
      return context.isSticky && !props.fixHeader ? 0 : context.scrollbarSize
    })

    const mergedColumnWidth = useColumnWidth(props.colWidths, props.columCount)

    const isColGroupEmpty = computed(() => {
      const widths = mergedColumnWidth.value
      const noWidth = !widths || !widths.length || widths.every(w => !w)
      return props.noData || noWidth
    })

    const columnsWithScrollbar = computed<ColumnsType<unknown>>(() => {
      const lastColumn = props.flattenColumns[props.flattenColumns.length - 1]
      const ScrollBarColumn: ColumnType<unknown> & { scrollbar: true } = {
        fixed: lastColumn ? lastColumn.fixed : null,
        scrollbar: true,
        onHeaderCell: () => ({
          className: `${context.prefixCls}-cell-scrollbar`,
        }),
      }
      return combinationScrollBarSize.value ? [...props.columns, ScrollBarColumn] : props.columns
    })

    const flattenColumnsWithScrollbar = computed(() => {
      const lastColumn = props.flattenColumns[props.flattenColumns.length - 1]
      const ScrollBarColumn: ColumnType<unknown> & { scrollbar: true } = {
        fixed: lastColumn ? lastColumn.fixed : null,
        scrollbar: true,
        onHeaderCell: () => ({
          className: `${context.prefixCls}-cell-scrollbar`,
        }),
      }
      return combinationScrollBarSize.value
        ? [...props.flattenColumns, ScrollBarColumn]
        : props.flattenColumns
    })

    const headerStickyOffsets = computed(() => {
      const { start, end } = props.stickyOffsets
      return {
        ...props.stickyOffsets,
        start,
        end: [...end.map(width => width + combinationScrollBarSize.value), 0],
        isSticky: context.isSticky,
      }
    })

    const setScrollRef = (element: HTMLElement | null) => {
      fillRef(scrollRef, element)
    }

    const onWheel = (event: WheelEvent) => {
      const currentTarget = event.currentTarget as HTMLDivElement
      const { deltaX } = event
      if (deltaX) {
        const { scrollLeft, scrollWidth, clientWidth } = currentTarget
        const maxScrollWidth = scrollWidth - clientWidth
        let nextScroll = scrollLeft + deltaX

        if (props.direction === 'rtl') {
          nextScroll = Math.max(-maxScrollWidth, nextScroll)
          nextScroll = Math.min(0, nextScroll)
        } else {
          nextScroll = Math.min(maxScrollWidth, nextScroll)
          nextScroll = Math.max(0, nextScroll)
        }

        props.onScroll({
          currentTarget,
          scrollLeft: nextScroll,
        })
        event.preventDefault()
      }
    }

    onMounted(() => {
      scrollRef.value?.addEventListener('wheel', onWheel, { passive: false })
    })

    onBeforeUnmount(() => {
      scrollRef.value?.removeEventListener('wheel', onWheel)
    })

    const slotProps = computed(() => ({
      ...props,
      columns: columnsWithScrollbar.value,
      flattenColumns: flattenColumnsWithScrollbar.value,
      stickyOffsets: headerStickyOffsets.value,
    }))

    return () => {
      const TableComp = TableComponent.value
      return (
        <div
          style={{
            overflow: 'hidden',
            ...(context.isSticky ? { top: props.stickyTopOffset, bottom: props.stickyBottomOffset } : {}),
            ...props.style,
          }}
          ref={setScrollRef}
          class={clsx(props.className, {
            [props.stickyClassName as string]: !!props.stickyClassName,
          })}
        >
          <TableComp
            style={{
              tableLayout: props.tableLayout,
              minWidth: '100%',
              width: typeof props.scrollX === 'number' ? `${props.scrollX}px` : props.scrollX,
            }}
          >
            {isColGroupEmpty.value ? (
              props.colGroup
            ) : (
              <ColGroup
                colWidths={[...(mergedColumnWidth.value || []), combinationScrollBarSize.value]}
                columCount={props.columCount + 1}
                columns={flattenColumnsWithScrollbar.value}
              />
            )}
            {slots.default?.(slotProps.value)}
          </TableComp>
        </div>
      )
    }
  },
})

export default FixedHolder
