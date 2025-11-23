import { defineComponent, ref } from 'vue'
import Input from '../src'

export default defineComponent(() => {
  const value = ref('')

  const handleChange = (e: Event) => {
    value.value = (e.target as HTMLInputElement).value
  }

  return () => (
    <div>
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
    </div>
  )
})
