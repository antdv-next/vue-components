import type { ColumnType } from './interface'
import { defineComponent } from 'vue'
import { useInjectTableContext } from './context/TableContext'
import { INTERNAL_COL_DEFINE } from './utils/legacyUtil'

export interface ColGroupProps<RecordType> {
  colWidths: readonly (number | string)[]
  columns?: readonly ColumnType<RecordType>[]
  columCount?: number
}

const ColGroup = defineComponent<ColGroupProps<any>>({
  name: 'TableColGroup',
  props: ['colWidths', 'columns', 'columCount'] as any,
  setup(props) {
    const context = useInjectTableContext()
    return () => {
      const { colWidths, columns, columCount } = props
      const cols: any[] = []
      const len = columCount || columns?.length || 0

      let mustInsert = false
      for (let i = len - 1; i >= 0; i -= 1) {
        const width = colWidths[i]
        const column = columns && columns[i]
        let additionalProps: Record<string, any> | undefined
        let minWidth: number | undefined
        if (column) {
          additionalProps = (column as any)[INTERNAL_COL_DEFINE]
          if (context.tableLayout === 'auto') {
            minWidth = column.minWidth
          }
        }

        if (width || minWidth || additionalProps || mustInsert) {
          const mergedWidth = typeof width === 'number' ? `${width}px` : width
          const mergedMinWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth
          const { columnType, ...restAdditionalProps } = additionalProps || {}
          cols.unshift(
            <col key={i} style={{ width: mergedWidth, minWidth: mergedMinWidth }} {...restAdditionalProps} />,
          )
          mustInsert = true
        }
      }

      return cols.length > 0 ? <colgroup>{cols}</colgroup> : null
    }
  },
})

export default ColGroup
