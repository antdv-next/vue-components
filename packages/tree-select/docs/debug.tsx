import { defineComponent } from 'vue'
import TreeSelect from '../src'
import './assets/index.less'

const treeData = [
  { key: '0', value: '0', title: 'label0' },
  { key: '1', value: '1', title: 'label1' },
]

export default defineComponent({
  name: 'TreeSelectDebugDemo',
  setup() {
    return () => (
      <div style={{ margin: '20px' }}>
        <TreeSelect
          treeData={treeData as any}
          fieldNames={{ value: 'value', label: 'title' }}
          labelInValue
          maxTagCount={1}
          defaultValue={{
            value: '0',
            label: '2333',
          }}
        />
      </div>
    )
  },
})
