import type { ColumnsType, ColumnType, DataIndex, ExpandableConfig, FixedType, GetComponentProps, GetRowKey, Reference, RenderedCell } from './interface'
import type { TableProps } from './Table'
import type { VirtualTableProps } from './VirtualTable'
import { EXPAND_COLUMN, INTERNAL_HOOKS } from './constant'
import { FooterComponents as Summary, SummaryCell, SummaryRow } from './Footer'
import Column from './sugar/Column'
import ColumnGroup from './sugar/ColumnGroup'
import Table from './Table'
import { INTERNAL_COL_DEFINE } from './utils/legacyUtil'
import VirtualTable from './VirtualTable'

export type {
  DataIndex,
  ExpandableConfig,
  FixedType,
  GetComponentProps,
  GetRowKey,
  RenderedCell,
}
export {
  Column,
  ColumnGroup,
  type ColumnsType,
  type ColumnType,
  EXPAND_COLUMN,
  INTERNAL_COL_DEFINE,
  INTERNAL_HOOKS,
  type Reference,
  Summary,
  SummaryCell,
  SummaryRow,
  type TableProps,
  VirtualTable,
  type VirtualTableProps,
}

export default Table
