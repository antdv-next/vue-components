import type { TableProps } from '../src'
import { cloneVNode, defineComponent, isVNode } from 'vue'
import Table from '../src'

const columns = [
  {
    title: (
      <div>
        Name
        <div class="filter-dropdown" style={{ display: 'none' }}>
          Filter Content
        </div>
      </div>
    ),
    dataIndex: 'name',
    key: 'name',
    width: 100,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 80,
  },
]

const data = [
  { key: 1, name: 'John', age: 25 },
  { key: 2, name: 'Jane', age: 30 },
  { key: 3, name: 'Jime', age: 35 },
]

const measureRowRender: TableProps['measureRowRender'] = (measureRow) => {
  if (isVNode(measureRow)) {
    return cloneVNode(measureRow, {
      style: { ...(measureRow.props as any)?.style, display: 'none' },
    })
  }
  return measureRow
}

export default defineComponent(() => {
  return () => (
    <Table
      columns={columns}
      data={data}
      sticky
      scroll={{ x: true }}
      measureRowRender={measureRowRender}
    />
  )
})
