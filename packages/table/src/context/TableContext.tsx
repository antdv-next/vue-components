import type { InjectionKey } from 'vue';
import { inject, provide } from 'vue';
import type {
  Direction,
  GetComponent,
  GetComponentProps,
  GetRowKey,
  Key,
  TableClassNames,
  TableStyles,
  TransformCellText,
} from '../interface';
import type { FixedInfo } from '../utils/fixUtil';

export interface TableContextProps {
  // Table context
  prefixCls: string;
  classNames?: TableClassNames;
  styles?: TableStyles;

  getComponent: GetComponent;

  scrollbarSize: number;

  direction: Direction;

  scrollX?: number | string | true;

  fixedInfoList: readonly FixedInfo[];

  isSticky: boolean;

  summaryCollect: (uniKey: string, fixed: boolean | string) => void;

  transformCellText?: TransformCellText<unknown>;

  colWidths?: readonly number[];

  getRowKey?: GetRowKey<any>;
  expandedKeys?: Set<Key>;
  childrenColumnName?: string;
  onRow?: GetComponentProps<any>;

  componentWidth?: number;
  fixColumn?: boolean;
  horizonScroll?: boolean;

  rowHoverable?: boolean;
}

export const TableContextKey: InjectionKey<TableContextProps> = Symbol('TableContextProps');

export const useProvideTable = (props: TableContextProps) => {
  provide(TableContextKey, props);
};

export const useInjectTable = () => {
  return inject(TableContextKey, {} as TableContextProps);
};
