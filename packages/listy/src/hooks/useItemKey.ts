import type { Key } from '@v-c/util/dist/type'
import type { RowKey } from '../interface'
import useEvent from '@v-c/util/dist/hooks/useEvent'

export default function useItemKey<T>(rowKey: RowKey<T>) {
  return useEvent((item: T): Key =>
    typeof rowKey === 'function' ? rowKey(item) : (item[rowKey] as Key),
  )
}
