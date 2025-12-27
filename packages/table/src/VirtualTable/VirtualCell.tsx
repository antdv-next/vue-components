import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'
import { clsx } from '@v-c/util'
import { getCellProps } from '../Body/BodyRow'
import Cell from '../Cell'
import type useRowInfo from '../hooks/useRowInfo'
import type { ColumnType, CustomizeComponent } from '../interface'
import { useInjectGridContext } from './context'

export interface VirtualCellProps<RecordType> {
  rowInfo: ReturnType<typeof useRowInfo<RecordType>>
  column: ColumnType<RecordType>
  colIndex: number
  indent: number
  index: number
  component?: CustomizeComponent
  renderIndex: number
  record: RecordType

  style?: CSSProperties
  className?: string

  inverse?: boolean
  getHeight?: (rowSpan: number) => number
}

export function getColumnWidth(colIndex: number, colSpan: number, columnsOffset: number[]) {
  const mergedColSpan = colSpan || 1
  return columnsOffset[colIndex + mergedColSpan] - (columnsOffset[colIndex] || 0)
}

const VirtualCell = defineComponent<VirtualCellProps<any>>({
  name: 'TableVirtualCell',
  props: [
    'rowInfo',
    'column',
    'colIndex',
    'indent',
    'index',
    'component',
    'renderIndex',
    'record',
    'style',
    'className',
    'inverse',
    'getHeight',
  ] as any,
  setup(props) {
    const gridContext = useInjectGridContext()

    return () => {
      const {
        rowInfo,
        column,
        colIndex,
        indent,
        index,
        component,
        renderIndex,
        record,
        style,
        className,
        inverse,
        getHeight,
      } = props

      const { render, dataIndex, className: columnClassName, width: colWidth } = column
      const columnsOffset = gridContext.columnsOffset || []

      const { key, fixedInfo, appendCellNode, additionalCellProps } = getCellProps(
        rowInfo,
        record,
        column,
        colIndex,
        indent,
        index,
      )

      const { style: cellStyle, colSpan = 1, rowSpan = 1 } = additionalCellProps

      const startColIndex = colIndex - 1
      const concatColWidth = getColumnWidth(startColIndex, colSpan, columnsOffset)

      const marginOffset = colSpan > 1 ? (colWidth as number) - concatColWidth : 0

      const mergedStyle: CSSProperties = {
        ...cellStyle,
        ...style,
        flex: `0 0 ${concatColWidth}px`,
        width: `${concatColWidth}px`,
        marginRight: typeof marginOffset === 'number' ? `${marginOffset}px` : marginOffset,
        pointerEvents: 'auto',
      }

      const needHide = inverse
        ? rowSpan <= 1
        : colSpan === 0 || rowSpan === 0 || rowSpan > 1

      if (needHide) {
        mergedStyle.visibility = 'hidden'
      } else if (inverse) {
        mergedStyle.height = getHeight?.(rowSpan)
      }
      const mergedRender = needHide ? () => null : render

      const cellSpan: Record<string, any> = {}
      if (rowSpan === 0 || colSpan === 0) {
        cellSpan.rowSpan = 1
        cellSpan.colSpan = 1
      }

      return (
        <Cell
          className={clsx(columnClassName, className)}
          ellipsis={column.ellipsis}
          align={column.align}
          scope={column.rowScope}
          component={component}
          prefixCls={rowInfo.tableContext.prefixCls}
          key={key}
          record={record}
          index={index}
          renderIndex={renderIndex}
          dataIndex={dataIndex}
          render={mergedRender}
          shouldCellUpdate={column.shouldCellUpdate}
          {...fixedInfo}
          appendNode={appendCellNode}
          additionalProps={{
            ...additionalCellProps,
            style: mergedStyle,
            ...cellSpan,
          }}
        />
      )
    }
  },
})

export default VirtualCell
