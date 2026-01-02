import type { Ref } from 'vue'
import type { ColumnType, StickyOffsets } from '../interface'
import { computed, unref } from 'vue'

export default function useStickyOffsets<RecordType>(
  colWidths: Ref<(number | undefined)[]> | (number | undefined)[],
  flattenColumns: Ref<readonly ColumnType<RecordType>[]> | readonly ColumnType<RecordType>[],
) {
  return computed<StickyOffsets>(() => {
    const mergedWidths = unref(colWidths) || []
    const mergedColumns = unref(flattenColumns) || []
    const columnCount = mergedColumns.length
    const parseWidth = (value: unknown) => {
      if (typeof value === 'number') {
        return Number.isFinite(value) && value > 0 ? value : null
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.endsWith('%')) {
          return null
        }
        const parsed = trimmed.endsWith('px') ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed)
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null
      }
      return null
    }

    const normalizedWidths = mergedColumns.map((column, index) => {
      return parseWidth(mergedWidths[index]) ?? parseWidth(column?.width) ?? 0
    })

    const getOffsets = (startIndex: number, endIndex: number, offset: number) => {
      const offsets: number[] = []
      let total = 0

      for (let i = startIndex; i !== endIndex; i += offset) {
        offsets.push(total)
        if (mergedColumns[i]?.fixed) {
          total += normalizedWidths[i] || 0
        }
      }

      return offsets
    }

    const startOffsets = getOffsets(0, columnCount, 1)
    const endOffsets = getOffsets(columnCount - 1, -1, -1).reverse()

    return {
      start: startOffsets,
      end: endOffsets,
      widths: normalizedWidths,
    }
  })
}
