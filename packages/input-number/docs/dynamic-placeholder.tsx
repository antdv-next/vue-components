import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const placeholder = ref('place')
  const onChange = (val: any) => {
    console.warn('onChange:', val, typeof val)
  }
  const handleChange = () => {
    placeholder.value = placeholder.value === 'place' ? 'holder' : 'place'
  }

  return () => (
    <div style={{ margin: '10px' }}>
      <h3>Controlled</h3>
      <InputNumber
        placeholder={placeholder.value}
        style={{ width: '100px' }}
        onChange={onChange}
      />
      <p>
        <button type="button" onClick={handleChange}>
          toggle
        </button>
      </p>
    </div>
  )
})
