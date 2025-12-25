import type { TableProps } from '../src'
import { defineComponent, ref } from 'vue'
import Table from '../src'

interface RecordType {
  a?: string
  b?: string
  c?: string
}

const data = [
  { a: '123', key: '1' },
  { a: 'cdd', b: 'edd', key: '2' },
  { a: '1333', c: 'eee', d: 2, key: '3' },
]

export default defineComponent(() => {
  const count = ref(0)

  const columns: TableProps<RecordType>['columns'] = [
    {
      title: 'title',
      dataIndex: 'a',
      render: () => count.value,
    },
  ]

  return () => (
    <>
      <button
        onClick={() => {
          count.value += 1
        }}
      >
        Click {count.value} times
      </button>
      <Table<RecordType> columns={columns} data={data} />
    </>
  )
})
