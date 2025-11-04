import { UniqueProvider } from '@v-c/trigger'
import { defineComponent } from 'vue'
import Tooltip from '../src'
import './assets/bootstrap.less'

const motion = { motionName: 'vc-tooltip-zoom' }

export default defineComponent(() => {
  return () => (
    <UniqueProvider>
      <div style={{ margin: '100px', display: 'flex', gap: '16px' }}>
        <Tooltip placement="top" trigger={['hover']} overlay="This is the first tooltip" motion={motion}>
          <button type="button">Button 1</button>
        </Tooltip>
        <Tooltip placement="top" trigger={['hover']} overlay="This is the second tooltip" motion={motion}>
          <button type="button">Button 2</button>
        </Tooltip>
      </div>
    </UniqueProvider>
  )
})
