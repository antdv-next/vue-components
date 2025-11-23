import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const disabled = ref(false)
  const readOnly = ref(false)
  const keyboard = ref(true)
  const wheel = ref(true)
  const stringMode = ref(false)
  const value = ref<string | number>(93)

  const onChange = (val: any) => {
    console.warn('onChange:', val, typeof val)
    value.value = val
  }

  return () => (
    <div style={{ margin: '10px' }}>
      <h3>Controlled</h3>
      <InputNumber
        mode="spinner"
        aria-label="Simple number input example"
        min={-8}
        max={10}
        style={{ width: '100px' }}
        value={value.value}
        onChange={onChange}
        readOnly={readOnly.value}
        disabled={disabled.value}
        keyboard={keyboard.value}
        changeOnWheel={wheel.value}
        stringMode={stringMode.value}
      />
      <p>
        <button type="button" onClick={() => disabled.value = !disabled.value}>
          toggle Disabled ({String(disabled.value)})
        </button>
        <button type="button" onClick={() => readOnly.value = !readOnly.value}>
          toggle readOnly ({String(readOnly.value)})
        </button>
        <button type="button" onClick={() => keyboard.value = !keyboard.value}>
          toggle keyboard ({String(keyboard.value)})
        </button>
        <button type="button" onClick={() => stringMode.value = !stringMode.value}>
          toggle stringMode ({String(stringMode.value)})
        </button>
        <button type="button" onClick={() => wheel.value = !wheel.value}>
          toggle wheel ({String(wheel.value)})
        </button>
      </p>

      <hr />
      <h3>Uncontrolled</h3>
      <InputNumber
        mode="spinner"
        style={{ width: '100px' }}
        onChange={onChange}
        min={-99}
        max={99}
        defaultValue={33}
      />

      <hr />
      <h3>!changeOnBlur</h3>
      <InputNumber
        mode="spinner"
        style={{ width: '100px' }}
        min={-9}
        max={9}
        defaultValue={10}
        onChange={onChange}
        changeOnBlur={false}
      />
    </div>
  )
})
