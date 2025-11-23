import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import type { ValueType } from '../src/InputNumber'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref<ValueType>('aaa')
  const lock = ref(false)

  return () => (
    <div>
      <InputNumber<ValueType>
        value={value.value}
        max={999}
        onChange={(newValue) => {
          console.log('Change:', newValue)
        }}
        onInput={(text) => {
          console.log('Input:', text)
          if (!lock.value) {
            value.value = text
          }
        }}
      />

      <button onClick={() => lock.value = !lock.value}>Lock Value ({String(lock.value)})</button>
      <button onClick={() => value.value = '93'}>Change Value</button>
    </div>
  )
})
