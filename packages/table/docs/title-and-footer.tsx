import type { ColumnType } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'
import { useCheckbox } from './utils/useInput.ts'

interface RecordType {
  a: string
  b?: string
  c?: string
  d?: number
  value?: number
  value2?: number
  key: string
}

const data: RecordType[] = [
  { a: '123', key: '1' },
  { a: 'cdd', b: 'edd', key: '2' },
  { a: '1333', c: 'eee', d: 2, key: '3' },
]

data.forEach((item, index) => {
  item.value = index * 3 + 7
  item.value2 = index * 7 + 5
})

function useColumns(fixColumns: boolean): ColumnType<RecordType>[] {
  return [
    { title: 'title1', dataIndex: 'a', key: 'a', width: 100, fixed: fixColumns ? 'left' : undefined },
    { title: 'title2', dataIndex: 'b', key: 'b', width: 100 },
    { title: 'title3', dataIndex: 'c', key: 'c', width: 200 },
    { title: 'value', dataIndex: 'value' },
    { title: 'value2', dataIndex: 'value2' },
    {
      title: 'Operations',
      key: 'd',
      render() {
        return <a href="#">Operations</a>
      },
    },
  ]
}

export default defineComponent(() => {
  const [fixColumns, onFixColumns] = useCheckbox(false)

  return () => (
    <div>
      <h2>title and footer</h2>
      <label>
        <input type="checkbox" checked={fixColumns.value} onChange={onFixColumns} />
        Fix Columns
      </label>
      <Table<RecordType>
        columns={useColumns(fixColumns.value)}
        data={data}
        scroll={{ x: fixColumns.value ? 2000 : undefined }}
        title={currentData => (
          <div>
            Title:
            {currentData.length}
            {' '}
            items
          </div>
        )}
        footer={currentData => (
          <div>
            Footer:
            {currentData.length}
            {' '}
            items
          </div>
        )}
        summary={currentData => (
          <>
            <tr>
              <th colSpan={6}>Summary</th>
            </tr>
            <tr>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>{currentData.reduce((total, item) => total + (item.value || 0), 0)}</td>
              <td>{currentData.reduce((total, item) => total + (item.value2 || 0), 0)}</td>
              <td>-</td>
            </tr>
          </>
        )}
      />
    </div>
  )
})
