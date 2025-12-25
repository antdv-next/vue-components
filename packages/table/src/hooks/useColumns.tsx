import warning from '@v-c/util/dist/warning'
import { flattenChildren } from '@v-c/util/dist/props-util'
import type { ComputedRef, Ref, VNode } from 'vue'
import { computed, isVNode, watchEffect } from 'vue'
import type {
  ColumnGroupType,
  ColumnsType,
  ColumnType,
  FixedType,
  GetRowKey,
  Key,
  RenderExpandIcon,
  TriggerEventHandler,
} from '../interface'
import { INTERNAL_COL_DEFINE } from '../utils/legacyUtil'
import { EXPAND_COLUMN } from '../constant'
import { useInjectSlots } from '../context/SlotsContext'
import { customRenderSlot } from '@v-c/util/dist/vnode'
import useWidthColumns from './useWidthColumns'

const TABLE_COLUMN_KEY = '__TABLE_COLUMN__'
const TABLE_COLUMN_GROUP_KEY = '__TABLE_COLUMN_GROUP__'

function filterHiddenColumns<RecordType>(
  columns: ColumnsType<RecordType>,
): ColumnsType<RecordType> {
  return columns
    .filter(column => column && typeof column === 'object' && !column.hidden)
    .map(column => {
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
    .reduce<ColumnType<RecordType>[]>((list, column, index) => {
      const { fixed } = column
      const parsedFixed =
        fixed === true || fixed === 'left' ? 'start' : fixed === 'right' ? 'end' : fixed
      const mergedKey = `${parentKey}-${index}`

      const subColumns = (column as ColumnGroupType<RecordType>).children
      if (subColumns && subColumns.length > 0) {
        return [
          ...list,
          ...flatColumns(subColumns, mergedKey).map(subColum => ({
            ...subColum,
            fixed: subColum.fixed ?? parsedFixed,
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
    }, [])
}

function getNodeChildren(node: VNode): VNode[] {
  const children = (node as any).children
  if (!children) {
    return []
  }
  if (typeof children === 'function') {
    return children()
  }
  if (Array.isArray(children)) {
    return children
  }
  if (typeof children === 'object' && children.default) {
    const defaultSlot = children.default
    return typeof defaultSlot === 'function' ? defaultSlot() : defaultSlot
  }
  return []
}

export function convertChildrenToColumns<RecordType>(nodes: VNode[] = []): ColumnsType<RecordType> {
  return flattenChildren(nodes as any)
    .map(node => {
      if (!isVNode(node) || !node.type) {
        return null
      }

      const nodeType = node.type as any
      if (!nodeType?.[TABLE_COLUMN_KEY] && !nodeType?.[TABLE_COLUMN_GROUP_KEY]) {
        return null
      }

      const props = (node.props || {}) as Record<string, any>
      const key = typeof node.key === 'string' || typeof node.key === 'number' ? node.key : undefined
      const column: ColumnType<RecordType> & Partial<ColumnGroupType<RecordType>> = {
        key,
        ...props,
      }

      if (nodeType?.[TABLE_COLUMN_GROUP_KEY]) {
        const childColumns = convertChildrenToColumns<RecordType>(getNodeChildren(node))
        if (childColumns.length) {
          column.children = childColumns
        }
      }

      return column
    })
    .filter(Boolean) as ColumnsType<RecordType>
}

function warningFixed(flattenColumns: readonly { fixed?: FixedType }[]) {
  let allFixStart = true
  for (let i = 0; i < flattenColumns.length; i += 1) {
    const col = flattenColumns[i]
    if (allFixStart && col.fixed !== 'start') {
      allFixStart = false
    } else if (!allFixStart && col.fixed === 'start') {
      warning(false, `Index ${i - 1} of \`columns\` missing \`fixed='start'\` prop.`)
      break
    }
  }

  let allFixEnd = true
  for (let i = flattenColumns.length - 1; i >= 0; i -= 1) {
    const col = flattenColumns[i]
    if (allFixEnd && col.fixed !== 'end') {
      allFixEnd = false
    } else if (!allFixEnd && col.fixed === 'end') {
      warning(false, `Index ${i + 1} of \`columns\` missing \`fixed='end'\` prop.`)
      break
    }
  }
}

/**
 * Parse `columns` & `children` into `columns`.
 */
function useColumns<RecordType>(
  {
    prefixCls,
    columns: baseColumns,
    children,
    expandable,
    expandedKeys,
    columnTitle,
    getRowKey,
    onTriggerExpand,
    expandIcon,
    rowExpandable,
    expandIconColumnIndex,
    expandRowByClick,
    columnWidth,
    fixed,
    expandedRowOffset,
    scrollWidth,
    clientWidth,
  }: {
    prefixCls?: Ref<string>
    columns?: Ref<ColumnsType<RecordType>>
    children?: Ref<VNode[]>
    expandable: Ref<boolean>
    expandedKeys: ComputedRef<Set<Key>>
    columnTitle?: Ref<any>
    getRowKey: Ref<GetRowKey<RecordType>>
    onTriggerExpand: TriggerEventHandler<RecordType>
    expandIcon?: Ref<RenderExpandIcon<RecordType>>
    rowExpandable?: Ref<(record: RecordType) => boolean>
    expandIconColumnIndex?: Ref<number>
    expandRowByClick?: Ref<boolean>
    columnWidth?: Ref<number | string>
    fixed?: Ref<FixedType>
    expandedRowOffset?: Ref<number>
    scrollWidth?: Ref<number | null>
    clientWidth?: Ref<number>
  },
  transformColumns: Ref<(columns: ColumnsType<RecordType>) => ColumnsType<RecordType>>,
): [
  ComputedRef<ColumnsType<RecordType>>,
  ComputedRef<readonly ColumnType<RecordType>[]>,
  ComputedRef<number | undefined>,
] {
  const contextSlots = useInjectSlots()

  const base = computed(() => {
    const columns = baseColumns?.value || convertChildrenToColumns(children?.value || [])
    return filterHiddenColumns(columns.slice())
  })

  // Add expand column
  const withExpandColumns = computed<ColumnsType<RecordType>>(() => {
    if (expandable.value) {
      let cloneColumns = base.value.slice()

      // >>> Warning if use `expandIconColumnIndex`
      const expandIconColumnIndexValue = expandIconColumnIndex?.value
      if (
        process.env.NODE_ENV !== 'production' &&
        expandIconColumnIndexValue !== undefined &&
        expandIconColumnIndexValue >= 0
      ) {
        warning(
          false,
          '`expandIconColumnIndex` is deprecated. Please use `Table.EXPAND_COLUMN` in `columns` instead.',
        )
      }

      // >>> Insert expand column if not exist
      if (!cloneColumns.includes(EXPAND_COLUMN)) {
        const expandColIndex = expandIconColumnIndex?.value ?? 0
        const insertIndex =
          expandColIndex === 0 && (fixed?.value === 'right' || fixed?.value === 'end')
            ? base.value.length
            : expandColIndex
        if (insertIndex >= 0) {
          cloneColumns.splice(insertIndex, 0, EXPAND_COLUMN)
        }
      }

      // >>> Deduplicate additional expand column
      if (
        process.env.NODE_ENV !== 'production' &&
        cloneColumns.filter(c => c === EXPAND_COLUMN).length > 1
      ) {
        warning(false, 'There exist more than one `EXPAND_COLUMN` in `columns`.')
      }
      const expandColumnIndex = cloneColumns.indexOf(EXPAND_COLUMN)
      cloneColumns = cloneColumns.filter(
        (column, index) => column !== EXPAND_COLUMN || index === expandColumnIndex,
      )

      // >>> Check if expand column need to fixed
      const prevColumn = base.value[expandColumnIndex]

      let fixedColumn: FixedType | undefined
      if (fixed?.value) {
        fixedColumn = fixed.value
      } else {
        fixedColumn = prevColumn?.fixed
      }

      const expandedKeysValue = expandedKeys.value
      const rowExpandableValue = rowExpandable?.value
      const expandIconValue = expandIcon?.value as RenderExpandIcon<RecordType>
      const prefixClsValue = prefixCls?.value || ''
      const expandRowByClickValue = expandRowByClick?.value
      // >>> Create expandable column
      const expandColumn = {
        [INTERNAL_COL_DEFINE]: {
          className: `${prefixClsValue}-expand-icon-col`,
          columnType: 'EXPAND_COLUMN',
        },
        title:
          columnTitle?.value ??
          customRenderSlot(contextSlots.value, 'expandColumnTitle', {}, () => ['']),
        fixed: fixedColumn,
        className: `${prefixClsValue}-row-expand-icon-cell`,
        width: columnWidth?.value,
        customRender: ({ record, index }: { record: RecordType; index: number }) => {
          const rowKey = getRowKey.value(record, index)
          const expanded = expandedKeysValue.has(rowKey)
          const recordExpandable = rowExpandableValue ? rowExpandableValue(record) : true

          const icon = expandIconValue({
            prefixCls: prefixClsValue,
            expanded,
            expandable: recordExpandable,
            record,
            onExpand: onTriggerExpand,
          })

          if (expandRowByClickValue) {
            return <span onClick={e => e.stopPropagation()}>{icon}</span>
          }
          return icon
        },
      }

      const offset = expandedRowOffset?.value || 0
      return cloneColumns.map((col, index) => {
        const column = col === EXPAND_COLUMN ? expandColumn : col
        if (offset && index < offset) {
          return {
            ...column,
            fixed: column.fixed || 'start',
          }
        }
        return column
      })
    }
    if (process.env.NODE_ENV !== 'production' && base.value.includes(EXPAND_COLUMN)) {
      warning(false, '`expandable` is not config but there exist `EXPAND_COLUMN` in `columns`.')
    }

    return base.value.filter(col => col !== EXPAND_COLUMN)
  })

  const mergedColumns = computed(() => {
    let finalColumns = withExpandColumns.value
    if (transformColumns.value) {
      finalColumns = transformColumns.value(finalColumns)
    }

    // Always provides at least one column for table display
    if (!finalColumns.length) {
      finalColumns = [
        {
          customRender: () => null,
        },
      ]
    }
    return finalColumns
  })

  const flattenColumns = computed(() => flatColumns(mergedColumns.value))
  const [filledColumns, realScrollWidth] = useWidthColumns(
    flattenColumns,
    scrollWidth || (computed(() => null) as Ref<number | null>),
    clientWidth || (computed(() => 0) as Ref<number>),
  )

  if (process.env.NODE_ENV !== 'production') {
    watchEffect(() => {
      setTimeout(() => {
        warningFixed(filledColumns.value)
      })
    })
  }
  return [mergedColumns, filledColumns, realScrollWidth]
}

export default useColumns
