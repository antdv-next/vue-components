import { defineComponent } from 'vue'
import Textarea from '../src_'
import './assets/index.less'

export default defineComponent(() => {
  return () => (
    <div style={{ width: '300px' }}>
      <Textarea prefixCls="vc-textarea" defaultValue="Autosize height based on content lines." autoSize />
      <Textarea
        prefixCls="vc-textarea"
        defaultValue="Autosize height with minimum and maximum number of lines."
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    </div>
  )
})
