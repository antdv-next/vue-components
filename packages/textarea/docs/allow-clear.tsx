import { defineComponent, ref } from 'vue'
import Textarea from '../src_'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref('')

  const onChange = (e: Event) => {
    value.value = (e.target as HTMLTextAreaElement).value
  }

  return () => (
    <div>
      <Textarea prefixCls="vc-textarea" allowClear placeholder="uncontrolled" />
      <br />
      <br />
      <Textarea
        prefixCls="vc-textarea"
        allowClear={{ clearIcon: '✖' }}
        value={value.value}
        onChange={onChange}
        placeholder="controlled"
      />
    </div>
  )
})
