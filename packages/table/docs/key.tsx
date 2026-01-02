import type { PropType } from 'vue'
import { defineComponent, ref } from 'vue'
import Table from '../src'

function CheckBox(props: { id: string }) {
  return (
    <label>
      <input type="checkbox" />
      {props.id}
    </label>
  )
}

interface RecordType {
  a: string
  b?: string
  c?: string
  d?: number
}

const Demo = defineComponent({
  name: 'KeyDemo',
  props: {
    data: {
      type: Array as PropType<RecordType[]>,
      required: true,
    },
  },
  setup(props) {
    const stateData = ref<RecordType[]>(props.data.slice())

    const remove = (index: number) => {
      const nextData = stateData.value.slice()
      nextData.splice(index, 1)
      stateData.value = nextData
    }

    const handleClick = (index: number) => (event: MouseEvent) => {
      event.preventDefault()
      remove(index)
    }

    const renderAction = (_o: any, _row: RecordType, index: number) => (
      <a href="#" onClick={handleClick(index)}>
        Delete
      </a>
    )

    return () => {
      const columns = [
        {
          title: 'title1',
          dataIndex: 'a',
          key: 'a',
          width: 100,
          render: (a: string) => <CheckBox id={a} />,
        },
        { title: 'title2', dataIndex: 'b', key: 'b', width: 100 },
        { title: 'title3', dataIndex: 'c', key: 'c', width: 200 },
        { title: 'Operations', dataIndex: '', key: 'x', render: renderAction },
      ]

      return (
        <Table columns={columns} data={stateData.value} className="table" rowKey={record => record.a} />
      )
    }
  },
})

const data: RecordType[] = [
  { a: '123' },
  { a: 'cdd', b: 'edd' },
  { a: '1333', c: 'eee', d: 2 },
]

export default defineComponent(() => {
  return () => (
    <div>
      <h2>specify key</h2>
      <Demo data={data} />
    </div>
  )
})
