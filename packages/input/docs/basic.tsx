import { defineComponent } from 'vue'
import Input from '../src'

export default defineComponent(() => {
  return () => (
    <Input prefixCls="vc-input" style={{ marginLeft: '200px' }} />
  )
})
