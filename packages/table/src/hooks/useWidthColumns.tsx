import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { ColumnType } from '../interface'

function parseColWidth(totalWidth: number, width?: string | number) {
  if (typeof width === 'number') {
    return width
  }
  if (typeof width === 'string' && width.endsWith('%')) {
    return (totalWidth * parseFloat(width)) / 100
  }
  return null
}

export default function useWidthColumns(
  flattenColumns: ComputedRef<readonly ColumnType<any>[]>,
  scrollWidthRef: Ref<number | null | undefined>,
  clientWidthRef: Ref<number>,
) {
  const result = computed(() => {
    const scrollWidth = scrollWidthRef.value
    const columns = flattenColumns.value
    if (scrollWidth && scrollWidth > 0) {
      let totalWidth = 0
      let missWidthCount = 0

      columns.forEach((col: ColumnType<any>) => {
        const colWidth = parseColWidth(scrollWidth, col.width as any)
        if (colWidth) {
          totalWidth += colWidth
        } else {
          missWidthCount += 1
        }
      })

      const maxFitWidth = Math.max(scrollWidth, clientWidthRef.value || 0)
      let restWidth = Math.max(maxFitWidth - totalWidth, missWidthCount)
      let restCount = missWidthCount
      const avgWidth = missWidthCount ? restWidth / missWidthCount : 0

      let realTotal = 0
      const filledColumns = columns.map(col => {
        const clone = {
          ...col,
        }

        const colWidth = parseColWidth(scrollWidth, clone.width as any)
        if (colWidth) {
          clone.width = colWidth
        } else {
          const colAvgWidth = Math.floor(avgWidth)
          clone.width = restCount === 1 ? restWidth : colAvgWidth
          restWidth -= colAvgWidth
          restCount -= 1
        }
        realTotal += clone.width as number
        return clone
      })

      if (realTotal < maxFitWidth) {
        const scale = maxFitWidth / realTotal
        restWidth = maxFitWidth

        filledColumns.forEach((col, index) => {
          const colWidth = Math.floor((col.width as number) * scale)
          col.width = index === filledColumns.length - 1 ? restWidth : colWidth
          restWidth -= colWidth
        })
      }

      return {
        columns: filledColumns,
        realScrollWidth: Math.max(realTotal, maxFitWidth),
      }
    }

    return {
      columns,
      realScrollWidth: scrollWidth ?? undefined,
    }
  })

  const filledColumns = computed(() => result.value.columns)
  const realScrollWidth = computed(() => result.value.realScrollWidth)

  return [filledColumns, realScrollWidth] as const
}
