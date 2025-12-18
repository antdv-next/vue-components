import { defineComponent } from 'vue'
import TreeSelect from '../src'
import './assets/index.less'

export default defineComponent({
  name: 'TreeSelectFieldNamesDemo',
  setup() {
    const treeData = [
      {
        myLabel: 'Parent',
        myValue: 'parent',
        myChildren: [
          {
            myLabel: 'Sub 1',
            myValue: 'sub_1',
          },
          {
            myLabel: 'Sub 2',
            myValue: 'sub_2',
          },
        ],
      },
    ]

    const fieldNames = {
      label: 'myLabel',
      value: 'myValue',
      children: 'myChildren',
    } as const

    return () => (
      <div style={{ margin: '20px' }}>
        <h2>basic</h2>
        <TreeSelect
          style={{ width: '300px' }}
          treeDefaultExpandAll
          treeData={treeData as any}
          fieldNames={fieldNames as any}
        />

        <h2>title render</h2>
        <TreeSelect
          style={{ width: '300px' }}
          treeDefaultExpandAll
          treeTitleRender={(node: any) => <span>{node.myLabel}</span>}
          treeData={treeData as any}
          fieldNames={fieldNames as any}
        />
      </div>
    )
  },
})

