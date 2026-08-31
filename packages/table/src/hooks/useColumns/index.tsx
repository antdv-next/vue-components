import type { Ref } from 'vue'
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  Direction,
  ExpandColumnTitle,
  ExpandIconComponent,
  ExpandIconProps,
  FixedType,
  GetRowKey,
  Key,
  RenderExpandIcon,
  TriggerEventHandler,
} from '../../interface'
import { warning } from '@v-c/util'
import { flattenChildren } from '@v-c/util/dist/props-util'
import { computed, h, isVNode, toRaw, unref } from 'vue'
import { EXPAND_COLUMN } from '../../constant'
import { DefaultExpandIcon } from '../../utils/expandUtil'
import { INTERNAL_COL_DEFINE } from '../../utils/legacyUtil'
import useWidthColumns from './useWidthColumns'

/**
 * `EXPAND_COLUMN` is a sentinel matched by reference. When `columns` comes from a deep
 * reactive source (component props, `reactive()` or `ref()`), every entry is handed out
 * as a proxy, so the raw value must be unwrapped before comparing identity.
 */
function isExpandColumn(column: any): boolean {
  return toRaw(column) === EXPAND_COLUMN
}

export function convertChildrenToColumns<RecordType>(children: any): ColumnsType<RecordType> {
  return flattenChildren(children)
    .filter(node => isVNode(node))
    .map((node: any) => {
      const { key, props, children: nodeChildren } = node
      const column: any = {
        key,
        ...(props || {}),
      }

      if (nodeChildren?.default) {
        column.children = convertChildrenToColumns(nodeChildren.default())
      }

      return column
    })
    .filter(Boolean)
}

function filterHiddenColumns<RecordType>(columns: ColumnsType<RecordType>): ColumnsType<RecordType> {
  return columns
    .filter(column => column && typeof column === 'object' && !column.hidden)
    .map((column) => {
      const subColumns = (column as ColumnGroupType<RecordType>).children

      if (subColumns && subColumns.length > 0) {
        return {
          ...column,
          children: filterHiddenColumns(subColumns),
        }
      }

      return column
    })
}

function flatColumns<RecordType>(
  columns: ColumnsType<RecordType>,
  parentKey = 'key',
): ColumnType<RecordType>[] {
  return columns
    .filter(column => column && typeof column === 'object')
    .reduce((list, column, index) => {
      const { fixed } = column
      const parsedFixed
        = fixed === true || fixed === 'left' ? 'start' : fixed === 'right' ? 'end' : fixed
      const mergedKey = `${parentKey}-${index}`

      const subColumns = (column as ColumnGroupType<RecordType>).children
      if (subColumns && subColumns.length > 0) {
        return [
          ...list,
          ...flatColumns(subColumns, mergedKey).map(subColumn => ({
            ...subColumn,
            fixed: subColumn.fixed ?? parsedFixed,
          })),
        ]
      }
      return [
        ...list,
        {
          key: mergedKey,
          ...column,
          fixed: parsedFixed,
        },
      ]
    }, [] as ColumnType<RecordType>[])
}

