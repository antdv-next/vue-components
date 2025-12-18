import type { DataNode, FieldNames, SafeKey } from '../interface'

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : value !== undefined ? [value] : []
}

export function fillFieldNames(fieldNames?: FieldNames) {
  const { label, value, children } = fieldNames || {}
  return {
    _title: label ? [label] : ['title', 'label'],
    value: value || 'value',
    key: value || 'value',
    children: children || 'children',
  }
}

export function isCheckDisabled(node: DataNode): boolean {
  return !node || node.disabled || node.disableCheckbox || node.checkable === false
}

export function getAllKeys(treeData: DataNode[], fieldNames: FieldNames): SafeKey[] {
  const keys: SafeKey[] = []

  const dig = (list: DataNode[]): void => {
    list.forEach((item) => {
      const children = (item as any)[fieldNames.children as any] as DataNode[] | undefined
      if (children) {
        keys.push((item as any)[fieldNames.value as any] as SafeKey)
        dig(children)
      }
    })
  }

  dig(treeData)

  return keys
}

export const isNil = (val: any): boolean => val === null || val === undefined
