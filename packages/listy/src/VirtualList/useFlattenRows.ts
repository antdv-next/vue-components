import type { Key } from '@v-c/util/dist/type'
import type { Group } from '../interface'
import { toTaggedKey } from '../util'

export type Row
  = | { type: 'group', groupKey: Key } & { taggedKey: string }
    | { type: 'item', item: any, index: number } & { taggedKey: string }

export interface FlattenRowsResult {
  rows: Row[]
  groupKeys: any[]
  groupKeyToItems: Map<any, any[]>
}

export default function useFlattenRows(
  data: any[],
  groupData: Map<any, any[]>,
  getItemKey: (item: any) => Key,
  group: Group | undefined,
): FlattenRowsResult {
  const flatRows: Row[] = []
  const groupKeys: any[] = []
  const groupKeyToItems = new Map<
    Key,
    any[]
  >()
  const itemRow = (item: any, index: number): Row => ({
    type: 'item',
    item,
    index,
    taggedKey: toTaggedKey(getItemKey(item), 'item'),
  })

  if (!group) {
    data.forEach((item, index) => {
      flatRows.push(itemRow(item, index))
    })

    return { rows: flatRows, groupKeys, groupKeyToItems }
  }

  // ============================= Flatten ==============================
  groupData.forEach((groupItems, groupKey) => {
    groupKeyToItems.set(
      groupKey,
      groupItems.map(({ item }) => item),
    )

    groupKeys.push(groupKey)
    flatRows.push({
      type: 'group',
      groupKey,
      taggedKey: toTaggedKey(groupKey, 'group'),
    })

    groupItems.forEach(({ item, index }) => {
      flatRows.push(itemRow(item, index))
    })
  })
  return { rows: flatRows, groupKeys, groupKeyToItems }
}
