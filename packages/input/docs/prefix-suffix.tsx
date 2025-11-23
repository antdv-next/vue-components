import { defineComponent } from 'vue'
import Input from '../src'

export default defineComponent(() => {
  return () => (
    <div>
      <Input prefixCls="vc-input" prefix="prefix" />
      <br />
      <br />
      <Input prefixCls="vc-input" suffix="suffix" />
    </div>
  )
})
