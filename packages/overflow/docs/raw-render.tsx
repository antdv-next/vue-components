import type { CSSProperties } from 'vue'
import { defineComponent, ref } from 'vue'
import Overflow from '../src'

interface ItemType {
  value: number
  label: string
}

function createData(count: number): ItemType[] {
  return Array.from({ length: count }, (_, index) => ({
    value: index,
    label: `Label ${index}`,
  }))
}

const commonStyle: CSSProperties = {
  margin: '0 16px 0 8px',
  padding: '4px 8px',
  background: 'rgba(255, 0, 0, 0.2)',
}

const options = [0, 1, 2, 3, 5, 10, 20, 200]

export default defineComponent(() => {
  const responsive = ref(true)
  const data = ref<ItemType[]>(createData(1))

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

      <select
        style={{ width: '200px', height: '32px', marginLeft: '8px' }}
        value={String(data.value.length)}
        onChange={(event) => {
          const next = Number((event.target as HTMLSelectElement).value)
          data.value = createData(next)
        }}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div
        style={{
          border: '5px solid green',
          padding: '8px',
          maxWidth: '300px',
          marginTop: '32px',
        }}
      >
        <Overflow
          data={data.value}
          maxCount={responsive.value ? 'responsive' : 6}
          renderRawItem={(item: ItemType) => (
            <Overflow.Item component="span">
              <div style={commonStyle}>{item.label}</div>
            </Overflow.Item>
          )}
          renderRest={(items: ItemType[]) => (
            <div style={commonStyle}>
              +
              {items.length}
              ...
            </div>
          )}
        />
      </div>
    </div>
  )
})
