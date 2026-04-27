
import type { VueNode } from '@v-c/util'
import type { Key } from '@v-c/util/dist/type'
import type { GetKey, ScrollTo } from '@v-c/virtual-list'

export type ScrollAlign = 'top' | 'bottom' | 'auto';

export type ListyScrollToConfig =
  | Parameters<ScrollTo>[0]
  | {
      groupKey: string;
      align?: ScrollAlign;
      offset?: number;
    };

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void;
}

type RowKey<T> = keyof T | ((item: T) => Key);

export interface Group {
  key: ((item: any) => Key) | Key;
  title: (groupKey: Key, items: any[]) => VueNode;
}

export interface ListyProps {
  items?: any[];
  sticky?: boolean;
  itemHeight?: number;
  height?: number;
  group?: Group;
  virtual?: boolean;
  prefixCls?: string;
  rowKey: RowKey<any>;
  onEndReached?: () => void;
  itemRender: (item: any, index: number) => VueNode;
}

export type { GetKey };
