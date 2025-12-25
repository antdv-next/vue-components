import type { TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

interface RecordType {
  a?: string
  b?: string
  c?: string
}

const data = [
  { a: '123', key: '1' },
  { a: 'cdd', b: '2', key: '2' },
  { a: '1333', c: 'eee', d: 2, key: '3' },
]

export default defineComponent(() => {
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: 'title1',
      dataIndex: 'a',
    },
    {
      title: 'title12',
      dataIndex: 'b',
      hidden: true,
    },
    {
      title: 'title13',
      dataIndex: 'c',
    },
  ]

  return () => <Table<RecordType> columns={columns} data={data} />
})
