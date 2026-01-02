import { defineComponent } from 'vue'
import Table from '../src'

const onRowClick = (record: any, index: number, event: MouseEvent) => {
  console.log(`Click nth(${index}) row of parent, record.name: ${record.name}`)
  if (event.shiftKey) {
    console.log('Shift + mouse click triggered.')
  }
}

const onRowDoubleClick = (record: any, index: number) => {
  console.log(`Double click nth(${index}) row of parent, record.name: ${record.name}`)
}

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 400,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 100,
    render: (text: string) => <span>{text} (Trigger Cell Click)</span>,
    onCell: (record: any, index: number) => ({
      onClick(event: MouseEvent) {
        console.log('Click cell', ` row ${index}`, record, (event.target as HTMLElement))
      },
    }),
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width: 200,
  },
]

const data = [
  {
    key: 1,
    name: 'a',
    age: 32,
    address: 'I am a',
    children: [
      {
        key: 11,
        name: 'aa',
        age: 33,
        address: 'I am aa',
      },
      {
        key: 12,
        name: 'ab',
        age: 33,
        address: 'I am ab',
        children: [
          {
            key: 121,
            name: 'aba',
            age: 33,
            address: 'I am aba',
          },
        ],
      },
      {
        key: 13,
        name: 'ac',
        age: 33,
        address: 'I am ac',
        children: [
          {
            key: 131,
            name: 'aca',
            age: 33,
            address: 'I am aca',
            children: [
              {
                key: 1311,
                name: 'acaa',
                age: 33,
                address: 'I am acaa',
              },
              {
                key: 1312,
                name: 'acab',
                age: 33,
                address: 'I am acab',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 2,
    name: 'b',
    age: 32,
    address: 'I am b',
  },
]

export default defineComponent(() => {
  return () => (
    <Table
      columns={columns}
      data={data}
      onRow={(record, index) => ({
        onClick: onRowClick.bind(null, record, index),
        onDblclick: onRowDoubleClick.bind(null, record, index),
      })}
    />
  )
})
