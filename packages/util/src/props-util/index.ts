import type { Ref, VNode, VNodeNormalizedChildren } from 'vue'
import { Comment, Fragment, isVNode, Text, toRef } from 'vue'
import isValid from '../isValid'

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
  const res: any[] = []
  temp.forEach((child: any) => {
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
      if (isFilterEmpty && !isEmptyElement(child)) {
        res.push(child)
      }
      else if (!isFilterEmpty) {
        res.push(child)
      }
    }
  })
  if (isFilterEmpty) {
    return filterEmpty(res)
  }
  return res
}

export { flattenChildren }

export function toPropsRefs<T extends Record<string, any>, K extends keyof T>(obj: T, ...args: K[]) {
  const _res: Record<any, any> = {}
  args.forEach((key) => {
    _res[key] = toRef(obj, key)
  })
  return _res as { [key in K]-?: Ref<T[key]> }
}

export function removeUndefined<T>(obj: T): Partial<T> {
  const res: Partial<T> = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key as keyof T]
    if (value !== undefined) {
      res[key as keyof T] = value
    }
  })
  return res
}
