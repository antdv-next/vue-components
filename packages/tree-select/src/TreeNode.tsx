import type { DataNode, Key } from './interface'
import { defineComponent } from 'vue'

export interface TreeNodeProps extends Omit<DataNode, 'children'> {
  value: Key
}

/** This is a placeholder, not real render in dom */
const TreeNode = defineComponent(() => {
  return () => null
})

export default TreeNode
