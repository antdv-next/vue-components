import { defineComponent } from 'vue'
import Table from '../src'

function CellExample(props: { data: { index: number }, count: string }) {
  console.log(`rerender ${Date.now()}`)
  return <>{`${props.count} ${props.data.index}`}</>
}

const dataSource = Array.from({ length: 100 }, (_, index) => ({ index, key: index }))

export default defineComponent(() => {
  const columns = [
    {
      title: 'Grouped by 10',
      onCell: (_record: any, index: number) => ({ rowSpan: index % 10 === 0 ? 10 : 0 }),
      render: (_: any, record: { index: number }) => (
        <span>
          {record.index}
          -
          {record.index + 10}
        </span>
      ),
    },
    {
      title: 'one',
      render: (_: any, record: { index: number }) => <CellExample count="one" data={record} />,
    },
    {
      title: 'two',
      render: (_: any, record: { index: number }) => <CellExample count="two" data={record} />,
    },
    {
      title: 'three',
      render: (_: any, record: { index: number }) => <CellExample count="three" data={record} />,
    },
    {
      title: 'four',
      render: (_: any, record: { index: number }) => <CellExample count="four" data={record} />,
    },
  ]

  return () => <Table tableLayout="fixed" data={dataSource} columns={columns} />
})
