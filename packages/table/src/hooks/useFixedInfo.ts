import type { Ref } from 'vue'
import type { ColumnType, StickyOffsets } from '../interface'
import useMemo from '@v-c/util/dist/hooks/useMemo'
import isEqual from '@v-c/util/dist/isEqual'
import { computed, unref } from 'vue'
import { getCellFixedInfo } from '../utils/fixUtil'

export default function useFixedInfo<RecordType>(
  flattenColumns: Ref<readonly ColumnType<RecordType>[]> | readonly ColumnType<RecordType>[],
  stickyOffsets: Ref<StickyOffsets> | StickyOffsets,
) {
  const fixedInfoList = computed(() => {
    const mergedColumns = unref(flattenColumns) || []
    const mergedOffsets = unref(stickyOffsets) as StickyOffsets
    return mergedColumns.map((_, colIndex) =>
      getCellFixedInfo(colIndex, colIndex, mergedColumns, mergedOffsets),
    )
  })

  return useMemo(
    () => fixedInfoList.value,
    [fixedInfoList],
    (prev, next) => !isEqual(prev, next),
  )
}
