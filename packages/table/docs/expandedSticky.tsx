import type { ColumnType, Key } from '../src'
import { defineComponent, ref } from 'vue'
import Table, { EXPAND_COLUMN } from '../src'

export function getRowSpan(source: (string | number | undefined)[] = []) {
  const list: { rowSpan?: number }[] = []
  let span = 0
  source
    .slice()
    .reverse()
    .forEach((key, index) => {
      span += 1
      if (key !== source.slice().reverse()[index + 1]) {
        list.push({ rowSpan: span })
        span = 0
      }
      else {
        list.push({ rowSpan: 0 })
      }
    })
  return list.reverse()
}

export default defineComponent(() => {
  const expandedRowKeys = ref<Key[]>([])

  const data = [
    { key: 'a', a: '小二', d: '文零西路' },
    { key: 'b', a: '张三', d: '文一西路' },
    { key: 'c', a: '张三', d: '文二西路' },
  ]

  const columns: ColumnType<Record<string, any>>[] = [
    {
      title: '手机号',
      dataIndex: 'a',
      width: 100,
      colSpan: 2,
      onCell: (_record, index) => {
        if (index === 1) {
          return {
            rowSpan: 2,
          }
        }
        else if (index === 2) {
          return {
            rowSpan: 0,
          }
        }
      },
    },
    { title: 'key', dataIndex: 'key2', colSpan: 0, width: 100 },
    EXPAND_COLUMN,
    { title: 'key', dataIndex: 'key' },
    { title: 'Address', fixed: 'right', dataIndex: 'd', width: 200 },
  ]

  return () => (
    <div style={{ height: '10000px' }}>
      <h2>expanded & sticky</h2>
      <Table<Record<string, any>>
        rowKey="key"
        sticky
        scroll={{ x: 1000 }}
        columns={columns}
        data={data}
        expandable={{
          expandedRowOffset: 2,
          expandedRowKeys: expandedRowKeys.value,
          onExpandedRowsChange: (keys) => {
            expandedRowKeys.value = [...keys]
          },
          expandedRowRender: record => (
            <p style={{ margin: 0 }}>
              expandedRowRender:
              {record.key}
            </p>
          ),
        }}
        className="table"
      />
    </div>
  )
})
