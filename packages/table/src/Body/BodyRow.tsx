import type { CSSProperties } from 'vue'
import type { ColumnType, CustomizeComponent } from '../interface'
import type { TableProps } from '../Table'
import { clsx } from '@v-c/util'
import { computed, defineComponent, ref, watchEffect } from 'vue'
import Cell from '../Cell'
import useRowInfo from '../hooks/useRowInfo'
import { computedExpandedClassName } from '../utils/expandUtil'
import ExpandedRow from './ExpandedRow'

export interface BodyRowProps<RecordType> {
  record: RecordType
  index: number
  renderIndex: number
  className?: string
  style?: CSSProperties
  classNames: NonNullable<TableProps['classNames']>['body']
  styles: NonNullable<TableProps['styles']>['body']
  rowComponent: CustomizeComponent
  cellComponent: CustomizeComponent
  scopeCellComponent: CustomizeComponent
  indent?: number
  rowKey: string | number
  rowKeys: (string | number)[]
  expandedRowInfo?: {
    offset: number
    colSpan: number
    sticky: number
  }
}

export function getCellProps<RecordType>(
  rowInfo: ReturnType<typeof useRowInfo<RecordType>>,
  record: RecordType,
  column: ColumnType<RecordType>,
  colIndex: number,
  indent: number,
  index: number,
  rowKeys: (string | number)[] = [],
  expandedRowOffset = 0,
) {
  const { columnsKey, nestExpandable, expanded, hasNestChildren, expandable } = rowInfo
  const tableContext = rowInfo.tableContext
  const {
    prefixCls,
    fixedInfoList,
    expandIconColumnIndex,
    indentSize,
    expandIcon,
    onTriggerExpand,
    expandedKeys,
  } = tableContext

  const key = columnsKey.value[colIndex]
  const fixedInfo = fixedInfoList[colIndex]

  let appendCellNode: any
  if (colIndex === (expandIconColumnIndex || 0) && nestExpandable.value) {
    appendCellNode = (
      <>
        <span
          style={{ paddingLeft: `${indentSize * indent}px` }}
          class={`${prefixCls}-row-indent indent-level-${indent}`}
        />
        {expandIcon({
          prefixCls,
          expanded: expanded.value,
          expandable: hasNestChildren.value,
          record,
          onExpand: onTriggerExpand,
        })}
      </>
    )
  }

  const additionalCellProps = column.onCell?.(record, index) || {}

  if (expandedRowOffset) {
    const { rowSpan = 1 } = additionalCellProps
    if (expandable.value && rowSpan && colIndex < expandedRowOffset) {
      let currentRowSpan = rowSpan
      for (let i = index; i < index + rowSpan; i += 1) {
        const keyInRow = rowKeys[i]
        if (expandedKeys.has(keyInRow)) {
          currentRowSpan += 1
        }
      }
      additionalCellProps.rowSpan = currentRowSpan
    }
  }

  return {
    key,
    fixedInfo,
    appendCellNode,
    additionalCellProps,
  }
}

const BodyRow = defineComponent<BodyRowProps<any>>({
  name: 'TableBodyRow',
  props: [
    'record',
    'index',
    'renderIndex',
    'className',
    'style',
    'classNames',
    'styles',
    'rowComponent',
    'cellComponent',
    'scopeCellComponent',
    'indent',
    'rowKey',
    'rowKeys',
    'expandedRowInfo',
  ] as any,
  setup(props) {
    const expandedRef = ref(false)

    const rowInfo = useRowInfo(
      computed(() => props.record),
      computed(() => props.rowKey),
      computed(() => props.index),
      computed(() => props.indent || 0),
    )

    watchEffect(() => {
      if (rowInfo.expanded.value) {
        expandedRef.value = true
      }
    })

    return () => {
      const {
        className,
        style,
        classNames,
        styles,
        record,
        index,
        renderIndex,
        rowKey,
        rowKeys,
        indent = 0,
        rowComponent: RowComponent,
        cellComponent: BodyCellComponent,
        scopeCellComponent,
        expandedRowInfo,
      } = props

      const { tableContext, rowProps, expanded, rowSupportExpand } = rowInfo
      const prefixCls = tableContext.prefixCls
      const flattenColumns = tableContext.flattenColumns
      const expandedRowClassName = tableContext.expandedRowClassName
      const expandedRowRender = tableContext.expandedRowRender

      const expandedClsName = computedExpandedClassName(
        expandedRowClassName,
        record,
        index,
        indent,
      )

      const rowPropsStyle = rowProps.value?.style
      const mergedRowStyle = {
        ...(style || {}),
        ...(typeof rowPropsStyle === 'object' ? rowPropsStyle : {}),
        ...(styles?.row || {}),
      }

      const baseRowNode = (
        <RowComponent
          {...rowProps.value}
          data-row-key={rowKey}
          key={`row-${rowKey}`}
          class={clsx(
            className,
            `${prefixCls}-row`,
            `${prefixCls}-row-level-${indent}`,
            rowProps.value?.className,
            rowProps.value?.class,
            classNames?.row,
            { [expandedClsName]: indent >= 1 },
          )}
          style={mergedRowStyle}
        >
          {flattenColumns.map((column: ColumnType<any>, colIndex) => {
            const { render, dataIndex, className: columnClassName } = column

            const { key, fixedInfo, appendCellNode, additionalCellProps } = getCellProps(
              rowInfo,
              record,
              column,
              colIndex,
              indent,
              index,
              rowKeys,
              expandedRowInfo?.offset,
            )

            const scope = column.rowScope ? column.rowScope : column.title ? 'row' : undefined
            const CellComponent = column.rowScope ? scopeCellComponent : BodyCellComponent
            return (
              <Cell
                className={clsx(columnClassName, classNames?.cell)}
                style={styles?.cell}
                ellipsis={column.ellipsis}
                align={column.align}
                component={CellComponent}
                prefixCls={prefixCls}
                key={key}
                record={record}
                index={index}
                renderIndex={renderIndex}
                dataIndex={dataIndex}
                render={render}
                scope={scope}
                rowType="body"
                {...fixedInfo}
                additionalProps={additionalCellProps}
                column={column}
                appendNode={appendCellNode}
              />
            )
          })}
        </RowComponent>
      )

      let expandRowNode: any
      if (rowSupportExpand.value && (expandedRef.value || expanded.value)) {
        const expandContent = expandedRowRender(
          record,
          index,
          indent + 1,
          expanded.value,
        )
        const computedExpandedRowClassName = computedExpandedClassName(
          expandedRowClassName,
          record,
          index,
          indent,
        )
        expandRowNode = (
          <ExpandedRow
            expanded={expanded.value}
            className={clsx(
              `${prefixCls}-expanded-row`,
              `${prefixCls}-expanded-row-level-${indent + 1}`,
              computedExpandedRowClassName,
            )}
            key={`expanded-row-${rowKey}`}
            prefixCls={prefixCls}
            component={RowComponent}
            cellComponent={BodyCellComponent}
            colSpan={expandedRowInfo?.colSpan ?? flattenColumns.length}
            stickyOffset={expandedRowInfo?.sticky}
            isEmpty={false}
          >
            {expandContent}
          </ExpandedRow>
        )
      }

      if (expandRowNode) {
        return (
          <>
            {baseRowNode}
            {expandRowNode}
          </>
        )
      }

      return <>{baseRowNode}</>
    }
  },
})

export default BodyRow
