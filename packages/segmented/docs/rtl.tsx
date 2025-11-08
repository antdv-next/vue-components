import { defineComponent, ref } from 'vue'
import Segmented from '../src'
import './assets/style.less'

export default defineComponent(
  () => {
    const direction = ref<'rtl' | 'ltr'>('rtl')

    return () => {
      return (
        <div class="wrapper">
          <button
            onClick={() => {
              direction.value = 'rtl'
            }}
            style={{
              padding: '0 8px',
              marginRight: '8px',
            }}
          >
            rtl
          </button>
          <button
            onClick={() => {
              direction.value = 'ltr'
            }}
            style={{
              padding: '0 8px',
            }}
          >
            ltr
          </button>
          <p
            style={{
              marginBottom: '8px',
            }}
          />
          <Segmented
            options={['iOS', 'Android', 'Web']}
            onChange={value => console.log(value, typeof value)}
            direction={direction.value}
          />
        </div>
      )
    }
  },
)
