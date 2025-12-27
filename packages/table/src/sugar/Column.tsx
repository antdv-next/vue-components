import type { ColumnType } from '../interface'
import { defineComponent } from 'vue'

export interface ColumnProps<RecordType> extends ColumnType<RecordType> {
}

/**
 * This is a syntactic sugar for `columns` prop.
 * So HOC will not work on this.
 */
const Column = defineComponent<ColumnProps<any>>(() => {
  return () => null
})
export default Column
