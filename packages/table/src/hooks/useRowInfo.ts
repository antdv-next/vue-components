import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import { clsx } from '@v-c/util'
import { useInjectTableContext } from '../context/TableContext'
import { getColumnsKey } from '../utils/valueUtil'

export default function useRowInfo<RecordType>(
  record: Ref<RecordType> | RecordType,
  rowKey: Ref<string | number> | string | number,
  recordIndex: Ref<number> | number,
  indent: Ref<number> | number,
) {
  const tableContext = useInjectTableContext<RecordType>()

  const nestExpandable = computed(() => tableContext.expandableType === 'nest')
  const rowSupportExpand = computed(() => {
    const mergedRecord = unref(record)
    return tableContext.expandableType === 'row'
      && (!tableContext.rowExpandable || tableContext.rowExpandable(mergedRecord))
  })
  const expandable = computed(() => rowSupportExpand.value || nestExpandable.value)

  const expanded = computed(() => tableContext.expandedKeys?.has(unref(rowKey)))
  const hasNestChildren = computed(() => {
    const mergedRecord = unref(record) as any
    return !!(tableContext.childrenColumnName && mergedRecord?.[tableContext.childrenColumnName])
  })

  const rowProps = computed(() => {
    const mergedRecord = unref(record)
    const mergedRecordIndex = unref(recordIndex)
    const mergedIndent = unref(indent)
    const customRowProps = tableContext.onRow?.(mergedRecord, mergedRecordIndex) || {}
    const onRowClick = customRowProps?.onClick

    const onClick = (event: MouseEvent) => {
      if (tableContext.expandRowByClick && expandable.value) {
        tableContext.onTriggerExpand(mergedRecord, event)
      }
      onRowClick?.(event as any)
    }

    let computeRowClassName = ''
    if (typeof tableContext.rowClassName === 'string') {
      computeRowClassName = tableContext.rowClassName
    } else if (typeof tableContext.rowClassName === 'function') {
      computeRowClassName = tableContext.rowClassName(mergedRecord, mergedRecordIndex, mergedIndent)
    }

    return {
      ...customRowProps,
      className: clsx(computeRowClassName, customRowProps?.className, customRowProps?.class),
      onClick,
    }
  })

  const columnsKey = computed(() => getColumnsKey(tableContext.flattenColumns))

  return {
    tableContext,
    columnsKey,
    nestExpandable,
    expanded,
    hasNestChildren,
    rowSupportExpand,
    expandable,
    rowProps,
  }
}
