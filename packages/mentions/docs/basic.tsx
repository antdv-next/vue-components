import { defineComponent } from 'vue'
import Mentions from '../src'

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
  const onSelect = (option: any, prefix: string) => {
    console.log('Select:', prefix, '-', option.value)
  }

  const onFocus = () => {
    console.log('onFocus')
  }

  const onBlur = () => {
    console.log('onBlur')
  }

  return () => (
    <Mentions
      autoFocus
      rows={3}
      defaultValue="Hello World"
      onSelect={onSelect}
      onFocus={onFocus}
      onBlur={onBlur}
      options={options}
    />
  )
})
