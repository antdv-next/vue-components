import type {
  CellType,
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  GetComponentProps,
  StickyOffsets,
} from '../interface'
import type { TableProps } from '../Table'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useInjectTableContext } from '../context/TableContext'
import HeaderRow from './HeaderRow'

function parseHeaderRows<RecordType>(
  rootColumns: ColumnsType<RecordType>,
  classNames: TableProps['classNames']['header'],
  styles: TableProps['styles']['header'],
): CellType<RecordType>[][] {
  const rows: CellType<RecordType>[][] = []

  function fillRowCells(
    columns: ColumnsType<RecordType>,
    colIndex: number,
    rowIndex: number = 0,
  ): number[] {
    rows[rowIndex] = rows[rowIndex] || []

    let currentColIndex = colIndex
    const colSpans: number[] = columns.filter(Boolean).map((column) => {
      const cell: any = {
        key: column.key,
        className: clsx(column.className, classNames?.cell) || '',
        style: styles?.cell,
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

      if ('colSpan' in column) {
        colSpan = (column as any).colSpan
      }

      if ('rowSpan' in column) {
        cell.rowSpan = (column as any).rowSpan
      }

      cell.colSpan = colSpan
      cell.colEnd = cell.colStart + colSpan - 1
      rows[rowIndex].push(cell)

      currentColIndex += colSpan
      return colSpan
    })

    return colSpans
  }

  fillRowCells(rootColumns, 0)

  const rowCount = rows.length
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows[rowIndex].forEach((cell: any) => {
      if (!('rowSpan' in cell) && !cell.hasSubColumns) {
        cell.rowSpan = rowCount - rowIndex
      }
    })
  }

  return rows
}

export interface HeaderProps<RecordType> {
  columns: ColumnsType<RecordType>
  flattenColumns: readonly ColumnType<RecordType>[]
  stickyOffsets: StickyOffsets
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>
}

const Header = defineComponent<HeaderProps<any>>({
  name: 'TableHeader',
  props: ['columns', 'flattenColumns', 'stickyOffsets', 'onHeaderRow'] as any,
  setup(props) {
    const context = useInjectTableContext()
    const headerCls = computed(() => context.classNames?.header || {})
    const headerStyles = computed(() => context.styles?.header || {})

    const rows = computed(() => {
      return parseHeaderRows(props.columns, headerCls.value, headerStyles.value)
    })

    return () => {
      const WrapperComponent = context.getComponent(['header', 'wrapper'], 'thead')
      const trComponent = context.getComponent(['header', 'row'], 'tr')
      const thComponent = context.getComponent(['header', 'cell'], 'th')

      return (
        <WrapperComponent
          class={clsx(`${context.prefixCls}-thead`, headerCls.value.wrapper)}
          style={headerStyles.value.wrapper}
        >
          {rows.value.map((row, rowIndex) => (
            <HeaderRow
              classNames={headerCls.value}
              styles={headerStyles.value}
              key={rowIndex}
              flattenColumns={props.flattenColumns}
              cells={row}
              stickyOffsets={props.stickyOffsets}
              rowComponent={trComponent}
              cellComponent={thComponent}
              onHeaderRow={props.onHeaderRow}
              index={rowIndex}
            />
          ))}
        </WrapperComponent>
      )
    }
  },
}, {
  inheritAttrs: false,
  name: 'TableHeader',
})

export default Header
