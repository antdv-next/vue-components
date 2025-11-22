import type { SegmentedValue } from '../src'
import { defineComponent, ref } from 'vue'
import Segmented from '../src'
import './assets/style.less'

export default defineComponent(
  () => {
    const value = ref<SegmentedValue>('Web3')

    return () => {
      return (
        <div>
          <Segmented
            options={['iOS', 'Android', 'Web3']}
            value={value.value}
            onChange={(val) => {
              value.value = val
            }}
          />
          &nbsp;&nbsp;
          <Segmented
            options={['iOS', 'Android', 'Web3']}
            value={value.value}
            onChange={(val) => {
              value.value = val
            }}
          />
        </div>
      )
    }
  },
)
