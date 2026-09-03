import type { VueNode } from '@v-c/util'
import type { Key } from '@v-c/util/dist/type'
import type { GetKey } from '@v-c/virtual-list'
import type { CSSProperties } from 'vue'

export type RowKey<T> = keyof T | ((item: T) => Key)

export type ScrollAlign = 'top' | 'bottom' | 'auto'

export type ListySemanticName = 'root' | 'item' | 'groupHeader'

export type ListyClassNames = Partial<Record<ListySemanticName, string>>

export type ListyStyles = Partial<
  Record<ListySemanticName, CSSProperties>
>

export interface GroupScrollToConfig {
  groupKey: string
  align?: ScrollAlign
  offset?: number
}

export interface KeyScrollToConfig {
  key: string
  align?: ScrollAlign
  offset?: number
}

export interface PositionScrollToConfig {
  left?: number
  top?: number
}

export type ListyScrollToConfig
  = | number
    | null
    | KeyScrollToConfig
    | PositionScrollToConfig
    | GroupScrollToConfig

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void
}

export interface Group {
  key: ((item: any) => Key) | Key
  title: (groupKey: Key, items: any[]) => VueNode
}

export interface ListyProps {
  items?: any[]
  sticky?: boolean
  itemHeight?: number
  height?: number
  group?: Group
  virtual?: boolean
  scrollWidth?: number
  direction?: 'ltr' | 'rtl'
  prefixCls?: string
  rowKey: RowKey<any>
  classNames?: ListyClassNames
  styles?: ListyStyles
  onScroll?: (e: Event) => void
  itemRender?: (item: any, index: number) => VueNode
}

export interface ListComponentProps {
  data: any[]
  sticky?: boolean
  itemHeight?: number
  height?: number
  group?: Group
  scrollWidth?: number
  direction?: 'ltr' | 'rtl'
  prefixCls: string
  rowKey: RowKey<any>
  classNames?: ListyClassNames
  styles?: ListyStyles
  onScroll?: (e: Event) => void
  itemRender: (item: any, index: number) => VueNode
}

export type { GetKey }
