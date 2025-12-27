import { defineComponent, ref } from 'vue'
import ResizeObserver from '@v-c/resize-observer'
import isVisible from '@v-c/util/dist/Dom/isVisible'
import MeasureCell from './MeasureCell'
import { useInjectTableContext } from '../context/TableContext'
import type { ColumnType, Key } from '../interface'

export interface MeasureRowProps {
  prefixCls: string
  onColumnResize: (key: Key, width: number) => void
  columnsKey: Key[]
  columns: readonly ColumnType<any>[]
}

const MeasureRow = defineComponent<MeasureRowProps>({
  name: 'TableMeasureRow',
  props: ['prefixCls', 'onColumnResize', 'columnsKey', 'columns'] as any,
  setup(props) {
    const rowRef = ref<HTMLTableRowElement | null>(null)
    const { measureRowRender } = useInjectTableContext()
    return () => {
      const measureRow = (
        <tr aria-hidden="true" class={`${props.prefixCls}-measure-row`} style={{ height: 0 }} ref={rowRef}>
          <ResizeObserver.Collection
            onBatchResize={(infoList) => {
              if (isVisible(rowRef.value as any)) {
                infoList.forEach(({ data: columnKey, size }) => {
                  props.onColumnResize(columnKey, size.offsetWidth)
                })
              }
            }}
          >
            {props.columnsKey.map((columnKey) => {
              const column = props.columns.find(col => col.key === columnKey)
              const titleForMeasure = column?.title
              return (
                <MeasureCell
                  key={columnKey as any}
                  columnKey={columnKey}
                  onColumnResize={props.onColumnResize}
                  title={titleForMeasure}
                />
              )
            })}
          </ResizeObserver.Collection>
        </tr>
      )

      return typeof measureRowRender === 'function' ? measureRowRender(measureRow) : measureRow
    }
  },
})

export default MeasureRow
