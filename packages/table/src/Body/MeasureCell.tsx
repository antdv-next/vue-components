import type { Key } from '../interface'
import ResizeObserver from '@v-c/resize-observer'
import { useLayoutEffect } from '@v-c/util/dist/hooks/useLayoutEffect'
import { defineComponent, ref } from 'vue'

export interface MeasureCellProps {
  columnKey: Key
  onColumnResize: (key: Key, width: number) => void
  title?: any
}

const MeasureCell = defineComponent<MeasureCellProps>({
  name: 'TableMeasureCell',
  props: ['columnKey', 'onColumnResize', 'title'] as any,
  setup(props) {
    const cellRef = ref<HTMLTableCellElement | null>(null)

    useLayoutEffect(() => {
      if (cellRef.value) {
        props.onColumnResize(props.columnKey, cellRef.value.offsetWidth)
      }
    }, [])

    return () => (
      <ResizeObserver data={props.columnKey}>
        <td
          ref={cellRef}
          style={{ paddingTop: 0, paddingBottom: 0, borderTop: 0, borderBottom: 0, height: 0 }}
        >
          <div style={{ height: 0, overflow: 'hidden', fontWeight: 'bold' }}>
            {props.title || '\u00A0'}
          </div>
        </td>
      </ResizeObserver>
    )
  },
})

export default MeasureCell
