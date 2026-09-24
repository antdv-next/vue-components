import type { ColumnsType, ColumnType } from '../src'
import { defineComponent, ref } from 'vue'
import Table, { VirtualTable } from '../src'

interface RecordType {
  key: string
  name: string
  age: number
  address: string
  email: string
}

const data: RecordType[] = Array.from({ length: 30 }, (_, index) => ({
  key: `${index}`,
  name: `Name ${index}`,
  age: 20 + (index % 30),
  address: `Street ${index}, Some City`,
  email: `user${index}@example.com`,
}))

function useResizeLog() {
  const log = ref<string[]>([])
  const onResizeColumn = (width: number, column: ColumnType<RecordType>) => {
    log.value = [`${String(column.title)} -> ${width}px`, ...log.value].slice(0, 5)
  }
  return { log, onResizeColumn }
}

const Basic = defineComponent(() => {
  const { log, onResizeColumn } = useResizeLog()
  const columns: ColumnsType<RecordType> = [
    { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
    { title: 'Age', dataIndex: 'age', width: 80, resizable: true, minWidth: 60 },
    { title: 'Address', dataIndex: 'address', width: 200, resizable: true },
    { title: 'Email', dataIndex: 'email' },
  ]

  return () => (
    <div>
      <h3>Basic (uncontrolled)</h3>
      <Table columns={columns} data={data.slice(0, 5)} tableLayout="fixed" onResizeColumn={onResizeColumn} />
      <pre>{log.value.join('\n')}</pre>
    </div>
  )
})

const defaultWidths: Record<string, number> = { name: 150, age: 80, address: 200, email: 200 }

const Controlled = defineComponent(() => {
  const columns = ref<ColumnsType<RecordType>>([
    {
      title: 'Person',
      children: [
        { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
        { title: 'Age', dataIndex: 'age', width: 80, resizable: true },
      ],
    },
    {
      title: 'Contact',
      children: [
        { title: 'Address', dataIndex: 'address', width: 200, resizable: true },
        { title: 'Email', dataIndex: 'email', width: 200, resizable: true },
      ],
    },
  ])

  const onResizeColumn = (width: number, column: ColumnType<RecordType>) => {
    columns.value = columns.value.map(group => ({
      ...group,
      children: (group as any).children.map((child: ColumnType<RecordType>) =>
        child.dataIndex === column.dataIndex ? { ...child, width } : child),
    }))
  }

  return () => (
    <div>
      <h3>Grouped headers (controlled)</h3>
      <Table
        columns={columns.value}
        data={data.slice(0, 5)}
        tableLayout="fixed"
        onResizeColumn={onResizeColumn}
      />
      <button onClick={() => columns.value = columns.value.map(group => ({
        ...group,
        children: (group as any).children.map((child: ColumnType<RecordType>) =>
          ({ ...child, width: defaultWidths[child.dataIndex as string] })),
      }))}
      >
        Reset widths
      </button>
    </div>
  )
})

const Fixed = defineComponent(() => {
  const { log, onResizeColumn } = useResizeLog()
  const columns: ColumnsType<RecordType> = [
    { title: 'Name', dataIndex: 'name', width: 150, fixed: 'start', resizable: true },
    { title: 'Age', dataIndex: 'age', width: 100, resizable: true },
    { title: 'Address', dataIndex: 'address', width: 300, resizable: true },
    { title: 'Email', dataIndex: 'email', width: 300, resizable: true },
    { title: 'Action', key: 'action', width: 100, fixed: 'end', render: () => <a>Edit</a> },
  ]

  return () => (
    <div>
      <h3>Fixed columns + sticky header</h3>
      <Table
        columns={columns}
        data={data.slice(0, 8)}
        scroll={{ x: 800, y: 200 }}
        sticky
        onResizeColumn={onResizeColumn}
      />
      <pre>{log.value.join('\n')}</pre>
    </div>
  )
})

const Rtl = defineComponent(() => {
  const columns: ColumnsType<RecordType> = [
    { title: 'Name', dataIndex: 'name', width: 150, resizable: true },
    { title: 'Age', dataIndex: 'age', width: 80, resizable: true },
    { title: 'Address', dataIndex: 'address', resizable: true },
  ]

  return () => (
    <div>
      <h3>RTL</h3>
      <div dir="rtl">
        <Table columns={columns} data={data.slice(0, 5)} direction="rtl" tableLayout="fixed" />
      </div>
    </div>
  )
})

const Virtual = defineComponent(() => {
  const { log, onResizeColumn } = useResizeLog()
  const columns: ColumnsType<RecordType> = [
    { title: 'Name', dataIndex: 'name', width: 150, fixed: 'start', resizable: true },
    { title: 'Age', dataIndex: 'age', width: 100, resizable: true },
    { title: 'Address', dataIndex: 'address', width: 300, resizable: true },
    { title: 'Email', dataIndex: 'email', width: 300, resizable: true },
  ]

  return () => (
    <div>
      <h3>VirtualTable</h3>
      <VirtualTable
        columns={columns}
        data={data}
        scroll={{ x: 900, y: 240 }}
        listItemHeight={32}
        onResizeColumn={onResizeColumn}
      />
      <pre>{log.value.join('\n')}</pre>
    </div>
  )
})

export default defineComponent(() => {
  return () => (
    <div>
      <h2>Resizable columns</h2>
      <Basic />
      <Controlled />
      <Fixed />
      <Rtl />
      <Virtual />
    </div>
  )
})