export default function useColumns<RecordType>(
  options: {
    prefixCls?: Ref<string> | string
    columns?: Ref<ColumnsType<RecordType> | undefined> | ColumnsType<RecordType>
    children?: any
    expandable: Ref<boolean> | boolean
    expandedKeys: Ref<Set<Key>> | Set<Key>
    columnTitle?: Ref<ExpandColumnTitle | undefined> | ExpandColumnTitle
    getRowKey: Ref<GetRowKey<RecordType>> | GetRowKey<RecordType>
    onTriggerExpand: TriggerEventHandler<RecordType>
    expandIcon?: Ref<RenderExpandIcon<RecordType> | undefined> | RenderExpandIcon<RecordType>
    ExpandIcon?: Ref<ExpandIconComponent<RecordType> | undefined> | ExpandIconComponent<RecordType>
    expandAllInfo?: Ref<Pick<ExpandIconProps<RecordType>, 'expanded' | 'expandable' | 'onClick'> | undefined>
    rowExpandable?: Ref<((record: RecordType) => boolean) | undefined> | ((record: RecordType) => boolean) | undefined
    expandIconColumnIndex?: Ref<number | undefined> | number
    expandedRowOffset?: number
    direction?: Ref<Direction> | Direction
    expandRowByClick?: Ref<boolean | undefined> | boolean | undefined
    columnWidth?: Ref<number | string | undefined> | number | string
    fixed?: Ref<FixedType | undefined> | FixedType
    scrollWidth?: Ref<number | null | undefined> | number | null | undefined
    clientWidth: Ref<number> | number
  },
  transformColumns?: Ref<((columns: ColumnsType<RecordType>) => ColumnsType<RecordType>) | null> | ((columns: ColumnsType<RecordType>) => ColumnsType<RecordType>) | null,
): [
  columns: Ref<ColumnsType<RecordType>>,
  flattenColumns: Ref<readonly ColumnType<RecordType>[]>,
  realScrollWidth: Ref<number | undefined>,
] {
  const baseColumns = computed<ColumnsType<RecordType>>(() => {
    const cols = unref(options.columns)
    const newColumns = cols || convertChildrenToColumns(options.children) || []
    return filterHiddenColumns(newColumns.slice())
  })

  const withExpandColumns = computed<ColumnsType<RecordType>>(() => {
    if (unref(options.expandable)) {
      let cloneColumns = baseColumns.value.slice()

      const expandIconColumnIndex = unref(options.expandIconColumnIndex)
      if (process.env.NODE_ENV !== 'production' && expandIconColumnIndex !== undefined) {
        warning(
          false,
          '`expandIconColumnIndex` is deprecated. Please use `Table.EXPAND_COLUMN` in `columns` instead.',
        )
      }

      if (!cloneColumns.some(isExpandColumn)) {
        const expandColIndex = expandIconColumnIndex || 0
        const fixed = unref(options.fixed)
        const insertIndex
          = expandColIndex === 0 && (fixed === 'right' || fixed === 'end')
            ? baseColumns.value.length
            : expandColIndex
        if (insertIndex >= 0) {
          cloneColumns.splice(insertIndex, 0, EXPAND_COLUMN)
        }
      }

      if (
        process.env.NODE_ENV !== 'production'
        && cloneColumns.filter(c => isExpandColumn(c)).length > 1
      ) {
        warning(false, 'There exist more than one `EXPAND_COLUMN` in `columns`.')
      }

      const expandColumnIndex = cloneColumns.findIndex(isExpandColumn)
      cloneColumns = cloneColumns.filter(
        (column, index) => !isExpandColumn(column) || index === expandColumnIndex,
      )

      const prevColumn = baseColumns.value[expandColumnIndex]
      let fixedColumn: FixedType | undefined
      const fixed = unref(options.fixed)
      if (fixed) {
        fixedColumn = fixed
      }
      else {
        fixedColumn = prevColumn?.fixed
      }

      const prefixCls = unref(options.prefixCls) || ''
      const MergedExpandIcon = unref(options.ExpandIcon) || DefaultExpandIcon
      const expandAllInfo = unref(options.expandAllInfo)
      const expandAllNode = expandAllInfo
        ? h(MergedExpandIcon, { type: 'all', prefixCls, ...expandAllInfo } as any)
        : undefined
      const columnTitle = unref(options.columnTitle)
      const mergedColumnTitle = typeof columnTitle === 'function'
        ? (columnTitle as (props: { expandIcon: any }) => any)({ expandIcon: expandAllNode })
        : (columnTitle ?? expandAllNode)

      const expandColumn = {
        [INTERNAL_COL_DEFINE]: {
          className: `${prefixCls}-expand-icon-col`,
          columnType: 'EXPAND_COLUMN',
        },
        title: mergedColumnTitle,
        fixed: fixedColumn,
        className: `${prefixCls}-row-expand-icon-cell`,
        width: unref(options.columnWidth),
        render: (_: any, record: RecordType, index: number) => {
          const rowKey = unref(options.getRowKey)(record, index)
          const expanded = unref(options.expandedKeys).has(rowKey)
          const rowExpandable = unref(options.rowExpandable)
          const recordExpandable = rowExpandable ? rowExpandable(record) : true

          const expandIcon = unref(options.expandIcon)
          const icon = expandIcon
            ? expandIcon({
                prefixCls,
                expanded,
                expandable: recordExpandable,
                record,
                onExpand: options.onTriggerExpand,
              })
            : null

          if (unref(options.expandRowByClick)) {
            return <span onClick={e => e.stopPropagation()}>{icon}</span>
          }
          return icon
        },
      }

      return cloneColumns.map((col, index) => {
        const column = isExpandColumn(col) ? expandColumn : col
        if ((options.expandedRowOffset || 0) && index < (options.expandedRowOffset || 0)) {
          return {
            ...column,
            fixed: column.fixed || 'start',
          }
        }
        return column
      })
    }

    if (process.env.NODE_ENV !== 'production' && baseColumns.value.some(isExpandColumn)) {
      warning(false, '`expandable` is not config but there exist `EXPAND_COLUMN` in `columns`.')
    }

    return baseColumns.value.filter(col => !isExpandColumn(col))
  })

  const mergedColumns = computed(() => {
    let finalColumns = withExpandColumns.value
    const transform = unref(transformColumns)
    if (transform) {
      finalColumns = transform(finalColumns)
    }

    if (!finalColumns.length) {
      finalColumns = [{ render: () => null }] as ColumnsType<RecordType>
    }
    return finalColumns
  })

  const flattenColumns = computed(() => flatColumns(mergedColumns.value))

  const widthColumns = useWidthColumns(flattenColumns, options.scrollWidth, options.clientWidth)

  const filledColumns = computed(() => widthColumns.value[0])
  const realScrollWidth = computed(() => widthColumns.value[1])

  return [mergedColumns, filledColumns, realScrollWidth]
}
