import type { GetRowKey, Key, GetComponentProps } from '../interface'
import ExpandedRow from './ExpandedRow'
import { getColumnsKey } from '../utils/valueUtil'
import MeasureCell from './MeasureCell'
import BodyRow from './BodyRow'
import useFlattenRecords from '../hooks/useFlattenRecords'
import { computed, defineComponent, shallowRef, toRef } from 'vue'
import { useInjectResize } from '../context/ResizeContext'
import { useInjectTable } from '../context/TableContext'
import { useInjectBody } from '../context/BodyContext'
import { useProvideHover } from '../context/HoverContext'
import { classNames } from '@v-c/util'

export interface BodyProps<RecordType> {
  data: RecordType[]
  getRowKey: GetRowKey<RecordType>
  measureColumnWidth: boolean
  expandedKeys: Set<Key>
  onRow: GetComponentProps<RecordType>
  rowExpandable?: (record: RecordType) => boolean
  childrenColumnName: string
  measureRowRender?: (measureRow: any) => any
}

export default defineComponent<BodyProps<any>>({
  name: 'TableBody',
  props: [
    'data',
    'getRowKey',
    'measureColumnWidth',
    'expandedKeys',
    'onRow',
    'rowExpandable',
    'childrenColumnName',
    'measureRowRender',
  ] as any,
  setup(props, { slots }) {
    const resizeContext = useInjectResize()
    const tableContext = useInjectTable()
    const bodyContext = useInjectBody()

    const flattenData = useFlattenRecords(
      toRef(props, 'data'),
      toRef(props, 'childrenColumnName'),
      toRef(props, 'expandedKeys'),
      toRef(props, 'getRowKey'),
    )
    const rowKeys = computed(() =>
      flattenData.value.map(item => props.getRowKey(item.record, item.index)),
    )

    const expandedRowInfo = computed(() => {
      const offset = bodyContext.expandedRowOffset || 0
      if (!offset) {
        return null
      }
      const expandedColSpan = Math.max(bodyContext.flattenColumns.length - offset, 0)
      const widths = tableContext.colWidths || []
      let expandedStickyStart = 0
      for (let i = 0; i < offset; i += 1) {
        expandedStickyStart += widths[i] || 0
      }
      return {
        offset,
        colSpan: expandedColSpan,
        sticky: expandedStickyStart,
      }
    })

    const startRow = shallowRef(-1)
    const endRow = shallowRef(-1)
    let timeoutId: any
    useProvideHover({
      startRow,
      endRow,
      onHover: (start, end) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          startRow.value = start
          endRow.value = end
        }, 100)
      },
    })

    return () => {
      const {
        data,
        getRowKey,
        measureColumnWidth,
        expandedKeys,
        onRow,
        rowExpandable,
        childrenColumnName,
      } = props
      const { onColumnResize } = resizeContext
      const { prefixCls, getComponent, classNames: tableClassNames, styles } = tableContext
      const { flattenColumns } = bodyContext
      const WrapperComponent = getComponent(['body', 'wrapper'], 'tbody')
      const trComponent = getComponent(['body', 'row'], 'tr')
      const tdComponent = getComponent(['body', 'cell'], 'td')
      const thComponent = getComponent(['body', 'cell'], 'th')
      const { body: bodyCls = {} } = tableClassNames || {}
      const { body: bodyStyles = {} } = styles || {}

      let rows
      if (data.length) {
        rows = flattenData.value.map((item, idx) => {
          const { record, indent, index: renderIndex } = item

          const key = getRowKey(record, idx)

          return (
            <BodyRow
              key={key}
              rowKey={key}
              rowKeys={rowKeys.value}
              record={record}
              recordKey={key}
              index={idx}
              renderIndex={renderIndex}
              rowComponent={trComponent}
              cellComponent={tdComponent}
              scopeCellComponent={thComponent}
              expandedKeys={expandedKeys}
              onRow={onRow}
              getRowKey={getRowKey}
              rowExpandable={rowExpandable}
              childrenColumnName={childrenColumnName}
              indent={indent}
              expandedRowInfo={expandedRowInfo.value || undefined}
            />
          )
        })
      } else {
        rows = (
          <ExpandedRow
            expanded
            class={`${prefixCls}-placeholder`}
            prefixCls={prefixCls}
            component={trComponent}
            cellComponent={tdComponent}
            colSpan={flattenColumns.length}
            isEmpty
          >
            {slots.emptyNode?.()}
          </ExpandedRow>
        )
      }

      const columnsKey = getColumnsKey(flattenColumns)

      const measureRow =
        measureColumnWidth && (
          <tr
            aria-hidden="true"
            class={`${prefixCls}-measure-row`}
            style={{ height: 0, fontSize: 0 }}
          >
            {columnsKey.map((columnKey, columnIndex) => (
              <MeasureCell
                key={columnKey}
                columnKey={columnKey}
                title={flattenColumns[columnIndex]?.title}
                onColumnResize={onColumnResize}
              />
            ))}
          </tr>
        )
      const renderedMeasureRow =
        measureColumnWidth && props.measureRowRender
          ? props.measureRowRender(measureRow)
          : measureRow

      return (
        <WrapperComponent
          class={classNames(`${prefixCls}-tbody`, bodyCls.wrapper)}
          style={bodyStyles.wrapper}
        >
          {renderedMeasureRow}
          {rows}
        </WrapperComponent>
      )
    }
  },
})
