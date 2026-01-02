import type { PropType } from 'vue'
import type { ColumnType } from '../src'
import { defineComponent, ref } from 'vue'
import Table from '../src'

interface RecordType {
  a: string
  b?: string
  c?: string
  d?: number
  key: string
}

const ResizableTitle = defineComponent({
  name: 'ResizableTitle',
  inheritAttrs: false,
  props: {
    width: Number,
    onResize: Function as PropType<(width: number) => void>,
  },
  setup(props, { attrs, slots }) {
    let startX = 0
    let startWidth = 0

    const onMouseDown = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement | null
      const cell = target?.parentElement as HTMLElement | null
      if (!cell || !props.onResize) {
        return
      }
      event.preventDefault()
      startX = event.clientX
      startWidth = cell.getBoundingClientRect().width

      const onMove = (moveEvent: MouseEvent) => {
        const nextWidth = Math.max(50, startWidth + moveEvent.clientX - startX)
        props.onResize?.(nextWidth)
      }

      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }

    return () => {
      if (!props.width) {
        return <th {...attrs}>{slots.default?.()}</th>
      }

      return (
        <th {...attrs} style={[attrs.style, { position: 'relative', width: `${props.width}px` }]}>
          {slots.default?.()}
          <div class="table-resize-handle" onMousedown={onMouseDown} />
        </th>
      )
    }
  },
})

export default defineComponent(() => {
  const columns = ref<ColumnType<RecordType>[]>([
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
  ])

  const data: RecordType[] = [
    { a: '123', key: '1' },
    { a: 'cdd', b: 'edd', key: '2' },
    { a: '1333', c: 'eee', d: 2, key: '3' },
  ]

  const handleResize = (index: number) => (width: number) => {
    const nextColumns = columns.value.slice()
    nextColumns[index] = {
      ...nextColumns[index],
      width,
    }
    columns.value = nextColumns
  }

  const components = {
    header: {
      cell: ResizableTitle,
    },
  }

  const renderColumns = () =>
    columns.value.map((col, index) => ({
      ...col,
      onHeaderCell: (column: ColumnType<RecordType>) => ({
        width: column.width,
        onResize: handleResize(index),
      }),
    }))

  return () => (
    <div>
      <h2>Column resize</h2>
      <Table components={components} columns={renderColumns()} data={data} />
    </div>
  )
})
