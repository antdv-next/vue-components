import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const disabled = ref(false)
  const readOnly = ref(false)
  const value = ref<number | string>(5)

  const upHandler = <div style={{ color: 'blue' }}>x</div>
  const downHandler = <div style={{ color: 'red' }}>V</div>

  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber
        aria-label="Number input example that demonstrates custom styling"
        min={-8}
        max={10}
        value={value.value}
        style={{ width: '100px' }}
        readOnly={readOnly.value}
        onChange={(val) => {
          console.log('onChange:', val)
          value.value = val as any
        }}
        disabled={disabled.value}
        v-slots={{ upHandler: () => upHandler, downHandler: () => downHandler }}
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
