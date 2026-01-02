import type { TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

interface RecordType {
  key: string
  name: string
  age: number
  note: string
}

const data: RecordType[] = [
  { key: '1', name: 'Alice', age: 28, note: 'alpha' },
  { key: '2', name: 'Bob', age: 34, note: 'beta' },
]

const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: value => `render:${value}`,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    render: value => `render:${value}`,
  },
  {
    title: 'Note',
    dataIndex: 'note',
  },
]

export default defineComponent(() => {
  const headerCell: TableProps<RecordType>['headerCell'] = ({ column, index, text }) => {
    if (column.dataIndex === 'name') {
      return [<span style={{ color: '#0b6', fontWeight: 600 }}>{`H${index}:${text}`}</span>]
    }
    if (column.dataIndex === 'age') {
      return []
    }
    return undefined
  }

  const bodyCell: TableProps<RecordType>['bodyCell'] = ({ column, index, text, record }) => {
    if (column.dataIndex === 'name') {
      return [<span style={{ color: '#036', textDecoration: 'underline' }}>{`B${index}:${text}`}</span>]
    }
    if (column.dataIndex === 'age' && record.name === 'Bob') {
      return []
    }
    return undefined
  }

  return () => (
    <Table<RecordType>
      columns={columns}
      data={data}
      headerCell={headerCell}
      bodyCell={bodyCell}
    />
  )
})
