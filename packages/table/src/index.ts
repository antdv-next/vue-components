import type {
  AlignType,
  ColumnGroupType,
  ColumnType,
  ColumnsType,
  DefaultRecordType,
  ExpandableConfig,
  ExpandedRowRender,
  FixedType,
  GetComponentProps,
  GetRowKey,
  Key,
  Reference,
  RenderExpandIcon,
  RowClassName,
  ScrollConfig,
  TableClassNames,
  TableComponents,
  TableLayout,
  TableSticky,
  TableStyles,
} from './interface'
import type { TableProps } from './Table'
import Table from './Table'
import VirtualTable from './VirtualTable'
import type { VirtualTableProps } from './VirtualTable'
import { FooterComponents as Summary, SummaryCell, SummaryRow } from './Footer'
import Column from './sugar/Column'
import ColumnGroup from './sugar/ColumnGroup'
import { INTERNAL_COL_DEFINE } from './utils/legacyUtil'
import { EXPAND_COLUMN } from './constant'

export type {
  AlignType,
  ColumnGroupType,
  ColumnType,
  ColumnsType,
  DefaultRecordType,
  ExpandableConfig,
  ExpandedRowRender,
  FixedType,
  GetComponentProps,
  GetRowKey,
  Key,
  Reference,
  RenderExpandIcon,
  RowClassName,
  ScrollConfig,
  TableClassNames,
  TableComponents,
  TableLayout,
  TableProps,
  TableSticky,
  TableStyles,
  VirtualTableProps,
}

export {
  Summary,
  Column,
  ColumnGroup,
  SummaryCell,
  SummaryRow,
  INTERNAL_COL_DEFINE,
  EXPAND_COLUMN,
  VirtualTable,
}

export default Table
