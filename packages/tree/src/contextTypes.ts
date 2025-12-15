import type { BasicDataNode, DataNode, EventDataNode } from './interface.tsx'

export interface NodeMouseEventParams<
  TreeDataType extends BasicDataNode = DataNode,
> {
  event: MouseEvent
  node: EventDataNode<TreeDataType>
}
export interface NodeDragEventParams<
  TreeDataType extends BasicDataNode = DataNode,
> {
  event: DragEvent
  node: EventDataNode<TreeDataType>
}
