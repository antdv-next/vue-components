import type { CSSProperties } from 'vue'
import { computed, defineComponent } from 'vue'
import { classNames } from '@v-c/util'
import type { DefaultRecordType, Key } from '../interface'
import { useInjectBody } from '../context/BodyContext'
import { useInjectTable } from '../context/TableContext'
import Cell from '../Cell'
import { computedExpandedClassName } from '../utils/expandUtil'
import { getColumnsKey } from '../utils/valueUtil'
import VirtualCell from './VirtualCell'
import { useInjectStatic } from './context'

export interface FlattenData<RecordType = any> {
  record: RecordType
  indent: number
  index: number
}

export interface BodyLineProps<RecordType = any> {
  data: FlattenData<RecordType>
  index: number
  className?: string
  style?: CSSProperties
  rowKey: Key
  extra?: boolean
  getHeight?: (rowSpan: number) => number
}

export default defineComponent<BodyLineProps<any>>({
  name: 'BodyLine',
  inheritAttrs: false,
  props: ['data', 'index', 'className', 'style', 'rowKey', 'extra', 'getHeight'] as any,
  setup(props) {
    const tableContext = useInjectTable()
    const bodyContext = useInjectBody()
    const staticContext = useInjectStatic()

    const expanded = computed(
      () => !!tableContext.expandedKeys && tableContext.expandedKeys.has(props.rowKey),
    )
    const nestExpandable = computed(() => bodyContext.expandableType === 'nest')
    const rowSupportExpand = computed(
      () =>
        bodyContext.expandableType === 'row' &&
        (!bodyContext.rowExpandable || bodyContext.rowExpandable(props.data.record)),
    )
    const hasNestChildren = computed(
      () =>
        tableContext.childrenColumnName &&
        props.data.record &&
        props.data.record[tableContext.childrenColumnName],
    )
    const mergedExpandable = computed(() => rowSupportExpand.value || nestExpandable.value)

    const additionalProps = computed(() => tableContext.onRow?.(props.data.record, props.index) || {})

    const computeRowClassName = computed(() => {
      const { rowClassName } = bodyContext
      if (typeof rowClassName === 'string') {
        return rowClassName
      }
      if (typeof rowClassName === 'function') {
        return rowClassName(props.data.record, props.index, props.data.indent)
      }
      return ''
    })

    const columnsKey = computed(() => getColumnsKey(bodyContext.flattenColumns))

    const onInternalTriggerExpand = (record: DefaultRecordType, event: Event) => {
      bodyContext.onTriggerExpand(record, event as any)
    }

    return () => {
      const { data, index, className, style, rowKey, extra, getHeight } = props
      const { record, indent, index: renderIndex } = data
      const {
        prefixCls,
        fixedInfoList,
        scrollX,
        fixColumn,
        componentWidth,
        classNames: tableClassNames,
        styles,
      } = tableContext
      const { body: bodyCls = {} } = tableClassNames || {}
      const { body: bodyStyles = {} } = styles || {}

      const {
        flattenColumns,
        expandedRowRender,
        expandedRowClassName,
        indentSize,
        expandIcon,
        expandIconColumnIndex,
      } = bodyContext

      const RowComponent = staticContext.getComponent(['body', 'row'], 'div')
      const cellComponent = staticContext.getComponent(['body', 'cell'], 'div')

      const onClick = (event: MouseEvent) => {
        if (bodyContext.expandRowByClick && mergedExpandable.value) {
          onInternalTriggerExpand(record as DefaultRecordType, event)
        }
        additionalProps.value?.onClick?.(event as any)
      }

      const expandedClsName = computedExpandedClassName(
        expandedRowClassName,
        record,
        index,
        indent,
      )

      const rowInfo = {
        record,
        prefixCls,
        columnsKey: columnsKey.value,
        fixedInfoList,
        expandIconColumnIndex,
        nestExpandable: nestExpandable.value,
        indentSize,
        expandIcon,
        expanded: expanded.value,
        hasNestChildren: hasNestChildren.value,
        onTriggerExpand: onInternalTriggerExpand,
      }

      const rowStyle: CSSProperties = {
        ...style,
      }
      if (typeof scrollX === 'number') {
        rowStyle.width = scrollX
      }
      if (extra) {
        rowStyle.position = 'absolute'
        rowStyle.pointerEvents = 'none'
      }

      const rowNode = (
        <RowComponent
          {...additionalProps.value}
          data-row-key={rowKey}
          class={classNames(
            className,
            `${prefixCls}-row`,
            computeRowClassName.value,
            bodyCls.row,
            additionalProps.value.class,
            additionalProps.value.className,
            extra ? `${prefixCls}-row-extra` : null,
          )}
          style={[rowStyle, bodyStyles.row, additionalProps.value.style]}
          onClick={onClick}
        >
          {flattenColumns.map((column, colIndex) => (
            <VirtualCell
              key={colIndex}
              component={cellComponent}
              rowInfo={rowInfo}
              column={column}
              colIndex={colIndex}
              indent={indent}
              index={index}
              renderIndex={renderIndex}
              record={record}
              inverse={extra}
              getHeight={getHeight}
            />
          ))}
        </RowComponent>
      )

      let expandRowNode
      if (rowSupportExpand.value && expanded.value) {
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

        let additionalProps: Record<string, any> = {}
        if (fixColumn) {
          additionalProps = {
            style: {
              ['--virtual-width' as any]: `${componentWidth}px`,
            },
          }
        }

        const rowCellCls = `${prefixCls}-expanded-row-cell`
        expandRowNode = (
          <RowComponent
            class={classNames(
              `${prefixCls}-expanded-row`,
              `${prefixCls}-expanded-row-level-${indent + 1}`,
              expandedClsName,
            )}
          >
            <Cell
              component={cellComponent}
              prefixCls={prefixCls}
              class={classNames(rowCellCls, { [`${rowCellCls}-fixed`]: fixColumn })}
              additionalProps={additionalProps}
            >
              {expandContent}
            </Cell>
          </RowComponent>
        )
      }

      if (rowSupportExpand.value) {
        return (
          <div>
            {rowNode}
            {expandRowNode}
          </div>
        )
      }

      return rowNode
    }
  },
})
