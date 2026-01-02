import type { TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'
import './expandedRowClassName.less'

const columns: TableProps['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
]

const data = [
  {
    name: 'John',
    age: '25',
    address: '1 A Street',
    children: [
      { name: 'C-John', age: '31', address: '1 A Stree2t' },
      {
        name: 'C-Fred',
        age: '532',
        address: '2 B Str1eet',
        children: [
          { name: 'D-John', age: '31', address: '1 A Stree2t' },
          { name: 'D-Fred', age: '532', address: '2 B Str1eet' },
          { name: 'D-Anne', age: '43217', address: '3 C S3treet' },
        ],
      },
      { name: 'C-Anne', age: '43217', address: '3 C S3treet' },
    ],
  },
  { name: 'Fred', age: '38', address: '2 B Street' },
  { name: 'Anne', age: '47', address: '3 C Street' },
]

export default defineComponent(() => {
  return () => (
    <div>
      <h2>Table expandedRowClassName</h2>
      <Table
        rowKey="name"
        columns={columns}
        data={data}
        expandable={{
          expandedRowClassName: () => 'expanded-row-highlight',
        }}
      />
    </div>
  )
})
