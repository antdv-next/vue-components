import type { InputNumberRef } from '../src/InputNumber'
import { defineComponent, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const inputRef = ref<InputNumberRef | null>(null)

  return () => (
    <div style={{ margin: '10px' }}>
      <InputNumber aria-label="focus example" value={10} style={{ width: '100px' }} ref={inputRef} />
      <div style={{ marginTop: '10px' }}>
        <button type="button" onClick={() => inputRef.value?.focus({ cursor: 'start' })}>
          focus at start
        </button>
        <button type="button" onClick={() => inputRef.value?.focus({ cursor: 'end' })}>
          focus at end
        </button>
        <button type="button" onClick={() => inputRef.value?.focus({ cursor: 'all' })}>
          focus to select all
        </button>
        <button type="button" onClick={() => inputRef.value?.focus({ preventScroll: true })}>
          focus prevent scroll
        </button>
      </div>
    </div>
  )
})
