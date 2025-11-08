import { defineComponent } from 'vue'
import Segmented from '../src'
import './assets/style.less'

export default defineComponent(
  () => {
    return () => {
      return (
        <div>
          <div class="wrapper">
            <Segmented
              options={['iOS', 'Android', 'Web']}
              defaultValue="Android"
              name="segmented1"
              onChange={value => console.log(value, typeof value)}
            />
          </div>
          <div class="wrapper">
            <Segmented
              vertical
              options={['iOS', 'Android', 'Web']}
              name="segmented2"
              onChange={value => console.log(value, typeof value)}
            />
          </div>
          <div class="wrapper">
            <Segmented
              options={[13333333333, 157110000, 12110086]}
              onChange={value => console.log(value, typeof value)}
            />
          </div>
          <div class="wrapper">
            <Segmented options={['iOS', 'Android', 'Web']} disabled />
          </div>
          <div class="wrapper">
            <Segmented
              options={[
                'iOS',
                { label: 'Android', value: 'Android', disabled: true },
                'Web',
              ]}
            />
          </div>
        </div>
      )
    }
  },
)
