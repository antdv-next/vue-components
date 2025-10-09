import type { VNode, VNodeNormalizedChildren } from 'vue'
import { Comment, Fragment, isVNode, Text } from 'vue'
import isValid from '../isValid'
import initDefaultProps from './initDefaultProps'

export function isEmptyElement(c: any) {
  return (
    c
    && (c.type === Comment
      || (c.type === Fragment && c.children.length === 0)
      || (c.type === Text && c.children.trim() === ''))
  )
}
export function filterEmpty(children: any[] = []) {
  const res: any[] = []
  children.forEach((child: any) => {
    if (Array.isArray(child))
      res.push(...child)
    else if (child?.type === Fragment)
      res.push(...filterEmpty(child.children))
    else res.push(child)
  })
  return res.filter(c => !isEmptyElement(c))
}

export const skipFlattenKey = Symbol('skipFlatten')
function flattenChildren(children?: VNode | VNodeNormalizedChildren, isFilterEmpty = true) {
  const temp = Array.isArray(children) ? children : [children]
  const res = []
  temp.forEach((child) => {
    if (Array.isArray(child)) {
      res.push(...flattenChildren(child, isFilterEmpty))
    }
    else if (isValid(child)) {
      res.push(child)
    }
    else if (child && typeof child === 'object' && child.type === Fragment) {
      if (child.key === skipFlattenKey) {
        res.push(child)
      }
      else {
        res.push(...flattenChildren(child.children, isFilterEmpty))
      }
    }
    else if (child && isVNode(child)) {
      if (filterEmpty && !isEmptyElement(child)) {
        res.push(child)
      }
      else if (!filterEmpty) {
        res.push(child)
      }
    }
  })
  if (isFilterEmpty) {
    return filterEmpty(res)
  }
  return res
}

export { flattenChildren, initDefaultProps }
