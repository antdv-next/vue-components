import type { ColumnsType } from '../src'
import { defineComponent, ref } from 'vue'
import { VirtualTable } from '../src'

interface RecordType {
  a: string
  b?: string
  c?: string
}

const columns1: ColumnsType = [
  { title: 'title1', dataIndex: 'a', width: 100 },
  { title: 'title2', dataIndex: 'b', width: 100 },
  {
    title: 'title13',
    dataIndex: 'c',
  },
]

const columns2: ColumnsType = [
  { title: 'title1', dataIndex: 'a', width: 100 },
  { title: 'title2', dataIndex: 'b', width: 100 },
]

const columns3: ColumnsType = [
  { title: 'title1', dataIndex: 'a', width: 500 },
  { title: 'title2', dataIndex: 'b', width: 500 },
]

const data: RecordType[] = Array.from({ length: 4 * 10000 }).fill(null).map((_, index) => ({
  a: `a${index}`,
  b: `b${index}`,
  c: `c${index}`,
}))

export default defineComponent(() => {
  const columns = ref(columns1)

  return () => (
    <div style={{ width: '800px', padding: '0 64px' }}>
      <label>
        <input type="radio" checked={columns.value === columns1} onChange={() => { columns.value = columns1 }} />
        Fill Rest
      </label>
      <label>
        <input type="radio" checked={columns.value === columns2} onChange={() => { columns.value = columns2 }} />
        Stretch
      </label>
      <label>
        <input type="radio" checked={columns.value === columns3} onChange={() => { columns.value = columns3 }} />
        Over Size
      </label>

      <VirtualTable
        getContainerWidth={(_, w) => w - 1}
        columns={columns.value}
        scroll={{ y: 200 }}
        data={data}
        rowKey="a"
      />
    </div>
  )
})
