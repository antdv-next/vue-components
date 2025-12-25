import { defineComponent } from 'vue'
import Table from '../src'

const columns = [
  { title: 'title1', dataIndex: 'a', key: 'a', width: 100 },
  { title: 'title2', dataIndex: 'b', key: 'b', width: 100 },
  { title: 'title3', dataIndex: 'c', key: 'c', width: 200 },
  {
    title: 'Operations',
    dataIndex: '',
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

const BodyRow = defineComponent({
  name: 'StyledRow',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => (
      <tr {...attrs} class={[attrs.class, 'table-demo-styled-row']}>
        {slots.default?.()}
      </tr>
    )
  },
})

const components = {
  body: {
    row: BodyRow,
  },
}

export default defineComponent(() => {
  return () => (
    <div>
      <h2>Styled row</h2>
      <Table columns={columns} data={data} components={components} />
    </div>
  )
})
