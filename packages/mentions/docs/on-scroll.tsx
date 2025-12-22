import { defineComponent, ref } from 'vue'
import Mentions, { useUnstableContextProvider } from '../src'
import './onScroll.less'

export default defineComponent(() => {
  const open = ref(true)
  useUnstableContextProvider({ open })

  const options = Array.from({ length: 1000 }).map((_, index) => ({
    value: `item-${index}`,
    label: `item-${index}`,
  }))

  return () => (
    <Mentions
      rows={3}
      defaultValue="Hello @ World @"
      onPopupScroll={(event) => {
        console.log(event)
      }}
      popupClassName="on-scroll"
      options={options}
    />
  )
})
