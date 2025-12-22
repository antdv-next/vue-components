import { defineComponent, ref } from 'vue'
import Mentions, { useUnstableContextProvider } from '../src'

const options = [
  {
    value: 'light',
    label: 'Light',
  },
  {
    value: 'bamboo',
    label: 'Bamboo',
  },
  {
    value: 'cat',
    label: 'Cat',
  },
]

export default defineComponent(() => {
  const open = ref(true)
  useUnstableContextProvider({ open })
  const MentionsAny = Mentions as any

  return () => (
    <MentionsAny
      rows={3}
      defaultValue="Hello @ World @"
      onScroll={(event: Event) => {
        console.log(event)
      }}
      options={options}
    />
  )
})
