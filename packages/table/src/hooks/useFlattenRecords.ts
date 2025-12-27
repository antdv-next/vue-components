import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import type { GetRowKey, Key } from '../interface'

export interface FlattenData<RecordType> {
  record: RecordType
  indent: number
  index: number
  rowKey: Key
}

function fillRecords<T>(
  list: FlattenData<T>[],
  record: T,
  indent: number,
  childrenColumnName: string,
  expandedKeys: Set<Key>,
  getRowKey: GetRowKey<T>,
  index: number,
) {
  const key = getRowKey(record, index)

  list.push({
    record,
    indent,
    index,
    rowKey: key,
  })

  const expanded = expandedKeys?.has(key)
  const children = (record as any)?.[childrenColumnName]
  if (record && Array.isArray(children) && expanded) {
    for (let i = 0; i < children.length; i += 1) {
      fillRecords(list, children[i], indent + 1, childrenColumnName, expandedKeys, getRowKey, i)
    }
  }
}

export default function useFlattenRecords<T>(
  data: Ref<T[] | readonly T[]> | T[] | readonly T[],
  childrenColumnName: Ref<string> | string,
  expandedKeys: Ref<Set<Key>> | Set<Key>,
  getRowKey: Ref<GetRowKey<T>> | GetRowKey<T>,
) {
  return computed<FlattenData<T>[]>(() => {
    const mergedData = unref(data) || []
    const mergedChildrenColumnName = unref(childrenColumnName)
    const mergedExpandedKeys = unref(expandedKeys)
    const mergedGetRowKey = unref(getRowKey)

    if (mergedExpandedKeys?.size) {
      const list: FlattenData<T>[] = []
      for (let i = 0; i < mergedData.length; i += 1) {
        fillRecords(
          list,
          mergedData[i],
          0,
          mergedChildrenColumnName,
          mergedExpandedKeys,
          mergedGetRowKey,
          i,
        )
      }
      return list
    }

    return mergedData.map((item, index) => ({
      record: item,
      indent: 0,
      index,
      rowKey: mergedGetRowKey(item, index),
    }))
  })
}
