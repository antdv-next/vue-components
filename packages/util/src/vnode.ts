import type { Slots, VNode, VNodeArrayChildren, VNodeProps } from 'vue'
import type { RefObject } from './createRef'
import { cloneVNode, Comment, Fragment, isVNode, render as VueRender } from 'vue'
import { filterEmpty } from './props-util'
import warning from './warning'

type NodeProps = Record<string, any> &
  Omit<VNodeProps, 'ref'> & { ref?: VNodeProps['ref'] | RefObject }

export function cloneElement<T, U>(
  vnode: VNode<T, U> | VNode<T, U>[],
  nodeProps: NodeProps = {},
  override = true,
  mergeRef = false,
): VNode<T, U> | null {
  let ele = vnode
  if (Array.isArray(vnode))
    ele = filterEmpty(vnode)[0]

  if (!ele)
    return null

  const node: any = cloneVNode(ele as VNode<T, U>, nodeProps as any, mergeRef)

  // cloneVNode内部是合并属性，这里改成覆盖属性
  node.props = (override ? { ...node.props, ...nodeProps } : node.props) as any
  warning(typeof node.props.class !== 'object', 'class must be string')
  return node
}

export function cloneVNodes(vnodes: any, nodeProps = {}, override = true) {
  return vnodes.map((vnode: any) => cloneElement(vnode, nodeProps, override))
}

export function deepCloneElement<T, U>(
  vnode: VNode<T, U> | VNode<T, U>[],
  nodeProps: NodeProps = {},
  override = true,
  mergeRef = false,
): any {
  if (Array.isArray(vnode)) {
    return vnode.map((item: any) => deepCloneElement(item, nodeProps, override, mergeRef))
  }
  else {
    // 需要判断是否为vnode方可进行clone操作
    if (!isVNode(vnode))
      return vnode

    const cloned: any = cloneElement(vnode, nodeProps, override, mergeRef)
    if (Array.isArray(cloned.children))
      cloned.children = deepCloneElement(cloned.children as VNode<T, U>[])

    return cloned
  }
}

export function triggerVNodeUpdate(vm: VNode, attrs: Record<string, any>, dom: any) {
  VueRender(cloneVNode(vm, { ...attrs }), dom)
}

export function ensureValidVNode<T extends Array<unknown>>(slot: T | null) {
  return (slot || []).some((child) => {
    if (!isVNode(child))
      return true
    if (child.type === Comment)
      return false
    if (child.type === Fragment && !ensureValidVNode(child.children as VNodeArrayChildren))
      return false
    return true
  })
    ? slot
    : null
}

export function customRenderSlot(
  slots: Slots,
  name: string,
  props: Record<string, unknown>,
  fallback?: () => VNodeArrayChildren,
) {
  const slot = slots[name]?.(props)
  if (ensureValidVNode(slot as any))
    return slot

  return fallback?.()
}
