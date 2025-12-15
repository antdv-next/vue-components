import type { Key } from '../src/interface'
import { defineComponent } from 'vue'
import Tree from '../src'

const treeData = [
  {
    name: 'parent 1',
    test: '0-0',
    child: [
      {
        name: '张晨成',
        test: '0-0-0',
        disabled: true,
        child: [
          {
            name: 'leaf',
            test: '0-0-0-0',
            disableCheckbox: true,
          },
          {
            name: 'leaf',
            test: '0-0-0-1',
          },
        ],
      },
      {
        name: 'parent 1-1',
        test: '0-0-1',
        child: [{ test: '0-0-1-0', name: 'zcvc' }],
      },
    ],
  },
]

export default defineComponent(() => {
  const onSelect = (selectedKeys: Key[], info: any) => {
    console.log('selected', selectedKeys, info)
  }

  const onCheck = (checkedKeys: any, info: any) => {
    console.log('onCheck', checkedKeys, info)
  }

  const fieldNames = {
    children: 'child',
    title: 'name',
    key: 'test',
  }

  return () => (
    <Tree
      prefixCls="vc-tree"
      checkable
      fieldNames={fieldNames as any}
      defaultExpandedKeys={['0-0-0', '0-0-1']}
      defaultSelectedKeys={['0-0-0', '0-0-1']}
      defaultCheckedKeys={['0-0-0', '0-0-1']}
      onSelect={onSelect as any}
      onCheck={onCheck as any}
      treeData={treeData as any}
    />
  )
})
