import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref<number | string>(100)

  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber
        style={{ width: '200px' }}
        value={value.value}
        onChange={(val) => {
          console.log('onChange:', val, typeof val)
          value.value = val as any
        }}
        prefix="¥"
        suffix="RMB"
      />
    </div>
  )
})
