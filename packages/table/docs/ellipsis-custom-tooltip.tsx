import type { TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

const createColumns = (length: number) =>
  Array.from({ length }, (_, i) => ({
    title: 'description',
    dataIndex: 'description',
    key: `description ${i + 1}`,
    ellipsis: {
      showTitle: false,
    },
    ...(i === 0 ? { width: 50 } : null),
    render(description: string) {
      return <span title={description}>{description}</span>
    },
  }))

const columns: TableProps['columns'] = [
  {
    title: 'name',
    dataIndex: 'name',
    width: 100,
    ellipsis: {
      showTitle: false,
    },
    render: (name: string) => <span title={name}>{name}</span>,
  },
  ...createColumns(10),
  {
    title: 'Operations',
    key: 'operations',
    ellipsis: {
      showTitle: false,
    },
    render() {
      return (
        <a href="#" title="Operations">
          Operations
        </a>
      )
    },
  },
]

const data = [
  { name: 'jack', description: 'description description', key: '1' },
  { name: 'jackjackjackjackjackjack', description: 'description description', key: '2' },
  { name: 'jack ma', description: 'description description', key: '3' },
  { name: 'jack nickson', description: 'description description', key: '4' },
]

export default defineComponent(() => {
  return () => (
    <div>
      <h2>Table ellipsis custom tooltip</h2>
      <Table columns={columns} data={data} />
    </div>
  )
})
