import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref<number | string | null>(null)
  const precision = ref<string>('2')
  const decimalSeparator = ref<string>(',')

  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber
        aria-label="Number input example to demonstration custom precision value"
        style={{ width: '100px' }}
        value={value.value as any}
        onChange={(newValue) => {
          console.log('onChange:', newValue)
          value.value = newValue as any
        }}
        precision={Number(precision.value)}
        decimalSeparator={decimalSeparator.value}
      />
      <div style={{ marginTop: '32px' }}>
        <label>
          precision:
          <input type="number" onChange={e => precision.value = (e.target as HTMLInputElement).value} value={precision.value} />
        </label>
        <label>
          decimalSeparator:
          <input value={decimalSeparator.value} onChange={e => decimalSeparator.value = (e.target as HTMLInputElement).value} />
        </label>
      </div>
    </div>
  )
})
