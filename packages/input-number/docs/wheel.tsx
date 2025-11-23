import { defineComponent } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber
        style={{ width: '100px' }}
        defaultValue={10}
        changeOnBlur={false}
        changeOnWheel
      />
    </div>
  )
})
