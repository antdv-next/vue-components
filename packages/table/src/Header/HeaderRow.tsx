import { defineComponent } from 'vue'
import Cell from '../Cell'
import { useInjectTable } from '../context/TableContext'
import type {
  CellType,
  StickyOffsets,
  ColumnType,
  CustomizeComponent,
  GetComponentProps,
  DefaultRecordType,
} from '../interface'
import { getCellFixedInfo } from '../utils/fixUtil'
import { getColumnsKey } from '../utils/valueUtil'
import DragHandleVue from './DragHandle'
import { classNames } from '@v-c/util'

export interface RowProps<RecordType = DefaultRecordType> {
  cells: readonly CellType<RecordType>[]
  stickyOffsets: StickyOffsets
  flattenColumns: readonly ColumnType<RecordType>[]
  rowComponent: CustomizeComponent
  cellComponent: CustomizeComponent
  onHeaderRow: GetComponentProps<readonly ColumnType<RecordType>[]>
  classNames: Record<string, string>
  styles: Record<string, any>
  index: number
}

export default defineComponent<RowProps>({
  name: 'HeaderRow',
  props: [
    'cells',
    'stickyOffsets',
    'flattenColumns',
    'rowComponent',
    'cellComponent',
    'index',
    'onHeaderRow',
    'classNames',
    'styles',
  ] as any,
  setup(props: RowProps) {
    const tableContext = useInjectTable()
    return () => {
      const { prefixCls, direction } = tableContext
      const {
        cells,
        stickyOffsets,
        flattenColumns,
        rowComponent: RowComponent,
        cellComponent: CellComponent,
        onHeaderRow,
        index,
        classNames: headerClassNames,
        styles: headerStyles,
      } = props

      const cellColumns = cells
        .map(cell => cell.column)
        .filter(Boolean) as ColumnType<DefaultRecordType>[]

      let rowProps
      if (onHeaderRow) {
        rowProps = onHeaderRow(cellColumns, index)
      }

      const columnsKey = getColumnsKey(cellColumns)

      return (
        <RowComponent
          {...rowProps}
          class={classNames(rowProps?.class, rowProps?.className, headerClassNames.row)}
          style={[headerStyles.row, rowProps?.style]}
        >
          {cells.map((cell: CellType, cellIndex) => {
            const column = cell.column as ColumnType<any> | undefined
            if (!column) {
              return null
            }
            const { children: _children, ...restCell } = cell as any
            const fixedInfo = getCellFixedInfo(
              cell.colStart ?? 0,
              cell.colEnd ?? 0,
              flattenColumns,
              stickyOffsets,
              direction,
            )

            let additionalProps
            if (column.customHeaderCell) {
              additionalProps = column.customHeaderCell(column)
            } else if (column.onHeaderCell) {
              additionalProps = column.onHeaderCell(column)
            }

            const col: ColumnType<any> = column
            const mergedAdditionalProps = {
              ...additionalProps,
              class: classNames(
                additionalProps?.class,
                additionalProps?.className,
                headerClassNames.cell,
              ),
              style: [headerStyles.cell, additionalProps?.style],
            }

            return (
              <Cell
                {...restCell}
                cellType="header"
                ellipsis={column.ellipsis}
                align={column.align}
                component={CellComponent}
                prefixCls={prefixCls}
                key={columnsKey[cellIndex]}
                {...fixedInfo}
                additionalProps={mergedAdditionalProps}
                rowType="header"
                column={column}
                v-slots={{
                  default: () => column.title,
                  dragHandle: () =>
                    col.resizable ? (
                      <DragHandleVue
                        prefixCls={prefixCls}
                        width={col.width as number}
                        minWidth={col.minWidth}
                        maxWidth={col.maxWidth}
                        column={col}
                      />
                    ) : null,
                }}
              />
            )
          })}
        </RowComponent>
      )
    }
  },
})
