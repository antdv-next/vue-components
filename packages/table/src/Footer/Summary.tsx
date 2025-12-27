import { defineComponent } from 'vue'
import SummaryCell from './Cell'
import SummaryRow from './Row'

export interface SummaryProps {
  fixed?: boolean | 'top' | 'bottom'
}

const Summary = defineComponent<SummaryProps>({
  name: 'TableSummary',
  props: ['fixed'] as any,
  setup(_props, { slots }) {
    return () => slots.default?.()
  },
}) as any

Summary.Row = SummaryRow
Summary.Cell = SummaryCell

export default Summary
