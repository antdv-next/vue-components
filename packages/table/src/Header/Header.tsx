import type {
  CellType,
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  DefaultRecordType,
  GetComponentProps,
  StickyOffsets,
} from '../interface'
import { classNames } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useInjectTable } from '../context/TableContext'
import HeaderRow from './HeaderRow'

function parseHeaderRows<RecordType>(
  rootColumns: ColumnsType<RecordType>,
  headerClassNames: Record<string, string>,
  headerStyles: Record<string, any>,
): CellType<RecordType>[][] {
  const rows: CellType<RecordType>[][] = []

  function fillRowCells(
    columns: ColumnsType<RecordType>,
    colIndex: number,
    rowIndex: number = 0,
  ): number[] {
    rows[rowIndex] = rows[rowIndex] || []

    let currentColIndex = colIndex
    const colSpans: number[] = columns.filter(Boolean).map(column => {
      const cell: CellType<RecordType> = {
        key: column.key,
        className: classNames(column.className, column.class, headerClassNames.cell) || '',
        style: headerStyles.cell,
        children: column.title,
        column,
        colStart: currentColIndex,
      }

      let colSpan = 1

      const subColumns = (column as ColumnGroupType<RecordType>).children
      if (subColumns && subColumns.length > 0) {
        colSpan = fillRowCells(subColumns, currentColIndex, rowIndex + 1).reduce(
          (total, count) => total + count,
          0,
        )
        cell.hasSubColumns = true
      }

      if ('colSpan' in column && column.colSpan !== undefined) {
        colSpan = column.colSpan ?? colSpan
      }

      if ('rowSpan' in column) {
        cell.rowSpan = column.rowSpan
      }

      cell.colSpan = colSpan
      const colStart = cell.colStart ?? currentColIndex
      cell.colStart = colStart
      cell.colEnd = colStart + colSpan - 1
      rows[rowIndex].push(cell)

      currentColIndex += colSpan

      return colSpan
    })

    return colSpans
  }

  fillRowCells(rootColumns, 0)

  const rowCount = rows.length
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach(cell => {
      if (!('rowSpan' in cell) && !cell.hasSubColumns) {
        cell.rowSpan = rowCount - rowIndex
      }
    })
  }

  return rows
}

export interface HeaderProps<RecordType = DefaultRecordType> {
  columns: ColumnsType<RecordType>
  flattenColumns: readonly ColumnType<RecordType>[]
  stickyOffsets: StickyOffsets
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>
}

export default defineComponent<HeaderProps>({
  name: 'TableHeader',
  inheritAttrs: false,
  props: ['columns', 'flattenColumns', 'stickyOffsets', 'onHeaderRow'] as any,
  setup(props) {
    const tableContext = useInjectTable()
    const rows = computed(() => {
      const { header: headerCls = {} } = tableContext.classNames || {}
      const { header: headerStyles = {} } = tableContext.styles || {}
      return parseHeaderRows(props.columns, headerCls, headerStyles)
    })

    return () => {
      const { prefixCls, getComponent, classNames: tableClassNames, styles: tableStyles } =
        tableContext
      const { stickyOffsets, flattenColumns, onHeaderRow } = props
      const WrapperComponent = getComponent(['header', 'wrapper'], 'thead')
      const trComponent = getComponent(['header', 'row'], 'tr')
      const thComponent = getComponent(['header', 'cell'], 'th')
      const { header: headerCls = {} } = tableClassNames || {}
      const { header: headerStyles = {} } = tableStyles || {}

      return (
        <WrapperComponent
          class={classNames(`${prefixCls}-thead`, headerCls.wrapper)}
          style={headerStyles.wrapper}
        >
          {rows.value.map((row, rowIndex) => (
            <HeaderRow
              classNames={headerCls}
              styles={headerStyles}
              key={rowIndex}
              flattenColumns={flattenColumns}
              cells={row}
              stickyOffsets={stickyOffsets}
              rowComponent={trComponent}
              cellComponent={thComponent}
              onHeaderRow={onHeaderRow}
              index={rowIndex}
            />
          ))}
        </WrapperComponent>
      )
    }
  },
})
