import type { CSSProperties } from 'vue'
import { computed, defineComponent } from 'vue'
import { classNames } from '@v-c/util'
import type { ColumnType, CustomizeComponent, Key, RenderExpandIcon, TriggerEventHandler } from '../interface'
import Cell from '../Cell'
import { useInjectGrid } from './context'
import { useInjectTable } from '../context/TableContext'

export interface VirtualRowInfo<RecordType> {
  record: RecordType
  prefixCls: string
  columnsKey: Key[]
  fixedInfoList: readonly any[]
  expandIconColumnIndex?: number
  nestExpandable: boolean
  indentSize: number
  expandIcon: RenderExpandIcon<RecordType>
  expanded: boolean
  hasNestChildren: boolean
  onTriggerExpand: TriggerEventHandler<RecordType>
}

export interface VirtualCellProps<RecordType> {
  rowInfo: VirtualRowInfo<RecordType>
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
  const totalOffset = columnsOffset[colIndex + mergedColSpan]
  const startOffset = columnsOffset[colIndex] || 0
  if (typeof totalOffset !== 'number') {
    return 0
  }
  return totalOffset - startOffset
}

function normalizeSpan(span: any, fallback = 1) {
  if (span === null || span === undefined) {
    return fallback
  }
  const num = Number(span)
  return Number.isFinite(num) ? num : fallback
}

export default defineComponent<VirtualCellProps<any>>({
  name: 'VirtualCell',
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
    const { columnsOffset } = useInjectGrid()
    const tableContext = useInjectTable()
    const { body: bodyCls = {} } = tableContext.classNames || {}
    const { body: bodyStyles = {} } = tableContext.styles || {}

    const needHide = computed(() => {
      const additionalCellProps = props.column.customCell
        ? props.column.customCell(props.record, props.index, props.column)
        : props.column.onCell?.(props.record, props.index, props.column)
      const colSpan = normalizeSpan(additionalCellProps?.colSpan ?? additionalCellProps?.colspan)
      const rowSpan = normalizeSpan(additionalCellProps?.rowSpan ?? additionalCellProps?.rowspan)

      if (props.inverse) {
        return rowSpan <= 1
      }
      return colSpan === 0 || rowSpan === 0 || rowSpan > 1
    })

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

      const { customRender, render, dataIndex, className: columnClassName, class: columnClass } =
        column
      const mergedCustomRender = customRender || render

      const { columnsKey, fixedInfoList, expandIconColumnIndex, nestExpandable, indentSize, expandIcon, expanded, hasNestChildren, onTriggerExpand, prefixCls } =
        rowInfo

      const key = columnsKey[colIndex]
      const fixedInfo = fixedInfoList[colIndex]

      let appendCellNode
      if (colIndex === (expandIconColumnIndex || 0) && nestExpandable) {
        appendCellNode = (
          <>
            <span
              style={{ paddingLeft: `${indentSize * indent}px` }}
              class={`${prefixCls}-row-indent indent-level-${indent}`}
            />
            {expandIcon({
              prefixCls,
              expanded,
              expandable: hasNestChildren,
              record,
              onExpand: onTriggerExpand,
            })}
          </>
        )
      }

      const additionalCellProps = column.customCell
        ? column.customCell(record, index, column)
        : column.onCell?.(record, index, column)

      const cellStyle = additionalCellProps?.style as CSSProperties
      const colSpan = normalizeSpan(additionalCellProps?.colSpan ?? additionalCellProps?.colspan)
      const rowSpan = normalizeSpan(additionalCellProps?.rowSpan ?? additionalCellProps?.rowspan)

      const startColIndex = colIndex - 1
      const concatColWidth = getColumnWidth(startColIndex, colSpan, columnsOffset)
      const marginOffset = colSpan > 1 ? (column.width as number) - concatColWidth : 0

      const mergedStyle: CSSProperties = {
        ...cellStyle,
        ...style,
        flex: `0 0 ${concatColWidth}px`,
        width: `${concatColWidth}px`,
        marginRight: marginOffset,
        pointerEvents: 'auto',
      }

      if (needHide.value) {
        mergedStyle.visibility = 'hidden'
      } else if (inverse) {
        mergedStyle.height = getHeight?.(rowSpan)
      }

      const mergedRender = needHide.value ? () => null : mergedCustomRender

      const cellSpan: Record<string, number> = {}
      if (rowSpan === 0 || colSpan === 0) {
        cellSpan.rowSpan = 1
        cellSpan.colSpan = 1
      }

      const mergedAdditionalProps = {
        ...additionalCellProps,
        ...(column.rowScope ? { scope: column.rowScope } : null),
        class: classNames(
          additionalCellProps?.class,
          additionalCellProps?.className,
          columnClassName,
          columnClass,
          className,
          bodyCls.cell,
        ),
        style: [bodyStyles.cell, mergedStyle],
        ...cellSpan,
      }

      return (
        <Cell
          ellipsis={column.ellipsis}
          align={column.align}
          component={component}
          prefixCls={prefixCls}
          key={key}
          record={record}
          index={index}
          renderIndex={renderIndex}
          dataIndex={dataIndex}
          customRender={mergedRender}
          {...fixedInfo}
          appendNode={appendCellNode}
          additionalProps={mergedAdditionalProps}
          column={column}
          transformCellText={tableContext.transformCellText}
          rowType="body"
          cellType="body"
        />
      )
    }
  },
})
