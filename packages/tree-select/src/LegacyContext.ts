import type { DataEntity, IconType } from '@v-c/tree'
import type { Ref } from 'vue'
import type { Key, SafeKey } from './interface'
import type { TreeSelectProps } from './TreeSelect'
import { inject, provide, ref } from 'vue'

export interface LegacyContextProps {
  checkable: boolean | any
  checkedKeys: Key[]
  halfCheckedKeys: Key[]
  treeExpandedKeys?: Key[]
  treeDefaultExpandedKeys: Key[]
  onTreeExpand?: (keys: Key[]) => void
  treeDefaultExpandAll?: boolean
  treeIcon?: IconType
  showTreeIcon?: boolean
  switcherIcon?: IconType
  treeLine?: boolean
  treeNodeFilterProp: string
  treeLoadedKeys?: SafeKey[]
  treeMotion?: any
  loadData?: TreeSelectProps['loadData']
  onTreeLoad?: TreeSelectProps['onTreeLoad']

  keyEntities: Record<string, DataEntity<any>>
}

const LegacyContextKey = Symbol('LegacyTreeSelectContext')

export function useLegacyProvider(value: Ref<LegacyContextProps>) {
  provide(LegacyContextKey, value)
}

export function useLegacyContext() {
  return inject(LegacyContextKey, ref(null) as any) as Ref<LegacyContextProps | null>
}
