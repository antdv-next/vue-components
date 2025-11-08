import { defineComponent } from 'vue'
import Segmented from '../src'
import './assets/index.less'

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
        </div>
      )
    }
  },
)
