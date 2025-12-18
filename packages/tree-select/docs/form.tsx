import { defineComponent, ref } from 'vue'
import TreeSelect from '../src'
import './assets/index.less'
import { gData } from './utils/dataUtil'

export default defineComponent({
  name: 'TreeSelectFormDemo',
  setup() {
    const value = ref<string[]>(['0-0-0-value'])
    const error = ref<string>('')

    const validate = () => {
      if (!value.value?.length) {
        error.value = 'tree-select 需要必填'
        return false
      }
      error.value = ''
      return true
    }

    const onSubmit = (e: Event) => {
      e.preventDefault()
      if (!validate()) {
        return
      }
      console.log('Submit:', value.value)
    }

    const onReset = () => {
      value.value = []
      error.value = ''
    }

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>validity (simple form)</h2>

        <form onSubmit={onSubmit}>
          <TreeSelect
            style={{ width: '300px' }}
            multiple
            treeCheckable
            treeData={gData as any}
            value={value.value as any}
            onChange={(val: any) => {
              value.value = val
              if (error.value) {
                validate()
              }
            }}
          />

          {error.value && <p style={{ color: 'red', marginTop: '10px' }}>{error.value}</p>}

          <div style={{ marginTop: '10px' }}>
            <button type="button" onClick={onReset}>
              reset
            </button>
            &nbsp;
            <input type="submit" value="submit" />
          </div>
        </form>
      </div>
    )
  },
})

