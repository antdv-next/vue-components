import { defineComponent } from 'vue'
import Input from '../src'

export default defineComponent(() => {
  return () => (
    <div>
      <Input prefixCls="vc-input" addonBefore="https://" />
      <br />
      <br />
      <Input prefixCls="vc-input" addonAfter="MB" />
    </div>
  )
})
