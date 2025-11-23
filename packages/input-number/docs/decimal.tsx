import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const disabled = ref(false)
  const readOnly = ref(false)
  const value = ref<number | string>(99)

  return () => (
    <div style={{ margin: '10px' }}>
      <p>Value Range is [-8, 10], initialValue is out of range.</p>
      <InputNumber
        aria-label="Number input example that demonstrates using decimal values"
        min={-8}
        max={10}
        step={0.1}
        value={value.value}
        style={{ width: '100px' }}
        readOnly={readOnly.value}
        onChange={(v) => {
          console.log('onChange:', v)
          value.value = v as any
        }}
        disabled={disabled.value}
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
