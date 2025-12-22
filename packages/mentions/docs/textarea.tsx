import { defineComponent } from 'vue'
import Mentions from '../src'
import './textarea.less'

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
  return () => (
    <div>
      <Mentions
        placeholder="disabled"
        disabled
        options={options}
      />

      <Mentions
        placeholder="readonly"
        readOnly
        options={options}
      />

      <div style={{ paddingTop: '100px' }}>
        <Mentions
          placeholder="Support AutoSize"
          autoSize
          transitionName="motion-zoom"
          options={options}
        />
      </div>

      <div style={{ paddingTop: '100px' }}>
        <Mentions
          placeholder="placement: top"
          placement="top"
          transitionName="motion-zoom"
          options={options}
        />
      </div>

      <div style={{ padding: '100px 0', width: '200px', direction: 'rtl' }}>
        <Mentions
          placeholder="direction: rtl"
          direction="rtl"
          transitionName="motion-zoom"
          options={options}
        />
      </div>
    </div>
  )
})
