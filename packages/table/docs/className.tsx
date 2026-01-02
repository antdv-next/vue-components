import type { TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

const columns: TableProps['columns'] = [
  {
    title: 'title1',
    dataIndex: 'a',
    className: 'a',
    key: 'a',
    width: 100,
  },
  {
    title: 'title2',
    dataIndex: 'b',
    className: 'b',
    key: 'b',
    width: 100,
  },
  {
    title: 'title3',
    dataIndex: 'c',
    className: 'c',
    key: 'c',
    width: 200,
  },
  {
    title: 'Operations',
    dataIndex: '',
    className: 'd',
    key: 'd',
    render() {
      return <a href="#">Operations</a>
    },
  },
]

const data = [
  { a: '123', key: '1' },
  { a: 'cdd', b: 'edd', key: '2' },
  { a: '1333', c: 'eee', d: 2, key: '3' },
]

const longData = Array.from({ length: 5 }, (_, index) =>
  data.map(item => ({ ...item, key: `${index}-${item.key}` }))).flat()

export default defineComponent(() => {
  return () => (
    <div>
      <h2>rowClassName and className</h2>
      <Table
        columns={columns}
        rowClassName={(_record, i) => `row-${i}`}
        expandedRowRender={record => (
          <p>
            extra:
            {record.a}
          </p>
        )}
        expandedRowClassName={(_record, i) => `ex-row-${i}`}
        data={data}
        className="table"
        title={() => <span>title</span>}
        footer={() => <span>footer</span>}
      />
      <h2>scroll</h2>
      <Table
        columns={columns}
        rowClassName={(_record, i) => `row-${i}`}
        expandedRowRender={record => (
          <p>
            extra:
            {record.a}
          </p>
        )}
        expandedRowClassName={(_record, i) => `ex-row-${i}`}
        data={longData}
        className="table"
        scroll={{ x: 'calc(700px + 50%)', y: 47 * 5 }}
        title={() => <span>title</span>}
        footer={() => <span>footer</span>}
      />
    </div>
  )
})
