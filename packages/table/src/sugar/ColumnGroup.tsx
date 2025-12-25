import type { ColumnType } from '../interface';
import type { FunctionalComponent } from 'vue';
/* istanbul ignore next */
/**
 * This is a syntactic sugar for `columns` prop.
 * So HOC will not work on this.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ColumnGroupProps<RecordType> = ColumnType<RecordType>;

const ColumnGroup = (() => null) as unknown as {
  <T>(arg: T): FunctionalComponent<ColumnGroupProps<T>>
};
(ColumnGroup as any).__TABLE_COLUMN_GROUP__ = true;
(ColumnGroup as any).displayName = 'TableColumnGroup';

export default ColumnGroup;
