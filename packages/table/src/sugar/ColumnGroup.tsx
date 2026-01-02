import type { ColumnType } from '../interface'
import { defineComponent } from 'vue'

export interface ColumnGroupProps<RecordType> extends Omit<ColumnType<RecordType>, 'children'> {

}

/**
 * This is a syntactic sugar for `columns` prop.
 * So HOC will not work on this.
 */
const ColumnGroup = defineComponent<ColumnGroupProps<any>>(() => {
  return () => null
})
export default ColumnGroup
