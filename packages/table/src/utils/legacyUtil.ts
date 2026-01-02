import type { ExpandableConfig, LegacyExpandableProps } from '../interface'
import warning from '@v-c/util/dist/warning'

export const INTERNAL_COL_DEFINE = 'VC_TABLE_INTERNAL_COL_DEFINE'

export function getExpandableProps<RecordType>(
  props: LegacyExpandableProps<RecordType> & {
    expandable?: ExpandableConfig<RecordType>
  },
): ExpandableConfig<RecordType> {
  const { expandable, ...legacyExpandableConfig } = props
  let config: ExpandableConfig<RecordType>

  if (props.expandable !== undefined) {
    config = {
      ...legacyExpandableConfig,
      ...expandable,
    } as any
  }
  else {
    if (
      process.env.NODE_ENV !== 'production'
      && [
        'indentSize',
        'expandedRowKeys',
        'defaultExpandedRowKeys',
        'defaultExpandAllRows',
        'expandedRowRender',
        'expandRowByClick',
        'expandIcon',
        'onExpand',
        'onExpandedRowsChange',
        'expandedRowClassName',
        'expandIconColumnIndex',
        'showExpandColumn',
        'title',
      ].some(prop => (props as any)[prop] !== undefined)
    ) {
      warning(false, 'expanded related props have been moved into `expandable`.')
    }

    config = legacyExpandableConfig as any
  }

  if (config.showExpandColumn === false) {
    config.expandIconColumnIndex = -1
  }

  return config
}
