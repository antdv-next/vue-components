import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref(5)
  const min = ref(0)
  const max = ref(10)
  const onChange = (val: any) => {
    console.warn('onChange:', val, typeof val)
    value.value = val
  }
  const handleChangeMinMax = () => {
    min.value = 5;
    max.value = 6;
  }

  return () => (
    <div style={{ margin: '10px' }}>
      <h3>Controlled</h3>
      <InputNumber
        aria-label="Simple number input example"
        min={min.value}
        max={max.value}
        style={{ width: '100px' }}
        value={value.value}
        onChange={onChange}
      />
      <p>
        <button type="button" onClick={handleChangeMinMax}>
          toggle
        </button>
      </p>
    </div>
  )
})
