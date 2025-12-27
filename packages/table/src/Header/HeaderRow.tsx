import { defineComponent } from 'vue'
import { clsx } from '@v-c/util'
import Cell from '../Cell'
import { useInjectTableContext } from '../context/TableContext'
import type {
  CellType,
  ColumnType,
  CustomizeComponent,
  GetComponentProps,
  StickyOffsets,
} from '../interface'
import { getCellFixedInfo } from '../utils/fixUtil'
import { getColumnsKey } from '../utils/valueUtil'
import type { TableProps } from '../Table'

export interface RowProps<RecordType> {
  cells: readonly CellType<RecordType>[]
  stickyOffsets: StickyOffsets
  flattenColumns: readonly ColumnType<RecordType>[]
  rowComponent: CustomizeComponent
  cellComponent: CustomizeComponent
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>
  index: number
  classNames: TableProps['classNames']['header']
  styles: TableProps['styles']['header']
}

const HeaderRow = defineComponent<RowProps<any>>({
  name: 'TableHeaderRow',
  props: [
    'cells',
    'stickyOffsets',
    'flattenColumns',
    'rowComponent',
    'cellComponent',
    'onHeaderRow',
    'index',
    'classNames',
    'styles',
  ] as any,
  setup(props) {
    const { prefixCls } = useInjectTableContext()
    return () => {
      const {
        cells,
        stickyOffsets,
        flattenColumns,
        rowComponent: RowComponent,
        cellComponent: CellComponent,
        onHeaderRow,
        index,
        classNames,
        styles,
      } = props

      let rowProps: Record<string, any> | undefined
      if (onHeaderRow) {
        rowProps = onHeaderRow(
          cells.map(cell => cell.column),
          index,
        )
      }

      const columnsKey = getColumnsKey(cells.map(cell => cell.column))

      const mergedRowClass = clsx(classNames?.row, rowProps?.className, rowProps?.class)
      const mergedRowStyle = {
        ...(styles?.row || {}),
        ...(rowProps?.style || {}),
      }

      return (
        <RowComponent {...rowProps} class={mergedRowClass} style={mergedRowStyle}>
          {cells.map((cell: any, cellIndex: number) => {
            const { column, colStart, colEnd, colSpan } = cell
            const fixedInfo = getCellFixedInfo(colStart, colEnd, flattenColumns, stickyOffsets)
            const additionalProps = column?.onHeaderCell?.(column) || {}
            return (
              <Cell
                {...cell}
                scope={column.title ? (colSpan > 1 ? 'colgroup' : 'col') : null}
                ellipsis={column.ellipsis}
                align={column.align}
                component={CellComponent}
                prefixCls={prefixCls}
                key={columnsKey[cellIndex]}
                {...fixedInfo}
                additionalProps={additionalProps}
                rowType="header"
              >
                {cell.children}
              </Cell>
            )
          })}
        </RowComponent>
      )
    }
  },
})

export default HeaderRow
