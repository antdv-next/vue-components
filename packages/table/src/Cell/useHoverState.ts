import type { ComputedRef } from 'vue'
import type { OnHover } from '../hooks/useHover'
import type { TableContextProps } from '../context/TableContext'
import { computed } from 'vue'

function inHoverRange(cellStartRow: number, cellRowSpan: number, startRow: number, endRow: number) {
  const cellEndRow = cellStartRow + cellRowSpan - 1
  return cellStartRow <= endRow && cellEndRow >= startRow
}

export default function useHoverState(
  rowIndex: number,
  rowSpan: number,
  context: TableContextProps,
): [hovering: ComputedRef<boolean>, onHover: OnHover] {
  const hovering = computed(() => {
    return inHoverRange(rowIndex, rowSpan || 1, context.hoverStartRow, context.hoverEndRow)
  })

  return [hovering, context.onHover]
}
