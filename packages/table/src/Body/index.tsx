import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useProvidePerfContext } from '../context/PerfContext'
import { useInjectTableContext } from '../context/TableContext'
import useFlattenRecords from '../hooks/useFlattenRecords'
import { getColumnsKey } from '../utils/valueUtil'
import BodyRow from './BodyRow'
import ExpandedRow from './ExpandedRow'
import MeasureRow from './MeasureRow'

export interface BodyProps<RecordType> {
  data: readonly RecordType[]
  measureColumnWidth: boolean
}

const Body = defineComponent<BodyProps<any>>({
  name: 'TableBody',
  props: ['data', 'measureColumnWidth'] as any,
  setup(props) {
    useProvidePerfContext()

    const context = useInjectTableContext()

    const bodyCls = computed(() => context.classNames?.body || {})
    const bodyStyles = computed(() => context.styles?.body || {})

    const flattenData = useFlattenRecords(
      computed(() => props.data),
      computed(() => context.childrenColumnName),
      computed(() => context.expandedKeys),
      computed(() => context.getRowKey),
    )

    const rowKeys = computed(() => flattenData.value.map(item => item.rowKey))

    const expandedRowInfo = computed(() => {
      const expandedColSpan = context.flattenColumns.length - (context.expandedRowOffset || 0)
      let expandedStickyStart = 0
      for (let i = 0; i < (context.expandedRowOffset || 0); i += 1) {
        expandedStickyStart += context.colWidths[i] || 0
      }
      return {
        offset: context.expandedRowOffset || 0,
        colSpan: expandedColSpan,
        sticky: expandedStickyStart,
      }
    })

    return () => {
      const WrapperComponent = context.getComponent(['body', 'wrapper'], 'tbody')
      const trComponent = context.getComponent(['body', 'row'], 'tr')
      const tdComponent = context.getComponent(['body', 'cell'], 'td')
      const thComponent = context.getComponent(['body', 'cell'], 'th')

      let rows: any
      if (props.data.length) {
        rows = flattenData.value.map((item, idx) => {
          const { record, indent, index: renderIndex, rowKey } = item
          return (
            <BodyRow
              classNames={bodyCls.value}
              styles={bodyStyles.value}
              key={rowKey}
              rowKey={rowKey}
              rowKeys={rowKeys.value}
              record={record}
              index={idx}
              renderIndex={renderIndex}
              rowComponent={trComponent}
              cellComponent={tdComponent}
              scopeCellComponent={thComponent}
              indent={indent}
              expandedRowInfo={expandedRowInfo.value}
            />
          )
        })
      }
      else {
        rows = (
          <ExpandedRow
            expanded
            className={`${context.prefixCls}-placeholder`}
            prefixCls={context.prefixCls}
            component={trComponent}
            cellComponent={tdComponent}
            colSpan={context.flattenColumns.length}
            isEmpty
          >
            {context.emptyNode}
          </ExpandedRow>
        )
      }

      const columnsKey = getColumnsKey(context.flattenColumns)

      return (
        <WrapperComponent
          style={bodyStyles.value.wrapper}
          class={clsx(`${context.prefixCls}-tbody`, bodyCls.value.wrapper)}
        >
          {props.measureColumnWidth && (
            <MeasureRow
              prefixCls={context.prefixCls}
              columnsKey={columnsKey}
              onColumnResize={context.onColumnResize}
              columns={context.flattenColumns}
            />
          )}
          {rows}
        </WrapperComponent>
      )
    }
  },
})

export default Body
