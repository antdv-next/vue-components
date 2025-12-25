import type { FunctionalComponent } from 'vue';
import type { ColumnType } from '../interface';

export type ColumnProps<RecordType> = ColumnType<RecordType>;

/* istanbul ignore next */
/**
 * This is a syntactic sugar for `columns` prop.
 * So HOC will not work on this.
 */
const Column = (() => null) as unknown as { <T>(arg: T): FunctionalComponent<ColumnProps<T>> };
(Column as any).__TABLE_COLUMN__ = true;
(Column as any).displayName = 'TableColumn';

export default Column;
