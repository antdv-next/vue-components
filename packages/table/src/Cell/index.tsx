import type { VueNode } from '@v-c/util'
import type { CSSProperties } from 'vue'
import type {
  AlignType,
  CellEllipsisType,
  ColumnType,
  CustomizeComponent,
  DataIndex,
  DefaultRecordType,
  ScopeType,
} from '../interface.ts'

export interface CellProps<RecordType extends DefaultRecordType> {
  prefixCls?: string
  className?: string
  style?: CSSProperties
  record?: RecordType
  /** `column` index is the real show rowIndex */
  index?: number
  /** the index of the record. For the render(value, record, renderIndex) */
  renderIndex?: number
  dataIndex?: DataIndex<RecordType>
  render?: ColumnType<RecordType>['render']
  component?: CustomizeComponent
  // children?: React.ReactNode
  colSpan?: number
  rowSpan?: number
  scope?: ScopeType
  ellipsis?: CellEllipsisType
  align?: AlignType

  shouldCellUpdate?: (record: RecordType, prevRecord: RecordType) => boolean

  // Fixed
  fixStart?: number | false
  fixEnd?: number | false
  fixedStartShadow?: boolean
  fixedEndShadow?: boolean
  offsetFixedStartShadow?: number
  offsetFixedEndShadow?: number
  zIndex?: number
  zIndexReverse?: number
  allColsFixedLeft?: boolean

  // ====================== Private Props ======================
  /** @private Used for `expandable` with nest tree */
  appendNode?: VueNode
  additionalProps?: Record<string, any>

  rowType?: 'header' | 'body' | 'footer'

  isSticky?: boolean
}
