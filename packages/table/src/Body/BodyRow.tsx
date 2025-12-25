import { classNames } from '@v-c/util'
import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import { computed, defineComponent, shallowRef, watchEffect } from 'vue'
import Cell from '../Cell'
import { useInjectBody } from '../context/BodyContext'
import { useInjectTable } from '../context/TableContext'
import type { CustomizeComponent, DefaultRecordType, GetComponentProps, Key, GetRowKey } from '../interface'
import { getColumnsKey } from '../utils/valueUtil'
import { computedExpandedClassName } from '../utils/expandUtil'
import ExpandedRow from './ExpandedRow'

export interface BodyRowProps<RecordType> {
  record: RecordType
  index: number
  renderIndex: number
  recordKey: Key
  expandedKeys: Set<Key>
  rowComponent: CustomizeComponent
  cellComponent: CustomizeComponent
  scopeCellComponent: CustomizeComponent
  onRow: GetComponentProps<RecordType>
  rowExpandable?: (record: RecordType) => boolean
  indent?: number
  rowKey: Key
  getRowKey: GetRowKey<RecordType>
  childrenColumnName: string
  rowKeys: Key[]
  expandedRowInfo?: {
    offset: number
    colSpan: number
    sticky: number
  }
}

export default defineComponent<BodyRowProps<DefaultRecordType>>({
  name: 'BodyRow',
  inheritAttrs: false,
  props: [
    'record',
    'index',
    'renderIndex',
    'recordKey',
    'expandedKeys',
    'rowComponent',
    'cellComponent',
    'scopeCellComponent',
    'onRow',
    'rowExpandable',
    'indent',
    'rowKey',
    'getRowKey',
    'childrenColumnName',
    'rowKeys',
    'expandedRowInfo',
  ] as any,
  setup(props, { attrs }) {
    const tableContext = useInjectTable()
    const bodyContext = useInjectBody()
    const expandRended = shallowRef(false)

    const expanded = computed(() => props.expandedKeys && props.expandedKeys.has(props.recordKey))

    watchEffect(() => {
      if (expanded.value) {
        expandRended.value = true
      }
    })

    const rowSupportExpand = computed(
      () =>
        bodyContext.expandableType === 'row' &&
        (!props.rowExpandable || props.rowExpandable(props.record)),
    )
    const nestExpandable = computed(() => bodyContext.expandableType === 'nest')
    const hasNestChildren = computed(
      () => props.childrenColumnName && props.record && props.record[props.childrenColumnName],
    )
    const mergedExpandable = computed(() => rowSupportExpand.value || nestExpandable.value)

    const onInternalTriggerExpand = (record: DefaultRecordType, event: Event) => {
      bodyContext.onTriggerExpand(record, event as any)
    }

    const additionalProps = computed<Record<string, any>>(
      () => props.onRow?.(props.record, props.index) || {},
    )

    const onClick: MouseEventHandler = (event, ...args) => {
      if (bodyContext.expandRowByClick && mergedExpandable.value) {
        onInternalTriggerExpand(props.record, event)
      }

      additionalProps.value?.onClick?.(event, ...args)
    }

    const computeRowClassName = computed(() => {
      const { record, index } = props
      const indent = props.indent ?? 0
      const { rowClassName } = bodyContext
      if (typeof rowClassName === 'string') {
        return rowClassName
      } else if (typeof rowClassName === 'function') {
        return rowClassName(record as DefaultRecordType, index, indent)
      }
      return ''
    })

    const columnsKey = computed(() => getColumnsKey(bodyContext.flattenColumns))

    return () => {
      const { class: className, style } = attrs as any
      const {
        record,
        index,
        rowKey,
        indent = 0,
        rowComponent: RowComponent,
        cellComponent,
        scopeCellComponent,
        rowKeys,
        expandedRowInfo,
      } = props
      const { prefixCls, fixedInfoList, transformCellText, classNames: tableClassNames, styles } =
        tableContext
      const { body: bodyCls = {} } = tableClassNames || {}
      const { body: bodyStyles = {} } = styles || {}
      const {
        flattenColumns,
        expandedRowClassName,
        indentSize,
        expandIcon,
        expandedRowRender,
        expandIconColumnIndex,
      } = bodyContext
      const expandedRowOffset = expandedRowInfo?.offset || 0
      const expandedClsName = computedExpandedClassName(
        expandedRowClassName,
        record,
        index,
        indent,
      )

      const baseRowNode = (
        <RowComponent
          {...additionalProps.value}
          data-row-key={rowKey}
          class={classNames(
            className,
            `${prefixCls}-row`,
            `${prefixCls}-row-level-${indent}`,
            computeRowClassName.value,
            indent >= 1 ? expandedClsName : null,
            additionalProps.value.class,
            additionalProps.value.className,
            bodyCls.row,
          )}
          style={[style, bodyStyles.row, additionalProps.value.style]}
          onClick={onClick}
        >
          {flattenColumns.map((column, colIndex) => {
            const {
              customRender,
              render,
              dataIndex,
              className: columnClassName,
              class: columnClass,
            } = column
            const mergedCustomRender = customRender || render

            const key = columnsKey.value[colIndex]
            const fixedInfo = fixedInfoList[colIndex]

            let additionalCellProps = column.customCell
              ? column.customCell(record, index, column)
              : column.onCell?.(record, index, column)

            if (expandedRowOffset && additionalCellProps?.rowSpan && mergedExpandable.value) {
              if (colIndex < expandedRowOffset) {
                let currentRowSpan = additionalCellProps.rowSpan
                for (let i = index; i < index + currentRowSpan; i += 1) {
                  const rowKey = rowKeys[i]
                  if (props.expandedKeys.has(rowKey)) {
                    currentRowSpan += 1
                  }
                }
                additionalCellProps = { ...additionalCellProps, rowSpan: currentRowSpan }
              }
            }

            const mergedAdditionalCellProps = {
              ...additionalCellProps,
              ...(column.rowScope ? { scope: column.rowScope } : null),
              class: classNames(
                additionalCellProps?.class,
                additionalCellProps?.className,
                columnClassName,
                columnClass,
                bodyCls.cell,
              ),
              style: [bodyStyles.cell, additionalCellProps?.style],
            }

            const appendNode =
              colIndex === (expandIconColumnIndex || 0) && nestExpandable.value ? (
                <>
                  <span
                    style={{ paddingLeft: `${indentSize * indent}px` }}
                    class={`${prefixCls}-row-indent indent-level-${indent}`}
                  />
                  {expandIcon({
                    prefixCls,
                    expanded: expanded.value,
                    expandable: hasNestChildren.value,
                    record: record as DefaultRecordType,
                    onExpand: onInternalTriggerExpand,
                  })}
                </>
              ) : null
            return (
              <Cell
                cellType="body"
                ellipsis={column.ellipsis}
                align={column.align}
                component={column.rowScope ? scopeCellComponent : cellComponent}
                prefixCls={prefixCls}
                key={key}
                record={record}
                index={index}
                renderIndex={props.renderIndex}
                dataIndex={dataIndex}
                customRender={mergedCustomRender}
                {...fixedInfo}
                additionalProps={mergedAdditionalCellProps}
                column={column}
                transformCellText={transformCellText}
                appendNode={appendNode}
                rowType="body"
              />
            )
          })}
        </RowComponent>
      )

      let expandRowNode
      if (rowSupportExpand.value && (expandRended.value || expanded.value)) {
        let expandContent
          if (expandedRowRender) {
            if ((expandedRowRender as any).length >= 2) {
              expandContent = (expandedRowRender as any)(
                record as DefaultRecordType,
                index,
                indent + 1,
                expanded.value,
              )
            } else {
              expandContent = (expandedRowRender as any)({
                record: record as DefaultRecordType,
                index,
                indent: indent + 1,
                expanded: expanded.value,
              })
            }
          }
        expandRowNode = (
          <ExpandedRow
            expanded={expanded.value}
            class={classNames(
              `${prefixCls}-expanded-row`,
              `${prefixCls}-expanded-row-level-${indent + 1}`,
              expandedClsName,
            )}
            prefixCls={prefixCls}
            component={RowComponent}
            cellComponent={cellComponent}
            colSpan={expandedRowInfo ? expandedRowInfo.colSpan : flattenColumns.length}
            isEmpty={false}
            stickyOffset={expandedRowInfo?.sticky}
          >
            {expandContent}
          </ExpandedRow>
        )
      }

      return (
        <>
          {baseRowNode}
          {expandRowNode}
        </>
      )
    }
  },
})
