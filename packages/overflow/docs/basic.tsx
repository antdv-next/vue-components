import { defineComponent, ref } from 'vue'
import Overflow from '../src'
import './assets/index.less'
import './assets/common.less'

interface ItemType {
  value: string | number
  label: string
}

function createData(count: number): ItemType[] {
  const data: ItemType[] = Array.from({ length: count }, (_, index) => ({
    value: index,
    label: `Label ${index}`,
  }))

  return data
}

function renderItem(item: ItemType) {
  return (
    <div
      style={{
        margin: '0 16px 0 8px',
        padding: '4px 8px',
        background: 'rgba(255, 0, 0, 0.2)',
      }}
    >
      {item.label}
    </div>
  )
}

function renderRest(items: ItemType[]) {
  return (
    <div
      style={{
        margin: '0 16px 0 8px',
        padding: '4px 8px',
        background: 'rgba(255, 0, 0, 0.2)',
      }}
    >
      +
      {items.length}
      ...
    </div>
  )
}

export default defineComponent(() => {
  const responsive = ref(true)
  const data = ref<ItemType[]>(createData(1))
  const showPrefix = ref(true)
  const showSuffix = ref(true)

  return () => (
    <div style={{ padding: '32px' }}>
      <button
        type="button"
        onClick={() => {
          responsive.value = !responsive.value
        }}
      >
        {responsive.value ? 'Responsive' : 'MaxCount: 6'}
      </button>

      <button
        type="button"
        onClick={() => {
          showPrefix.value = !showPrefix.value
        }}
        style={{ marginLeft: '8px' }}
      >
        {showPrefix.value ? 'Hide Prefix' : 'Show Prefix'}
      </button>

      <button
        type="button"
        onClick={() => {
          showSuffix.value = !showSuffix.value
        }}
        style={{ marginLeft: '8px' }}
      >
        {showSuffix.value ? 'Hide Suffix' : 'Show Suffix'}
      </button>

      <select
        style={{ width: '200px', height: '32px' }}
        value={data.value.length}
        onChange={(event) => {
          data.value = createData(Number((event.target as HTMLSelectElement).value))
        }}
      >
        <option value={0}>0</option>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={200}>200</option>
      </select>

      <button
        onClick={() => {
          data.value = createData(data.value.length ? 0 : 1)
        }}
      >
        Trigger
      </button>

      <div
        style={{
          border: '5px solid green',
          padding: '8px',
          maxWidth: '300px',
          // width: '120px',
          marginTop: '32px',
        }}
      >
        <Overflow
          data={data.value}
          renderItem={renderItem}
          renderRest={renderRest}
          maxCount={responsive.value ? 'responsive' : 6}
          prefix={showPrefix.value
            ? (
                <div
                  style={{
                    margin: '0 8px 0 0',
                    padding: '4px 8px',
                    background: 'rgba(0, 255, 0, 0.3)',
                    border: '1px solid green',
                  }}
                >
                  前缀:
                </div>
              )
            : undefined}
          suffix={showSuffix.value
            ? (
                <div
                  style={{
                    margin: '0 0 0 8px',
                    padding: '4px 8px',
                    background: 'rgba(0, 0, 255, 0.3)',
                    border: '1px solid blue',
                  }}
                >
                  后缀
                </div>
              )
            : undefined}
        />
      </div>
    </div>
  )
})
