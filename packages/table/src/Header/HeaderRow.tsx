import type {
  CellType,
  ColumnType,
  CustomizeComponent,
  GetComponentProps,
  StickyOffsets,
} from '../interface'
import type { TableProps } from '../Table'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import Cell from '../Cell'
import { useInjectTableContext } from '../context/TableContext'
import { getCellFixedInfo } from '../utils/fixUtil'
import { getColumnsKey } from '../utils/valueUtil'

export interface RowProps<RecordType> {
  cells: readonly CellType<RecordType>[]
  stickyOffsets: StickyOffsets
  flattenColumns: readonly ColumnType<RecordType>[]
  rowComponent: CustomizeComponent
  cellComponent: CustomizeComponent
  onHeaderRow?: GetComponentProps<readonly ColumnType<RecordType>[]>
  index: number
  classNames: NonNullable<TableProps['classNames']>['header']
  styles: NonNullable<TableProps['styles']>['header']
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
    const context = useInjectTableContext()
    const { prefixCls } = context

    const stopPropagation = (event: Event) => event.stopPropagation()

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
      const rowColumns = cells.map(cell => cell.column).filter(Boolean) as ColumnType<any>[]
      if (onHeaderRow) {
        rowProps = onHeaderRow(rowColumns, index)
      }

      const columnsKey = getColumnsKey(rowColumns)
      // Resize widths are stored by the flattened key (shared with sticky offsets),
      // which differs from the per-row `columnsKey` above once groups are involved.
      const { startColumnResize } = context
      const flattenColumnsKey = startColumnResize ? getColumnsKey(flattenColumns) : undefined

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

            // Only a leaf cell spanning exactly one column maps to a single `col`;
            // group headers and merged headers (`colSpan` from the column or
            // `onHeaderCell`) resize through their leaves instead.
            const resizable = !!startColumnResize
              && !!column?.resizable
              && !cell.hasSubColumns
              && (additionalProps.colSpan ?? colSpan ?? 1) === 1
            const resizeHandle = resizable
              ? (
                  <span
                    class={`${prefixCls}-resize-handle`}
                    onMousedown={(event: MouseEvent) => {
                      const headerCell = (event.currentTarget as HTMLElement).parentElement
                      if (headerCell) {
                        startColumnResize(event, column, flattenColumnsKey![colStart]!, headerCell)
                      }
                    }}
                    onClick={stopPropagation}
                  />
                )
              : undefined
            return (
              <Cell
                {...cell}
                colIndex={colStart ?? cellIndex}
                scope={column.title ? (colSpan > 1 ? 'colgroup' : 'col') : null}
                ellipsis={column.ellipsis}
                align={column.align}
                component={CellComponent}
                prefixCls={prefixCls}
                key={columnsKey[cellIndex]}
                {...fixedInfo}
                additionalProps={additionalProps}
                appendNode={resizeHandle}
                rowType="header"
              >
                { cell.children }
              </Cell>
            )
          })}
        </RowComponent>
      )
    }
  },
})

export default HeaderRow
