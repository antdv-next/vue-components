import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const stringMode = ref(false)
  const value = ref<number | string>(0.000000001)

  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber
        aria-label="Number input example of very small increments"
        min={-10}
        max={10}
        step={stringMode.value ? '0.000000001' : 0.000000001}
        value={value.value}
        style={{ width: '200px' }}
        onChange={(newValue) => {
          console.log('onChange:', newValue)
          value.value = newValue as any
        }}
        stringMode={stringMode.value}
      />

      <label>
        <input
          type="checkbox"
          checked={stringMode.value}
          onChange={() => {
            stringMode.value = !stringMode.value
          }}
        />
        String Mode
      </label>
    </div>
  )
})
