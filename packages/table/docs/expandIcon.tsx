import type { RenderExpandIconProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

const data = [
  { key: 0, a: '123' },
  { key: 1, a: 'cdd', b: 'edd' },
  { key: 2, a: '1333', c: 'eee', d: 2 },
]

const columns = [
  { title: 'title 1', dataIndex: 'a', key: 'a', width: 100 },
  { title: 'title 2', dataIndex: 'b', key: 'b', width: 100 },
  { title: 'title 3', dataIndex: 'c', key: 'c', width: 200 },
]

function CustomExpandIcon(props: RenderExpandIconProps<any>) {
  const text = props.expanded ? '&#8679; collapse' : '&#8681; expand'
  return (
    <a
      class="expand-row-icon"
      onClick={(event) => {
        props.onExpand(props.record, event)
      }}
      innerHTML={text}
      style={{ color: 'blue', cursor: 'pointer' }}
    />
  )
}

export default defineComponent(() => {
  const onExpand = (expanded: boolean, record: any) => {
    console.log('onExpand', expanded, record)
  }

  return () => (
    <Table
      columns={columns}
      data={data}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: record => <p>extra: {record.a}</p>,
        onExpand,
        expandIcon: CustomExpandIcon,
      }}
    />
  )
})
