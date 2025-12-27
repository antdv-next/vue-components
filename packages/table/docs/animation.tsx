import type { TableProps } from '../src'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { getTransitionGroupProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, ref, TransitionGroup } from 'vue'
import Table from '../src'
import './animation.less'

const MotionBody = defineComponent({
  name: 'MotionBody',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const transitionGroupProps = getTransitionGroupProps('move')
    return () => {
      const childNode = filterEmpty(slots.default?.())
      return (
        <TransitionGroup tag="tbody" name="move" {...transitionGroupProps} {...attrs}>
          {childNode}
        </TransitionGroup>
      )
    }
  },
})

interface RecordType {
  a: string
  b?: string
  c?: string
  key: string | number
}

export default defineComponent(() => {
  const columns: TableProps['columns'] = [
    { title: 'title1', dataIndex: 'a', key: 'a', width: 100 },
    { title: 'title2', dataIndex: 'b', key: 'b', width: 100 },
    { title: 'title3', dataIndex: 'c', key: 'c', width: 200 },
    {
      title: 'Operations',
      dataIndex: '',
      key: 'd',
      render: (_text: string, record: RecordType) => (
        <a
          onClick={(event) => {
            onDelete(record.key, event)
          }}
          href="#"
        >
          Delete
        </a>
      ),
    },
  ]

  const data = ref<RecordType[]>([
    { a: '123', key: '1' },
    { a: 'cdd', b: 'edd', key: '2' },
    { a: '1333', c: 'eee', key: '3' },
  ])

  const onDelete = (key: string | number, event: MouseEvent) => {
    console.log('Delete', key)
    event.preventDefault()
    data.value = data.value.filter(item => item.key !== key)
  }

  const onAdd = () => {
    data.value = [
      ...data.value,
      {
        a: 'new data',
        b: 'new data',
        c: 'new data',
        key: Date.now(),
      },
    ]
  }

  return () => (
    <div style={{ margin: '20px' }}>
      <h2>Table row with animation</h2>
      <button type="button" onClick={onAdd}>
        添加
      </button>
      <Table
        columns={columns}
        data={data.value}
        components={{
          body: { wrapper: MotionBody },
        }}
      />
    </div>
  )
})
