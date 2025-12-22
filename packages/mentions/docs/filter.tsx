import { defineComponent } from 'vue'
import Mentions from '../src'

const options = [
  {
    value: 'light',
    key: '1128',
    label: 'Light (ID: 1128)',
  },
  {
    value: 'bamboo',
    key: '903',
    label: 'Bamboo (ID: 903)',
  },
  {
    value: 'light',
    key: '1706',
    label: 'Cat (ID: 1706)',
  },
]

export default defineComponent(() => {
  const filterOption = (input: string, { key }: { key?: string }) => {
    return (key || '').includes(input)
  }

  return () => (
    <Mentions
      style={{ width: '100%', fontSize: '30px' }}
      filterOption={filterOption}
      autoFocus
      options={options}
    />
  )
})
