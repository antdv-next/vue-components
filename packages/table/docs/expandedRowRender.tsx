import type { ColumnType, Key } from '../src'
import { computed, defineComponent, ref } from 'vue'
import Table from '../src'
import { useCheckbox } from './utils/useInput.ts'

interface RecordType {
  key: Key
  a: string
  b?: string
  c?: string
  d?: number
}

const tableData: RecordType[] = [
  { key: 0, a: '123' },
  { key: 1, a: 'cdd', b: 'edd' },
  { key: 2, a: '1333', c: 'eee', d: 2 },
]

for (let i = 0; i < 10; i += 1) {
  const str = `${i}`
  tableData.push({
    key: i * 10 + 99,
    a: str.repeat(3),
    b: str.repeat(5),
    c: str.repeat(7),
    d: i,
  })
}

export default defineComponent(() => {
  const data = ref<RecordType[]>(tableData)
  const expandedRowKeys = ref<Key[]>([])
  const [columnTitle, onColumnTitleChange] = useCheckbox(false)
  const [expandRowByClick, onExpandRowByClick] = useCheckbox(false)
  const [fixColumns, onFixColumns] = useCheckbox(false)
  const [scrollX, onScrollX] = useCheckbox(false)
  const [fixHeader, onFixHeader] = useCheckbox(false)
  const [expandIconPosition, onExpandIconPosition] = useCheckbox(false)
  const [fixExpand, onFixExpand] = useCheckbox(false)

  const remove = (index: number) => {
    const nextData = data.value.slice()
    nextData.splice(index, 1)
    data.value = nextData
  }

  const renderAction = (_o: any, _row: RecordType, index: number) => (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault()
        remove(index)
      }}
    >
      Delete
    </a>
  )

  const columns = computed<ColumnType<RecordType>[]>(() => {
    const next: ColumnType<RecordType>[] = [
      { title: 'title 1', dataIndex: 'a', key: 'a', width: 100 },
      { title: 'title 2', dataIndex: 'b', key: 'b', width: 100 },
      { title: 'title 3', dataIndex: 'c', key: 'c', width: 200 },
      { title: 'Operation', key: 'x', render: renderAction },
    ]

    if (fixColumns.value) {
      next.unshift({ title: 'fix left 2', dataIndex: 'a', width: 100, fixed: 'left' })
      next.unshift({ title: 'fix left 1', dataIndex: 'a', width: 100, fixed: true })
      next.push({ title: 'fix right', dataIndex: 'a', width: 100, fixed: 'right' })
    }

    if (fixExpand.value) {
      next.unshift({ title: 'test ', dataIndex: 'a', width: 200 })
      next.unshift({ title: 'test ', dataIndex: 'a', width: 200 })
      next.unshift({ title: 'test ', dataIndex: 'a', width: 200 })
      next.unshift({ title: 'test ', dataIndex: 'a', width: 200 })
    }

    return next
  })

  const onExpand = (expanded: boolean, record: RecordType) => {
    console.log('onExpand', expanded, record)
  }

  const onExpandedRowsChange = (rows: readonly Key[]) => {
    expandedRowKeys.value = [...rows]
  }

  const rowExpandable = (record: RecordType) => record.key !== 1

  return () => {
    const hasExpanded = expandedRowKeys.value.length > 0
    return (
      <div>
        {hasExpanded
          ? (
              <button type="button" onClick={() => { expandedRowKeys.value = [] }}>
                Close All
              </button>
            )
          : (
              <button type="button" onClick={() => { expandedRowKeys.value = [0, 1, 2] }}>
                Expand All
              </button>
            )}
        <label>
          <input type="checkbox" checked={columnTitle.value} onChange={onColumnTitleChange} />
          Expand Column Title
        </label>
        <label>
          <input type="checkbox" checked={expandRowByClick.value} onChange={onExpandRowByClick} />
          Expand Row by Click
        </label>
        <label>
          <input type="checkbox" checked={fixColumns.value} onChange={onFixColumns} />
          Fix Columns
        </label>
        <label>
          <input type="checkbox" checked={scrollX.value} onChange={onScrollX} />
          ScrollX
        </label>
        <label>
          <input type="checkbox" checked={fixHeader.value} onChange={onFixHeader} />
          Fix Header
        </label>
        <label>
          <input
            type="checkbox"
            checked={expandIconPosition.value}
            onChange={onExpandIconPosition}
          />
          Change Expand Icon Position
        </label>
        <label>
          <input type="checkbox" checked={fixExpand.value} onChange={onFixExpand} />
          Change Expand Icon Fixed
        </label>
        <Table<RecordType>
          columns={columns.value}
          expandable={{
            columnTitle: columnTitle.value ? <span>title</span> : '',
            expandRowByClick: expandRowByClick.value,
            expandedRowRender: (record, _index, _indent, expanded) =>
              expanded
                ? (
                    <p>
                      extra:
                      {record.a}
                    </p>
                  )
                : null,
            expandedRowKeys: expandedRowKeys.value,
            onExpandedRowsChange,
            onExpand,
            rowExpandable,
            ...(expandIconPosition.value ? { expandIconColumnIndex: 1 } : {}),
            fixed: fixExpand.value,
          }}
          scroll={{
            x: fixColumns.value || scrollX.value ? 2000 : undefined,
            y: fixHeader.value ? 300 : undefined,
          }}
          data={data.value}
        />
      </div>
    )
  }
})
