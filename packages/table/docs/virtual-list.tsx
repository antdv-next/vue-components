import type { ListRef } from '@v-c/virtual-list'
import type { PropType } from 'vue'
import { defineComponent, ref, watchEffect } from 'vue'
import VirtualList from '@v-c/virtual-list'
import Table from '../src'
import './virtual-list.less'

const columns = [
  { title: 'A', dataIndex: 'a', width: 100 },
  { title: 'B', dataIndex: 'b', width: 100 },
  { title: 'C', dataIndex: 'c', width: 100 },
]

const data = Array.from({ length: 100000 }, (_, i) => ({
  key: i,
  a: `a${i}`,
  b: `b${i}`,
  c: `c${i}`,
}))

const VirtualBody = defineComponent({
  name: 'VirtualBody',
  props: {
    data: { type: Array as PropType<any[]>, required: true },
    scrollbarSize: { type: Number, required: true },
    bodyRef: { type: Object as PropType<{ value: any }>, required: true },
    onScroll: { type: Function as PropType<(info: { currentTarget?: HTMLElement; scrollLeft?: number }) => void> },
  },
  setup(props) {
    const listRef = ref<ListRef | null>(null)

    watchEffect(() => {
      const native = listRef.value?.nativeElement as any
      props.bodyRef.value = native && typeof native === 'object' && 'value' in native ? native.value : native
    })

    return () => {
      const columnWidths = columns.map((col, index) => {
        const width = typeof col.width === 'number' ? col.width : 100
        return index === columns.length - 1 ? width - props.scrollbarSize - 1 : width
      })

      return (
        <VirtualList
          ref={listRef}
          class="virtual-grid"
          data={props.data}
          height={300}
          itemHeight={50}
          itemKey="key"
          onScroll={(event: Event) => {
            props.onScroll?.({ currentTarget: event.currentTarget as HTMLElement })
          }}
        >
          {({ index, style }: { index: number; style: any }) => (
            <div style={[style, { display: 'flex' }]}
              >
              {columnWidths.map((width, columnIndex) => (
                <div
                  key={columnIndex}
                  class={[
                    'virtual-cell',
                    columnIndex === columns.length - 1 ? 'virtual-cell-last' : null,
                  ]}
                  style={{ width: `${width}px`, height: '50px', lineHeight: '50px' }}
                >
                  r{index}, c{columnIndex}
                </div>
              ))}
            </div>
          )}
        </VirtualList>
      )
    }
  },
})

export default defineComponent(() => {
  const renderVirtualList = (rawData: object[], { scrollbarSize, ref: bodyRef, onScroll }: any) => (
    <VirtualBody data={rawData} scrollbarSize={scrollbarSize} bodyRef={bodyRef} onScroll={onScroll} />
  )

  return () => (
    <Table
      style={{ width: '301px' }}
      tableLayout="fixed"
      columns={columns}
      data={data}
      scroll={{ y: 300 }}
      components={{
        body: renderVirtualList,
      }}
    />
  )
})
