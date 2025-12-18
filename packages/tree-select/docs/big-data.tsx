import { defineComponent, ref } from 'vue'
import TreeSelect, { SHOW_PARENT } from '../src'
import './assets/index.less'
import Gen from './utils/big-data-generator'

export default defineComponent({
  name: 'TreeSelectBigDataDemo',
  setup() {
    const gData = ref<any[]>([])
    const gData1 = ref<any[]>([])

    const value = ref<string[]>([])
    const value1 = ref<any[]>([])

    const onGen = (data: any[]) => {
      gData.value = data
      gData1.value = [...data]
      value.value = ['0-0-0-value']
      value1.value = [
        { value: '0-0-value', label: '0-0-label', halfChecked: true },
        { value: '0-0-0-value', label: '0-0-0-label' },
      ]
    }

    const onChange = (nextValue: string[]) => {
      console.log('onChange', nextValue)
      value.value = nextValue
    }

    const onChangeStrictly = (nextValue: any[]) => {
      console.log('onChangeStrictly', nextValue)
      const ind = Number.parseInt(`${Math.random() * 3}`, 10)
      const draft = Array.isArray(nextValue) ? [...nextValue] : []
      draft.push({
        value: `0-0-0-${ind}-value`,
        label: `0-0-0-${ind}-label`,
        halfChecked: true,
      })
      value1.value = draft
    }

    return () => (
      <div style={{ padding: '0 20px' }}>
        <Gen onGen={onGen} />

        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '20px' }}>
            <h3>normal check</h3>
            <TreeSelect
              style={{ width: '300px' }}
              treeData={gData.value as any}
              treeLine
              value={value.value as any}
              placeholder={<i>请下拉选择</i>}
              treeCheckable
              showCheckedStrategy={SHOW_PARENT}
              onChange={onChange as any}
            />
          </div>

          <div>
            <h3>checkStrictly</h3>
            <TreeSelect
              style={{ width: '300px' }}
              treeData={gData1.value as any}
              treeLine
              value={value1.value as any}
              placeholder={<i>请下拉选择</i>}
              treeCheckable
              treeCheckStrictly
              showCheckedStrategy={SHOW_PARENT}
              onChange={onChangeStrictly as any}
            />
          </div>
        </div>
      </div>
    )
  },
})

