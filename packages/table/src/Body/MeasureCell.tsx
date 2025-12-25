import { defineComponent, onMounted, ref } from 'vue';
import ResizeObserver from '@v-c/resize-observer';
import type { Key } from '../interface';

export interface MeasureCellProps {
  columnKey: Key;
  onColumnResize: (key: Key, width: number) => void;
  title?: any;
}

export default defineComponent<MeasureCellProps>({
  name: 'MeasureCell',
  props: ['columnKey', 'title'] as any,
  emits: ['columnResize'],
  setup(props, { emit }) {
    const tdRef = ref<HTMLTableCellElement>();
    onMounted(() => {
      if (tdRef.value) {
        emit('columnResize', props.columnKey, tdRef.value.offsetWidth);
      }
    });
    return () => {
      return (
        <ResizeObserver
          data={props.columnKey}
          onResize={({ offsetWidth }) => {
            emit('columnResize', props.columnKey, offsetWidth);
          }}
        >
          <td
            ref={tdRef}
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              borderTop: 0,
              borderBottom: 0,
              height: 0,
            }}
          >
            <div style={{ height: 0, overflow: 'hidden', fontWeight: 'bold' }}>
              {props.title ?? '\xa0'}
            </div>
          </td>
        </ResizeObserver>
      );
    };
  },
});
