import { defineComponent, ref } from 'vue'
import TreeSelect from '../src'
import './assets/index.less'

const { SHOW_PARENT } = TreeSelect

const treeData = [
  {
    label: 'Node1',
    value: '0-0',
    key: '0-0',
    children: [
      {
        label: 'Child Node1',
        value: '0-0-0',
        key: '0-0-0',
      },
    ],
  },
  {
    label: 'Node2',
    value: '0-1',
    key: '0-1',
    children: [
      {
        label: 'Child Node3',
        value: '0-1-0',
        key: '0-1-0',
      },
      {
        label: 'Child Node4',
        value: '0-1-1',
        key: '0-1-1',
      },
      {
        label: 'Child Node5',
        value: '0-1-2',
        key: '0-1-2',
      },
    ],
  },
]

export default defineComponent({
  name: 'TreeSelectDisableDemo',
  setup() {
    const value = ref<string[]>(['0-0-0'])
    const disabled = ref(false)

    const onChange = (nextValue: string[], ...args: any[]) => {
      console.log('onChange ', nextValue, args)
      value.value = nextValue
    }

    return () => {
      const tProps = {
        treeData,
        disabled: disabled.value,
        value: value.value,
        onChange,
        multiple: true,
        allowClear: true,
        treeCheckable: true,
        showCheckedStrategy: SHOW_PARENT,
        style: { width: '300px' },
      }

      return (
        <div style={{ margin: '20px' }}>
          <TreeSelect {...tProps as any} />
          <label style={{ marginLeft: '8px' }}>
            <input
              type="checkbox"
              checked={disabled.value}
              onChange={(e: Event) => {
                disabled.value = (e.target as HTMLInputElement).checked
              }}
            />
            {' '}
            禁用
          </label>
        </div>
      )
    }
  },
})
