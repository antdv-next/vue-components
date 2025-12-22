import { computed, defineComponent, ref } from 'vue'
import Mentions from '../src'

const OPTIONS: Record<string, string[]> = {
  '@': ['light', 'bamboo', 'cat'],
  '#': ['123', '456', '7890'],
}

export default defineComponent(() => {
  const prefix = ref('@')

  const onSearch = (_text: string, nextPrefix: string) => {
    prefix.value = nextPrefix
  }

  const options = computed(() => {
    return (OPTIONS[prefix.value] || []).map(value => ({
      value,
      key: value,
      label: value,
    }))
  })

  return () => (
    <div>
      @ for string, # for number
      <Mentions
        prefix={['@', '#']}
        onSearch={onSearch}
        style={{ width: '100%', fontSize: '50px' }}
        autoFocus
        options={options.value}
      />
    </div>
  )
})
