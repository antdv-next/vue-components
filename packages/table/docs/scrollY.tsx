import type { Reference, TableProps } from '../src'
import { computed, defineComponent, ref } from 'vue'
import Table from '../src'

const data = Array.from({ length: 20 }, (_, i) => ({
  key: i,
  a: `a${i}`,
  b: `b${i}`,
  c: `c${i}`,
}))

export default defineComponent(() => {
  const tableRef = ref<Reference | null>(null)
  const showBody = ref(true)

  const toggleBody = (event: MouseEvent) => {
    event.preventDefault()
    showBody.value = !showBody.value
  }

  const columns = computed<TableProps<any>['columns']>(() => [
    { title: 'title1', key: 'a', dataIndex: 'a', width: 100 },
    { id: '123', title: 'title2', dataIndex: 'b', key: 'b', width: 100 },
    { title: 'title3', key: 'c', dataIndex: 'c', width: 200 },
    {
      title: (
        <a onClick={toggleBody} href="#">
          {showBody.value ? '隐藏' : '显示'}体
        </a>
      ),
      key: 'x',
      width: 200,
      render() {
        return <a href="#">Operations</a>
      },
    },
  ])

  return () => (
    <div>
      <h2>scroll body table</h2>
      <button
        onClick={() => {
          tableRef.value?.scrollTo({
            top: 9999,
          })
        }}
      >
        Scroll To End
      </button>
      <button
        onClick={() => {
          tableRef.value?.scrollTo({
            key: 9,
          })
        }}
      >
        Scroll To key 9
      </button>
      <button
        onClick={() => {
          tableRef.value?.scrollTo({
            top: 0,
          })
        }}
      >
        Scroll To top
      </button>
      <button
        onClick={() => {
          tableRef.value?.scrollTo({
            index: 5,
            offset: -10,
          })
        }}
      >
        Scroll To Index 5 + Offset -10
      </button>
      <button
        onClick={() => {
          tableRef.value?.scrollTo({
            key: 6,
            offset: -10,
          })
        }}
      >
        Scroll To Key 6 + Offset -10
      </button>
      <Table
        ref={tableRef}
        columns={columns.value}
        data={data}
        scroll={{ y: 300 }}
        rowKey={record => record.key}
        onRow={() => ({ style: { backgroundColor: 'red' } })}
      />
      <h3>Column align issue</h3>
      <p>https://github.com/ant-design/ant-design/issues/54889</p>
      <Table columns={columns.value} data={data} sticky scroll={{ y: 300, x: 2000 }} />
    </div>
  )
})
