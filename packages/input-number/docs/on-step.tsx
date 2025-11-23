import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const emitter = ref('interface buttons (up)')
  const value = ref<string | number>(0)

  const onChange = (val: any) => {
    console.warn('onChange:', val, typeof val)
    value.value = val
  }

  const onStep = (_: number, info: { offset: number, type: 'up' | 'down', emitter: 'handler' | 'keyboard' | 'wheel' }) => {
    if (info.emitter === 'handler') {
      emitter.value = `interface buttons (${info.type})`
    }
    if (info.emitter === 'keyboard') {
      emitter.value = `keyboard (${info.type})`
    }
    if (info.emitter === 'wheel') {
      emitter.value = `mouse wheel (${info.type})`
    }
  }

  return () => (
    <div style={{ margin: '10px' }}>
      <h3>onStep callback</h3>
      <InputNumber
        aria-label="onStep callback example"
        min={0}
        max={10}
        style={{ width: '100px' }}
        value={value.value}
        changeOnWheel
        onChange={onChange}
        onStep={onStep}
      />

      <div style={{ marginTop: '10px' }}>Triggered by: {emitter.value}</div>
    </div>
  )
})
