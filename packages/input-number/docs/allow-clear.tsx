import { defineComponent } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  return () => (
    <div style={{ display: 'flex', gap: '12px', margin: '10px' }}>
      <InputNumber allowClear defaultValue={100} onClear={() => console.log('clear')} />
      <InputNumber allowClear={{ clearIcon: '⌫', label: 'Clear amount' }} defaultValue={0} />
      <InputNumber allowClear={{ disabled: true }} defaultValue={100} />
      <InputNumber suffix="RMB" allowClear defaultValue={100} />
    </div>
  )
})
