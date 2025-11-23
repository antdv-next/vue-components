import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

const formatWithCommas = (num: number | string) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export default defineComponent(() => {
  const disabled = ref(false)
  const readOnly = ref(false)
  const value = ref<number | string>(50000)

  const format = (num: number | string) => `$ ${formatWithCommas(num)} boeing737`

  const parser = (num: string) => {
    const cells = num.toString().split(' ')
    if (!cells[1]) {
      return num
    }
    const parsed = cells[1].replace(/,*/g, '')
    return parsed
  }

  return () => (
    <div style={{ margin: '10px' }}>
      <p>
        When number is validate in range, keep formatting. Else will flush when blur.
      </p>

      <InputNumber
        aria-label="Number input example that demonstrates combination key format"
        min={-8000}
        max={10000000}
        value={value.value}
        style={{ width: '200px' }}
        readOnly={readOnly.value}
        onChange={(val) => {
          console.log('onChange:', val)
          value.value = val as any
        }}
        disabled={disabled.value}
        autoFocus={false}
        step={100}
        formatter={format}
        parser={parser}
      />
      <p>
        <button type="button" onClick={() => disabled.value = !disabled.value}>
          toggle Disabled
        </button>
        <button type="button" onClick={() => readOnly.value = !readOnly.value}>
          toggle readOnly
        </button>
      </p>
    </div>
  )
})
