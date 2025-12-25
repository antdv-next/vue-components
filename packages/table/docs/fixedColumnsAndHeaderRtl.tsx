import type { ColumnsType } from '../src'
import { computed, defineComponent } from 'vue'
import Table from '../src'
import { useCheckbox } from './utils/useInput.ts'

interface RecordType {
  a: string
  b?: string
  c: string
  d: number
  key: string
}

const originData: RecordType[] = [
  { a: 'aaa', b: 'bbb', c: '内容内容内容内容内容', d: 3, key: '1' },
  { a: 'aaa', b: 'bbb', c: '内容内容内容内容内容', d: 3, key: '2' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '3' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '4' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '5' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '6' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '7' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '8' },
  { a: 'aaa', c: '内容内容内容内容内容', d: 2, key: '9' },
]

const longTextData: RecordType[] = [...originData]
longTextData[0] = {
  ...longTextData[0],
  a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
}

export default defineComponent(() => {
  const [autoWidth, onAutoWidth] = useCheckbox(false)
  const [isRtl, onIsRtl] = useCheckbox(true)
  const [longText, onLongText] = useCheckbox(false)
  const [fixHeader, onFixHeader] = useCheckbox(true)
  const [fixLeft, onFixLeft] = useCheckbox(true)
  const [fixRight, onFixRight] = useCheckbox(true)
  const [fixTitle3, onFixTitle3] = useCheckbox(false)
  const [ellipsis, onEllipsis] = useCheckbox(false)
  const [percentage, onPercentage] = useCheckbox(false)
  const [empty, onEmpty] = useCheckbox(false)

  const columns = computed<ColumnsType<RecordType>>(() => [
    {
      title: 'title1',
      dataIndex: 'a',
      key: 'a',
      width: percentage.value ? '10%' : 80,
      fixed: fixLeft.value ? 'left' : undefined,
      ellipsis: ellipsis.value,
    },
    {
      title: 'title2',
      dataIndex: 'b',
      key: 'b',
      width: 80,
      fixed: fixLeft.value ? 'left' : undefined,
    },
    {
      title: 'title3',
      fixed: fixLeft.value && fixTitle3.value ? 'left' : undefined,
      children: [
        { title: 'title4', dataIndex: 'c', key: 'd', width: 100 },
        { title: 'title5', dataIndex: 'c', key: 'e', width: 100 },
      ],
    },
    { title: 'title6', dataIndex: 'c', key: 'f' },
    { title: 'title7', dataIndex: 'c', key: 'g' },
    { title: 'title8', dataIndex: 'c', key: 'h' },
    { title: 'title9', dataIndex: 'b', key: 'i' },
    { title: 'title10', dataIndex: 'b', key: 'j' },
    {
      title: 'title11',
      dataIndex: 'b',
      key: 'k',
      width: 100,
      fixed: fixRight.value ? 'right' : undefined,
    },
    {
      title: 'title12',
      dataIndex: 'b',
      key: 'l',
      width: 80,
      fixed: fixRight.value ? 'right' : undefined,
    },
  ])

  const mergedData = computed<RecordType[]>(() => {
    if (empty.value) {
      return []
    }
    if (longText.value) {
      return longTextData
    }
    return originData
  })

  return () => (
    <div>
      <h2>Fixed columns and header in RTL direction</h2>

      <label>
        <input type="checkbox" checked={isRtl.value} onChange={onIsRtl} />
        IsRtl
      </label>
      <label>
        <input type="checkbox" checked={autoWidth.value} onChange={onAutoWidth} />
        Auto Width
      </label>
      <label>
        <input type="checkbox" checked={longText.value} onChange={onLongText} />
        Long Text
      </label>
      <label>
        <input type="checkbox" checked={fixHeader.value} onChange={onFixHeader} />
        Fix Header
      </label>
      <label>
        <input type="checkbox" checked={fixLeft.value} onChange={onFixLeft} />
        Fix Left
      </label>
      <label>
        <input type="checkbox" checked={fixTitle3.value} onChange={onFixTitle3} />
        Fix title3
      </label>
      <label>
        <input type="checkbox" checked={fixRight.value} onChange={onFixRight} />
        Fix Right
      </label>
      <label>
        <input type="checkbox" checked={ellipsis.value} onChange={onEllipsis} />
        Ellipsis First Column
      </label>
      <label>
        <input type="checkbox" checked={percentage.value} onChange={onPercentage} />
        Percentage Width
      </label>
      <label>
        <input type="checkbox" checked={empty.value} onChange={onEmpty} />
        Empty
      </label>

      <Table<RecordType>
        columns={columns.value}
        scroll={{ x: 1650, y: fixHeader.value ? 300 : undefined }}
        data={mergedData.value}
        style={{ width: autoWidth.value ? undefined : '800px' }}
        direction={isRtl.value ? 'rtl' : 'ltr'}
      />
    </div>
  )
})
