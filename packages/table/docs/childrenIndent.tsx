import type { RenderExpandIconProps, TableProps } from '../src'
import { defineComponent } from 'vue'
import Table from '../src'

interface RecordType {
  key: string | number
  name: string
  age: number
  address: string
  children?: RecordType[]
  operation?: string
}

function CustomExpandIcon(props: RenderExpandIconProps<RecordType>) {
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

const columns: TableProps<RecordType>['columns'] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 400,
    shouldCellUpdate: () => false,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
    width: 100,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width: 200,
  },
  {
    title: 'Operations',
    dataIndex: 'operation',
    key: 'x',
    width: 150,
  },
]

const data: RecordType[] = [
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
  const onExpand = (expanded: boolean, record: RecordType) => {
    console.log('onExpand', expanded, record)
  }

  return () => (
    <Table<RecordType>
      defaultExpandAllRows
      columns={columns}
      data={data}
      indentSize={30}
      onExpand={onExpand}
      onExpandedRowsChange={keys => console.log('Expanded Keys:', keys)}
      expandIcon={CustomExpandIcon}
    />
  )
})
