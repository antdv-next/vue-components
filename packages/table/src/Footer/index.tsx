import { defineComponent, reactive, watchEffect } from 'vue'
import { useInjectTableContext } from '../context/TableContext'
import type { ColumnType, StickyOffsets } from '../interface'
import Summary from './Summary'
import SummaryRow from './Row'
import SummaryCell from './Cell'
import { useProvideSummaryContext } from './SummaryContext'

type FlattenColumns<RecordType> = readonly (ColumnType<RecordType> & { scrollbar?: boolean })[]

export interface FooterProps<RecordType> {
  stickyOffsets: StickyOffsets
  flattenColumns: FlattenColumns<RecordType>
}

const Footer = defineComponent<FooterProps<any>>({
  name: 'TableFooter',
  props: ['stickyOffsets', 'flattenColumns'] as any,
  setup(props, { slots }) {
    const { prefixCls } = useInjectTableContext()

    const summaryContext = reactive({
      stickyOffsets: props.stickyOffsets,
      flattenColumns: props.flattenColumns,
      scrollColumnIndex: null as number | null,
    })
    watchEffect(() => {
      const lastColumnIndex = props.flattenColumns.length - 1
      const scrollColumn = props.flattenColumns[lastColumnIndex]
      summaryContext.stickyOffsets = props.stickyOffsets
      summaryContext.flattenColumns = props.flattenColumns
      summaryContext.scrollColumnIndex = scrollColumn?.scrollbar ? lastColumnIndex : null
    })

    useProvideSummaryContext(summaryContext)

    return () => (
      <tfoot class={`${prefixCls}-summary`}>
        {slots.default?.()}
      </tfoot>
    )
  },
})

export default Footer

export const FooterComponents = Summary
export { SummaryRow, SummaryCell }
