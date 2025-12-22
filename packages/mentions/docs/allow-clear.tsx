import { defineComponent, ref } from 'vue'
import Mentions from '../src'

export default defineComponent(() => {
  const value = ref('hello world')

  return () => (
    <div>
      <p>Uncontrolled</p>
      <Mentions allowClear />
      <p>Controlled</p>
      <Mentions
        value={value.value}
        onChange={(nextValue) => {
          value.value = nextValue
        }}
        allowClear
      />
    </div>
  )
})
