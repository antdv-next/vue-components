import { defineComponent } from 'vue'
import Mentions, { Option } from '../src'

export default defineComponent(() => {
  const validateSearch = (text: string) => {
    console.log('~~>', text)
    return text.length <= 3
  }

  return () => (
    <div>
      <h1>Customize Split Logic</h1>
      <p>Only validate string length less than 3</p>
      <Mentions
        style={{ width: '100%', fontSize: '50px' }}
        split=""
        validateSearch={validateSearch}
        autoFocus
      >
        <Option value="light">Light</Option>
        <Option value="bamboo">Bamboo</Option>
        <Option value="cat">Cat</Option>
      </Mentions>
    </div>
  )
})
