import { defineComponent, ref } from 'vue'
import TreeSelect from '../src'
import './assets/index.less'

export default defineComponent({
  name: 'TreeSelectMultipleMaxCountDemo',
  setup() {
    const value = ref<string[]>(['1'])
    const checkValue = ref<any[]>(['1'])

    const treeData = [
      {
        key: '1',
        value: '1',
        title: '1',
        children: [
          {
            key: '1-1',
            value: '1-1',
            title: '1-1',
          },
          {
            key: '1-2',
            value: '1-2',
            title: '1-2',
            disabled: true,
            children: [
              {
                key: '1-2-1',
                value: '1-2-1',
                title: '1-2-1',
                disabled: true,
              },
              {
                key: '1-2-2',
                value: '1-2-2',
                title: '1-2-2',
              },
            ],
          },
          {
            key: '1-3',
            value: '1-3',
            title: '1-3',
          },
        ],
      },
      {
        key: '2',
        value: '2',
        title: '2',
      },
      {
        key: '3',
        value: '3',
        title: '3',
      },
      {
        key: '4',
        value: '4',
        title: '4',
      },
    ]

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>multiple with maxCount</h2>
        <TreeSelect
          style={{ width: '300px' }}
          fieldNames={{ value: 'value', label: 'title' }}
          multiple
          maxCount={3}
          treeData={treeData as any}
        />

        <h2>checkable with maxCount</h2>
        <TreeSelect
          style={{ width: '300px' }}
          treeCheckable
          maxCount={4}
          treeData={treeData as any}
          onChange={(val: any) => {
            value.value = val
          }}
          value={value.value as any}
        />

        <h2>checkable with maxCount and treeCheckStrictly</h2>
        <TreeSelect
          style={{ width: '300px' }}
          multiple
          treeCheckable
          treeCheckStrictly
          maxCount={3}
          treeData={treeData as any}
          onChange={(val: any) => {
            checkValue.value = val
          }}
          value={checkValue.value as any}
        />
      </div>
    )
  },
})

