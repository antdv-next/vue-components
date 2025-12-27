import type { Ref } from 'vue'
import type { ColumnsType } from '../../interface'
import { computed, unref } from 'vue'

function parseColWidth(totalWidth: number, width: string | number = '') {
  if (typeof width === 'number') {
    return width
  }

  if (typeof width === 'string' && width.endsWith('%')) {
    return (totalWidth * parseFloat(width)) / 100
  }
  return null
}

export default function useWidthColumns(
  flattenColumns: Ref<ColumnsType<any>> | ColumnsType<any>,
  scrollWidth: Ref<number | null | undefined> | number | null | undefined,
  clientWidth: Ref<number> | number,
) {
  return computed<[columns: ColumnsType<any>, realScrollWidth: number | undefined]>(() => {
    const mergedColumns = unref(flattenColumns) || []
    const mergedScrollWidth = unref(scrollWidth)
    const mergedClientWidth = unref(clientWidth)

    if (mergedScrollWidth && mergedScrollWidth > 0) {
      let totalWidth = 0
      let missWidthCount = 0

      mergedColumns.forEach((col: any) => {
        const colWidth = parseColWidth(mergedScrollWidth, col.width)
        if (colWidth) {
          totalWidth += colWidth
        }
        else {
          missWidthCount += 1
        }
      })

      const maxFitWidth = Math.max(mergedScrollWidth, mergedClientWidth)
      let restWidth = Math.max(maxFitWidth - totalWidth, missWidthCount)
      let restCount = missWidthCount
      const avgWidth = restWidth / missWidthCount

      let realTotal = 0
      const filledColumns = mergedColumns.map((col: any) => {
        const clone = { ...col }
        const colWidth = parseColWidth(mergedScrollWidth, clone.width)

        if (colWidth) {
          clone.width = colWidth
        }
        else {
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

        filledColumns.forEach((col: any, index: number) => {
          const colWidth = Math.floor((col.width as number) * scale)
          col.width = index === filledColumns.length - 1 ? restWidth : colWidth
          restWidth -= colWidth
        })
      }

      return [filledColumns, Math.max(realTotal, maxFitWidth)]
    }

    return [mergedColumns, mergedScrollWidth ?? undefined]
  })
}
