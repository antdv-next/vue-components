import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import InputNumber from '../src'
import './assets/index.less'

export default defineComponent(() => {
  const value = ref<number | string>(5)

  onMounted(() => {
    const keyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey === true || event.metaKey) && event.keyCode === 90) {
        value.value = 3
      }
    }
    document.addEventListener('keydown', keyDown)
    onUnmounted(() => document.removeEventListener('keydown', keyDown))
  })

  return () => (
    <>
      <InputNumber
        style={{ width: '100px' }}
        onChange={(nextValue) => {
          console.log('Change:', nextValue)
          value.value = nextValue as any
        }}
        value={value.value}
      />
      {value.value as any}
      <button
        onClick={() => {
          value.value = 99
        }}
      >
        Change
      </button>
    </>
  )
})
