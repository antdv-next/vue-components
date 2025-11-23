import { defineComponent } from 'vue'
import Input from '../src'
import './assets/index.less'

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
