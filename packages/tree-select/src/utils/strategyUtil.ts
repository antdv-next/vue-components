import type { DataEntity } from '@v-c/tree'
import type { FieldNames, SafeKey } from '../interface'
import { isCheckDisabled } from './valueUtil'

export const SHOW_ALL = 'SHOW_ALL'
export const SHOW_PARENT = 'SHOW_PARENT'
export const SHOW_CHILD = 'SHOW_CHILD'

export type CheckedStrategy = typeof SHOW_ALL | typeof SHOW_PARENT | typeof SHOW_CHILD

export function formatStrategyValues(
  values: SafeKey[],
  strategy: CheckedStrategy,
  keyEntities: Record<string, DataEntity>,
  fieldNames: FieldNames,
): SafeKey[] {
  const valueSet = new Set(values)

  if (strategy === SHOW_CHILD) {
    return values.filter((key) => {
      const entity = keyEntities[String(key)]
      return (
        !entity
        || !entity.children
        || !entity.children.some(({ node }: any) => valueSet.has((node as any)[fieldNames.value as any]))
        || !entity.children.every(({ node }: any) => isCheckDisabled(node as any) || valueSet.has((node as any)[fieldNames.value as any]))
      )
    })
  }

  if (strategy === SHOW_PARENT) {
    return values.filter((key) => {
      const entity = keyEntities[String(key)]
      const parent = entity ? entity.parent : null
      return !parent || isCheckDisabled(parent.node as any) || !valueSet.has(parent.key as any)
    })
  }

  return values
}
