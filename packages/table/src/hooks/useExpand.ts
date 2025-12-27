import type { Ref } from 'vue'
import { computed, ref, unref } from 'vue'
import { warning } from '@v-c/util'
import { INTERNAL_HOOKS } from '../constant'
import type {
  ExpandableConfig,
  ExpandableType,
  GetRowKey,
  Key,
  RenderExpandIcon,
  TriggerEventHandler,
} from '../interface'
import type { TableProps } from '../Table'
import { findAllChildrenKeys, renderExpandIcon } from '../utils/expandUtil'
import { getExpandableProps } from '../utils/legacyUtil'

export default function useExpand<RecordType>(
  props: TableProps<RecordType>,
  mergedData: Ref<readonly RecordType[]> | readonly RecordType[],
  getRowKey: Ref<GetRowKey<RecordType>> | GetRowKey<RecordType>,
): [
  expandableConfig: Ref<ExpandableConfig<RecordType>>,
  expandableType: Ref<ExpandableType>,
  expandedKeys: Ref<Set<Key>>,
  expandIcon: Ref<RenderExpandIcon<RecordType>>,
  childrenColumnName: Ref<string>,
  onTriggerExpand: TriggerEventHandler<RecordType>,
] {
  const expandableConfig = computed(() => getExpandableProps(props))

  const mergedExpandIcon = computed<RenderExpandIcon<RecordType>>(
    () => expandableConfig.value.expandIcon || renderExpandIcon,
  )

  const mergedChildrenColumnName = computed(
    () => expandableConfig.value.childrenColumnName || 'children',
  )

  const expandableType = computed<ExpandableType>(() => {
    if (expandableConfig.value.expandedRowRender) {
      return 'row'
    }

    const data = unref(mergedData) || []
    const childrenKey = mergedChildrenColumnName.value

    if (
      (props.expandable
        && props.internalHooks === INTERNAL_HOOKS
        && (props.expandable as any).__PARENT_RENDER_ICON__)
      || data.some(record => record && typeof record === 'object' && (record as any)[childrenKey])
    ) {
      return 'nest'
    }

    return false
  })

  const initialExpandedKeys = (() => {
    const config = expandableConfig.value
    if (config.defaultExpandedRowKeys) {
      return [...config.defaultExpandedRowKeys]
    }
    if (config.defaultExpandAllRows) {
      return findAllChildrenKeys<RecordType>(
        unref(mergedData) || [],
        unref(getRowKey),
        mergedChildrenColumnName.value,
      )
    }
    return []
  })()
  const innerExpandedKeys = ref<Key[]>(initialExpandedKeys)

  const mergedExpandedKeys = computed(() => {
    return new Set(expandableConfig.value.expandedRowKeys || innerExpandedKeys.value || [])
  })

  const onTriggerExpand: TriggerEventHandler<RecordType> = (record, event) => {
    const data = unref(mergedData) || []
    const rowKey = unref(getRowKey)(record, data.indexOf(record))

    const newExpandedKeys = new Set(mergedExpandedKeys.value)
    const hasKey = newExpandedKeys.has(rowKey)
    if (hasKey) {
      newExpandedKeys.delete(rowKey)
    } else {
      newExpandedKeys.add(rowKey)
    }

    innerExpandedKeys.value = Array.from(newExpandedKeys)

    expandableConfig.value.onExpand?.(!hasKey, record)
    expandableConfig.value.onExpandedRowsChange?.(Array.from(newExpandedKeys))

    // Support vue v-model for expandedRowKeys
    props['onUpdate:expandedRowKeys']?.(Array.from(newExpandedKeys))

    event?.stopPropagation?.()
  }

  if (
    process.env.NODE_ENV !== 'production'
    && expandableConfig.value.expandedRowRender
    && (unref(mergedData) || []).some((record: RecordType) => {
      return Array.isArray((record as any)?.[mergedChildrenColumnName.value])
    })
  ) {
    warning(false, '`expandedRowRender` should not use with nested Table')
  }

  return [
    expandableConfig as Ref<ExpandableConfig<RecordType>>,
    expandableType as Ref<ExpandableType>,
    mergedExpandedKeys as Ref<Set<Key>>,
    mergedExpandIcon as Ref<RenderExpandIcon<RecordType>>,
    mergedChildrenColumnName as Ref<string>,
    onTriggerExpand,
  ]
}
