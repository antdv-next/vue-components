import type { Ref } from 'vue'
import { clsx } from '@v-c/util'
import { computed, toRef, unref } from 'vue'
import { useInjectTableContext } from '../context/TableContext'
import { getColumnsKey } from '../utils/valueUtil'

const columnsKeyCache = new WeakMap<object, ReturnType<typeof getColumnsKey>>()

function getColumnsKeyMemo(flattenColumns: readonly any[]) {
  let keys = columnsKeyCache.get(flattenColumns)
  if (!keys) {
    keys = getColumnsKey(flattenColumns)
    columnsKeyCache.set(flattenColumns, keys)
  }
  return keys
}

export default function useRowInfo<RecordType>(
  record: Ref<RecordType> | RecordType,
  rowKey: Ref<string | number> | string | number,
  recordIndex: Ref<number> | number,
  indent: Ref<number> | number,
) {
  const tableContext = useInjectTableContext<RecordType>()

  // Cheap derivations are plain getters; `expanded` and `rowProps` stay
  // computeds because they gate re-renders (Set lookup result / built object).
  const nestExpandable = toRef(() => tableContext.expandableType === 'nest')
  const rowSupportExpand = toRef(() => {
    const mergedRecord = unref(record)
    return tableContext.expandableType === 'row'
      && (!tableContext.rowExpandable || tableContext.rowExpandable(mergedRecord))
  })
  const expandable = toRef(() => rowSupportExpand.value || nestExpandable.value)

  const expanded = computed(() => tableContext.expandedKeys?.has(unref(rowKey)))
  const hasNestChildren = toRef(() => {
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
    }
    else if (typeof tableContext.rowClassName === 'function') {
      computeRowClassName = tableContext.rowClassName(mergedRecord, mergedRecordIndex, mergedIndent)
    }

    return {
      ...customRowProps,
      className: clsx(computeRowClassName, customRowProps?.className, customRowProps?.class),
      onClick,
    }
  })

  // Column keys only depend on the column list, which the table rebuilds as a
  // whole: memoize per list instance instead of per row.
  const columnsKey = toRef(() => getColumnsKeyMemo(tableContext.flattenColumns))

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
