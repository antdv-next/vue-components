import type { ColumnType } from '../src'
import { defineComponent } from 'vue'
import Table, { Summary, SummaryCell, SummaryRow } from '../src'

interface RecordType {
  a: string
  b?: string
  c?: string
  d: number
  key: string
}

const columns: ColumnType<RecordType>[] = [
  { title: 'title1', dataIndex: 'a', key: 'a' },
  { title: 'title2', dataIndex: 'b', key: 'b' },
  { title: 'title3', dataIndex: 'c', key: 'c' },
  { title: 'title4', dataIndex: 'd', key: 'd' },
]

const data: RecordType[] = [
  { a: 'cdd', b: 'edd12221', d: 3, key: '2' },
  { a: '133', c: 'edd12221', d: 2, key: '3' },
  { a: '133', c: 'edd12221', d: 2, key: '4' },
]

export default defineComponent(() => {
  return () => (
    <div style={{ width: '800px' }}>
      <Table
        columns={columns}
        data={data}
        summary={() => (
          <Summary>
            <SummaryRow
              onClick={(event) => {
                event.stopPropagation()
                alert('click summary row will trigger the click event')
              }}
            >
              <SummaryCell index={0} />
              <SummaryCell index={1}>Summary</SummaryCell>
              <SummaryCell index={3}>Content</SummaryCell>
              <SummaryCell index={11}>Right</SummaryCell>
            </SummaryRow>
          </Summary>
        )}
      />
    </div>
  )
})
