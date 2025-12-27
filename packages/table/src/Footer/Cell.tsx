import { defineComponent, computed } from 'vue'
import Cell from '../Cell'
import { useInjectTableContext } from '../context/TableContext'
import type { AlignType } from '../interface'
import { getCellFixedInfo } from '../utils/fixUtil'
import { useInjectSummaryContext } from './SummaryContext'

export interface SummaryCellProps {
  className?: string
  index: number
  colSpan?: number
  rowSpan?: number
  align?: AlignType
}

const SummaryCell = defineComponent<SummaryCellProps>({
  name: 'TableSummaryCell',
  props: ['className', 'index', 'colSpan', 'rowSpan', 'align'] as any,
  setup(props, { slots }) {
    const { prefixCls } = useInjectTableContext()
    const summaryContext = useInjectSummaryContext()

    const mergedColSpan = computed(() => {
      const lastIndex = props.index + (props.colSpan || 1) - 1
      const scrollColumnIndex = summaryContext.scrollColumnIndex
      return scrollColumnIndex !== null && lastIndex + 1 === scrollColumnIndex
        ? (props.colSpan || 1) + 1
        : (props.colSpan || 1)
    })

    const fixedInfo = computed(() => {
      const stickyOffsets = summaryContext.stickyOffsets || { start: [], end: [], widths: [] }
      return getCellFixedInfo(
        props.index,
        props.index + mergedColSpan.value - 1,
        summaryContext.flattenColumns || [],
        stickyOffsets as any,
      )
    })

    return () => (
      <Cell
        className={props.className}
        index={props.index}
        component="td"
        prefixCls={prefixCls}
        record={null as any}
        dataIndex={null as any}
        align={props.align}
        colSpan={mergedColSpan.value}
        rowSpan={props.rowSpan}
        render={() => slots.default?.()}
        {...fixedInfo.value}
      />
    )
  },
})

export default SummaryCell
