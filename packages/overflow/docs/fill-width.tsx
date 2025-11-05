import type { CSSProperties } from 'vue'
import { defineComponent, onMounted, ref, watch } from 'vue'
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

const inputStyle: CSSProperties = {
  border: 'none',
  fontSize: '12px',
  margin: 0,
  outline: 'none',
  lineHeight: '20px',
  fontFamily: '-apple-system',
  padding: '0 4px',
}

const options = [0, 1, 2, 3, 5, 10, 20, 200]

export default defineComponent(() => {
  const responsive = ref(true)
  const inputValue = ref('')
  const inputWidth = ref(0)
  const data = ref<ItemType[]>(createData(1))

  const inputRef = ref<HTMLInputElement>()
  const measureRef = ref<HTMLDivElement>()

  watch(inputValue, () => {
    inputWidth.value = measureRef.value?.offsetWidth ?? 0
  })

  onMounted(() => {
    inputRef.value?.focus()
  })

  const suffixNode = () => (
    <div style={{ position: 'relative', maxWidth: '100%' }}>
      <input
        ref={inputRef}
        value={inputValue.value}
        onInput={(event) => {
          inputValue.value = (event.target as HTMLInputElement).value
        }}
        style={{
          ...inputStyle,
          background: 'rgba(0, 0, 0, 0.1)',
          minWidth: '10px',
          maxWidth: '100%',
          width: `${inputWidth.value}px`,
        }}
      />
      <div
        ref={measureRef}
        style={{
          ...inputStyle,
          pointerEvents: 'none',
          position: 'absolute',
          left: 0,
          top: '200%',
          whiteSpace: 'pre',
        }}
      >
        {inputValue.value}
      </div>
    </div>
  )

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
          renderItem={(item: ItemType) => <div style={commonStyle}>{item.label}</div>}
          renderRest={(items: ItemType[]) => (
            <div style={commonStyle}>
              +
              {items.length}
              ...
            </div>
          )}
          suffix={suffixNode()}
        />
      </div>
    </div>
  )
})
