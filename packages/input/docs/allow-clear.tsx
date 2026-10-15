import { defineComponent, ref } from 'vue'
import Input from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref('')

  const handleChange = (e: Event) => {
    value.value = (e.target as HTMLInputElement).value
  }

  return () => (
    <div style={{ height: '100vh' }}>
      <Input prefixCls="vc-input" allowClear placeholder="uncontrolled" />
      <br />
      <br />
      <Input
        prefixCls="vc-input"
        allowClear={{ clearIcon: '✖' }}
        onChange={handleChange}
        value={value.value}
        placeholder="controlled"
      />
      <br />
      <br />
      <Input
        prefixCls="vc-input"
        allowClear={{ tabIndex: -1 }}
        placeholder="clear button skipped by Tab navigation"
      />
    </div>
  )
})
