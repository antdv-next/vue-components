import warning, { noteOnce } from '@v-c/util/dist/warning'
import { flattenChildren } from '@v-c/util/dist/props-util'
import type { VNode } from 'vue'
import { isMultiple } from '../BaseSelect'
import type {
  BaseOptionType,
  DefaultOptionType,
  FieldNames,
  LabelInValueType,
  RawValueType,
  SelectProps,
} from '../Select'
import { toArray } from './commonUtil'
import { convertChildrenToData } from './legacyUtil'

function warningProps(props: SelectProps) {
  const {
    mode,
    options,
    children,
    backfill,
    allowClear,
    placeholder,
    getInputElement,
    showSearch,
    onSearch,
    defaultOpen,
    autoFocus,
    labelInValue,
    value,
    optionLabelProp,
  } = props

  const multiple = isMultiple(mode as any)
  const mergedShowSearch = showSearch !== undefined ? showSearch : multiple || mode === 'combobox'
  const mergedOptions = options || convertChildrenToData(children as any)

  warning(
    mode !== 'tags' || mergedOptions.every((opt: { disabled?: boolean }) => !opt.disabled),
    'Please avoid setting option to disabled in tags mode since user can always type text as tag.',
  )

  if (mode === 'tags' || mode === 'combobox') {
    const hasNumberValue = mergedOptions.some((item: any) => {
      if (item.options) {
        return item.options.some(
          (opt: BaseOptionType) => typeof ('value' in opt ? (opt as any).value : opt.key) === 'number',
        )
      }
      return typeof ('value' in item ? (item as any).value : (item as any).key) === 'number'
    })

    warning(
      !hasNumberValue,
      '`value` of Option should not use number type when `mode` is `tags` or `combobox`.',
    )
  }

  warning(
    mode !== 'combobox' || !optionLabelProp,
    '`combobox` mode not support `optionLabelProp`. Please set `value` on Option directly.',
  )

  warning(mode === 'combobox' || !backfill, '`backfill` only works with `combobox` mode.')

  warning(
    mode === 'combobox' || !getInputElement,
    '`getInputElement` only work with `combobox` mode.',
  )

  noteOnce(
    mode !== 'combobox' || !getInputElement || !allowClear || !placeholder,
    'Customize `getInputElement` should customize clear and placeholder logic instead of configuring `allowClear` and `placeholder`.',
  )

  if (onSearch && !mergedShowSearch && mode !== 'combobox' && mode !== 'tags') {
    warning(false, '`onSearch` should work with `showSearch` instead of use alone.')
  }

  noteOnce(
    !defaultOpen || autoFocus,
    '`defaultOpen` makes Select open without focus which means it will not close by click outside. You can set `autoFocus` if needed.',
  )

  if (value !== undefined && value !== null) {
    const values = toArray<RawValueType | LabelInValueType>(value as any)
    warning(
      !labelInValue ||
        values.every((val) => typeof val === 'object' && ('key' in (val as any) || 'value' in (val as any))),
      '`value` should in shape of `{ value: string | number, label?: VueNode }` when you set `labelInValue` to `true`',
    )

    warning(
      !multiple || Array.isArray(value),
      '`value` should be array when `mode` is `multiple` or `tags`',
    )
  }

  if (children) {
    let invalidateChildType: any = null
    const childNodes = flattenChildren(children as VNode[])
    childNodes.some((node: any) => {
      if (!node || !node.type) {
        return false
      }
      const type: any = node.type
      if (type.isSelectOption) {
        return false
      }
      if (type.isSelectOptGroup) {
        const child = flattenChildren(getSlotChildren(node)).every((sub: any) => {
          if (!sub || !sub.type || (sub.type as any).isSelectOption) {
            return true
          }
          invalidateChildType = sub.type
          return false
        })
        if (child) {
          return false
        }
        return true
      }
      invalidateChildType = type
      return true
    })

    if (invalidateChildType) {
      warning(
        false,
        `\`children\` should be \`Select.Option\` or \`Select.OptGroup\` instead of \`${
          (invalidateChildType as any).displayName || (invalidateChildType as any).name || invalidateChildType
        }\`.`,
      )
    }
  }
}

function getSlotChildren(node: VNode) {
  const children = node.children as any
  if (typeof children === 'function') {
    return children()
  }
  if (children && typeof children === 'object' && 'default' in children) {
    return (children as any).default?.()
  }
  return children
}

export function warningNullOptions(options: DefaultOptionType[], fieldNames: FieldNames) {
  if (options) {
    const recursiveOptions = (optionsList: DefaultOptionType[], inGroup: boolean = false) => {
      for (let i = 0; i < optionsList.length; i++) {
        const option = optionsList[i]

        if ((option as any)[fieldNames?.value] === null) {
          warning(false, '`value` in Select options should not be `null`.')
          return true
        }

        if (
          !inGroup
          && Array.isArray((option as any)[fieldNames?.options])
          && recursiveOptions((option as any)[fieldNames?.options], true)
        ) {
          break
        }
      }
    }

    recursiveOptions(options)
  }
}

export default warningProps
