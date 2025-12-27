import type { CSSProperties } from 'vue'
import { computed, defineComponent } from 'vue'
import { clsx } from '@v-c/util'
import Cell from '../Cell'
import type { FlattenData } from '../hooks/useFlattenRecords'
import useRowInfo from '../hooks/useRowInfo'
import VirtualCell from './VirtualCell'
import { useInjectStaticContext } from './context'
import { computedExpandedClassName } from '../utils/expandUtil'

export interface BodyLineProps<RecordType = any> {
  data: FlattenData<RecordType>
  index: number
  className?: string
  style?: CSSProperties
  rowKey: string | number
  extra?: boolean
  getHeight?: (rowSpan: number) => number
}

const BodyLine = defineComponent<BodyLineProps<any>>({
  name: 'TableBodyLine',
  props: ['data', 'index', 'className', 'style', 'rowKey', 'extra', 'getHeight'] as any,
  setup(props) {
    const staticContext = useInjectStaticContext()

    const rowInfo = useRowInfo(
      computed(() => props.data?.record),
      computed(() => props.rowKey),
      computed(() => props.index),
      computed(() => props.data?.indent || 0),
    )

    return () => {
      const { data, index, className, rowKey, style, extra, getHeight } = props
      const { record, indent, index: renderIndex } = data

      const tableContext = rowInfo.tableContext
      const RowComponent = staticContext.getComponent?.(['body', 'row'], 'div') || 'div'
      const CellComponent = staticContext.getComponent?.(['body', 'cell'], 'div') || 'div'

      const { rowSupportExpand, expanded, rowProps } = rowInfo
      const expandedRowRender = tableContext.expandedRowRender
      const expandedRowClassName = tableContext.expandedRowClassName

      let expandRowNode: any
      if (rowSupportExpand.value && expanded.value) {
        const expandContent = expandedRowRender(record, index, indent + 1, expanded.value)
        const expandedClsName = computedExpandedClassName(
          expandedRowClassName,
          record,
          index,
          indent,
        )

        let additionalProps: Record<string, any> = {}
        if (tableContext.fixColumn) {
          additionalProps = {
            style: {
              ['--virtual-width' as any]: `${tableContext.componentWidth}px`,
            },
          }
        }

        const rowCellCls = `${tableContext.prefixCls}-expanded-row-cell`

        expandRowNode = (
          <RowComponent
            class={clsx(
              `${tableContext.prefixCls}-expanded-row`,
              `${tableContext.prefixCls}-expanded-row-level-${indent + 1}`,
              expandedClsName,
            )}
          >
            <Cell
              component={CellComponent}
              prefixCls={tableContext.prefixCls}
              className={clsx(rowCellCls, { [`${rowCellCls}-fixed`]: tableContext.fixColumn })}
              additionalProps={additionalProps}
            >
              {expandContent}
            </Cell>
          </RowComponent>
        )
      }

      const rowStyle: CSSProperties = {
        ...(style || {}),
        width: typeof tableContext.scrollX === 'number' ? `${tableContext.scrollX}px` : (tableContext.scrollX as any),
      }

      if (extra) {
        rowStyle.position = 'absolute'
        rowStyle.pointerEvents = 'none'
      }

      const rowNode = (
        <RowComponent
          {...rowProps.value}
          data-row-key={rowKey}
          class={clsx(className, `${tableContext.prefixCls}-row`, rowProps.value?.className, rowProps.value?.class, {
            [`${tableContext.prefixCls}-row-extra`]: extra,
          })}
          style={{ ...rowStyle, ...(rowProps.value?.style || {}) }}
        >
          {tableContext.flattenColumns.map((column, colIndex) => {
            return (
              <VirtualCell
                key={colIndex}
                component={CellComponent}
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
            )
          })}
        </RowComponent>
      )

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

export default BodyLine
