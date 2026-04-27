import type { Key } from '@v-c/util/dist/type'
import type { ComputedRef } from 'vue'
import type { Group } from '../interface'
import type { GroupSegment } from './useGroupSegments'
import { computed } from 'vue'

export type Row =
  | { type: 'header'; groupKey: Key }
  | { type: 'item'; item: any; index: number };

export interface FlattenRowsResult {
  rows: Row[];
  headerRows: { groupKey: Key; rowIndex: number }[];
  groupKeyToSeg: Map<Key, { startIndex: number; endIndex: number }>;
}

export default function useFlattenRows(
  items: ComputedRef<any[]>,
  group: ComputedRef<Group | undefined>,
  segments: ComputedRef<GroupSegment[]>,
): ComputedRef<FlattenRowsResult> {
  return computed(() => {
    const flatRows: Row[] = [];
    const headerRows: { groupKey: Key; rowIndex: number }[] = [];
    const groupKeyToSeg = new Map<
      Key,
      { startIndex: number; endIndex: number }
    >();

    if (!group.value || !segments.value.length) {
      for (let i = 0; i < items.value.length; i += 1) {
        flatRows.push({ type: 'item', item: items.value[i], index: i });
      }
      return { rows: flatRows, headerRows, groupKeyToSeg };
    }

    for (let s = 0; s < segments.value.length; s += 1) {
      const seg = segments.value[s];
      groupKeyToSeg.set(seg.key, {
        startIndex: seg.startIndex,
        endIndex: seg.endIndex,
      });

      headerRows.push({ groupKey: seg.key, rowIndex: flatRows.length });
      flatRows.push({ type: 'header', groupKey: seg.key });

      for (let i = seg.startIndex; i <= seg.endIndex; i += 1) {
        flatRows.push({ type: 'item', item: items.value[i], index: i });
      }
    }
    return { rows: flatRows, headerRows, groupKeyToSeg };
  })
}
