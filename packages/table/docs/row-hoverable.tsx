import type { TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

interface RecordType {
  a?: string
}

const data = [{ a: 'A' }, { a: 'B' }, { a: 'C' }]

export default defineComponent(() => {
  const columns: TableProps<RecordType>['columns'] = [{ title: 'title', dataIndex: 'a' }]

  return () => <Table columns={columns} data={data} rowHoverable={false} />
})
