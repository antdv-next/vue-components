import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { TableContextProps } from '../context/TableContext'
import type { OnHover } from '../hooks/useHover'
import { computed, inject, provide, shallowRef } from 'vue'

function inHoverRange(cellStartRow: number, cellRowSpan: number, startRow: number, endRow: number) {
  const cellEndRow = cellStartRow + cellRowSpan - 1
  return cellStartRow <= endRow && cellEndRow >= startRow
}

const RowHoverKey: InjectionKey<Ref<boolean>> = Symbol('TableRowHover')

// Cells outside a body row (header, summary) never hover.
const NEVER_HOVERING = shallowRef(false)

/**
 * One memoized "is this row hovered" per body row, shared by all of its cells.
 *
 * The memo matters: a cell's render effect depends on this computed, not on
 * `hoverStartRow` / `hoverEndRow` directly, so moving the hover to another row
 * only re-renders the rows whose boolean actually flipped instead of every
 * cell in the table. Keeping it per row instead of per cell divides the number
 * of computeds by the column count.
 */
export function provideRowHover(rowIndex: Ref<number>, context: TableContextProps) {
  provide(RowHoverKey, computed(() => inHoverRange(rowIndex.value, 1, context.hoverStartRow, context.hoverEndRow)))
}

export default function useHoverState(
  context: TableContextProps,
): [getHovering: (rowIndex: number, rowSpan: number) => boolean, onHover: OnHover] {
  const rowHovering = inject(RowHoverKey, NEVER_HOVERING)

  // A cell spanning several rows needs its own range; create it on demand and
  // keep it as long as the span does not change.
  let spanHovering: { rowIndex: number, rowSpan: number, ref: ComputedRef<boolean> } | undefined

  const getHovering = (rowIndex: number, rowSpan: number) => {
    if (!rowSpan || rowSpan === 1) {
      return rowHovering.value
    }
    if (!spanHovering || spanHovering.rowIndex !== rowIndex || spanHovering.rowSpan !== rowSpan) {
      spanHovering = {
        rowIndex,
        rowSpan,
        ref: computed(() => inHoverRange(rowIndex, rowSpan, context.hoverStartRow, context.hoverEndRow)),
      }
    }
    return spanHovering.ref.value
  }

  return [getHovering, context.onHover]
}
