import { defineComponent, ref } from 'vue'
import Table from '../src'

interface RecordType {
  a?: string
  b?: string
  c?: string
  d?: number
  key: string
}

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

const BodyRow = defineComponent({
  name: 'BodyRow',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const hoverPosition = ref<'upward' | 'downward' | null>(null)

    const onDragStart = (event: DragEvent) => {
      const index = (attrs as any).index
      if (index === undefined) {
        return
      }
      event.dataTransfer?.setData('text/plain', String(index))
      event.dataTransfer?.setData('text/table-row', String(index))
      event.dataTransfer?.setDragImage((event.currentTarget as HTMLElement) ?? new Image(), 0, 0)
    }

    const onDragOver = (event: DragEvent) => {
      event.preventDefault()
      const target = event.currentTarget as HTMLElement | null
      if (!target) {
        return
      }
      const rect = target.getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      hoverPosition.value = event.clientY < midY ? 'upward' : 'downward'
    }

    const onDragLeave = () => {
      hoverPosition.value = null
    }

    const onDrop = (event: DragEvent) => {
      event.preventDefault()
      const dropIndex = (attrs as any).index
      const moveRow = (attrs as any).moveRow as ((from: number, to: number) => void) | undefined
      const dragIndexText = event.dataTransfer?.getData('text/table-row')
      const dragIndex = dragIndexText ? Number(dragIndexText) : Number.NaN
      hoverPosition.value = null
      if (!Number.isNaN(dragIndex) && dropIndex !== undefined && moveRow) {
        moveRow(dragIndex, dropIndex)
      }
    }

    return () => {
      const { class: className, style, index, moveRow, ...restAttrs } = attrs as any
      const hoverClass =
        hoverPosition.value === 'upward'
          ? 'drag-over-upward'
          : hoverPosition.value === 'downward'
            ? 'drag-over-downward'
            : ''
      return (
        <tr
          {...restAttrs}
          class={[className, hoverClass]}
          style={style}
          draggable
          onDragstart={onDragStart}
          onDragover={onDragOver}
          onDragleave={onDragLeave}
          onDrop={onDrop}
        >
          {slots.default?.()}
        </tr>
      )
    }
  },
})

export default defineComponent(() => {
  const data = ref<RecordType[]>([
    { a: '123', key: '1' },
    { a: 'cdd', b: 'edd', key: '2' },
    { a: '1333', c: 'eee', d: 2, key: '3' },
  ])

  const components = {
    body: {
      row: BodyRow,
    },
  }

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) {
      return
    }
    const next = data.value.slice()
    const [item] = next.splice(dragIndex, 1)
    next.splice(hoverIndex, 0, item)
    data.value = next
  }

  return () => (
    <div>
      <h2>Row drag and drop</h2>
      <Table
        columns={columns}
        data={data.value}
        components={components}
        onRow={(_record, index) => ({
          index,
          moveRow,
        })}
      />
    </div>
  )
})
