import type { ComputedRef, Ref } from 'vue'
import type { DefaultOptionType, InternalFieldNames, SearchConfig } from '../Cascader'
import { computed } from 'vue'

export const SEARCH_MARK = '__vc_cascader_search_mark__'

const defaultFilter: SearchConfig['filter'] = (search, options, { label = '' }) =>
  options.some(opt => String(opt[label]).toLowerCase().includes(search.toLowerCase()))

const defaultRender: SearchConfig['render'] = (_inputValue, path, _prefixCls, fieldNames) =>
  path.map(opt => opt[fieldNames.label as string]).join(' / ')

function useSearchOptions(search: Ref<string>, options: Ref<DefaultOptionType[]>, fieldNames: Ref<InternalFieldNames>, prefixCls: Ref<string>, config: Ref<SearchConfig>, enableHalfPath?: Ref<boolean>): ComputedRef<DefaultOptionType[]> {
  return computed(() => {
    const mergedSearch = search.value
    const mergedOptions = options.value
    const mergedFieldNames = fieldNames.value
    const mergedPrefixCls = prefixCls.value
    const { filter = defaultFilter, render = defaultRender, limit = 50, sort } = config.value

    const filteredOptions: DefaultOptionType[] = []
    if (!mergedSearch) {
      return []
    }

    function dig(
      list: DefaultOptionType[],
      pathOptions: DefaultOptionType[],
      parentDisabled = false,
    ) {
      list.forEach((option) => {
        // Perf saving when `sort` is disabled and `limit` is provided
        if (!sort && limit !== false && limit > 0 && filteredOptions.length >= limit) {
          return
        }

        const connectedPathOptions = [...pathOptions, option]
        const children = option[mergedFieldNames.children]

        const mergedDisabled = parentDisabled || option.disabled

        // If current option is filterable
        if (
          // If is leaf option
          !children
          || children.length === 0
          // If is changeOnSelect or multiple
          || enableHalfPath?.value
        ) {
          if (filter?.(mergedSearch, connectedPathOptions, { label: mergedFieldNames.label })) {
            filteredOptions.push({
              ...option,
              disabled: mergedDisabled,
              [mergedFieldNames.label as 'label']: render?.(
                mergedSearch,
                connectedPathOptions,
                mergedPrefixCls,
                mergedFieldNames,
              ),
              [SEARCH_MARK]: connectedPathOptions,
              [mergedFieldNames.children]: undefined,
            })
          }
        }

        if (children) {
          dig(
            option[mergedFieldNames.children] as DefaultOptionType[],
            connectedPathOptions,
            mergedDisabled,
          )
        }
      })
    }

    dig(mergedOptions, [])

    // Do sort
    if (sort) {
      filteredOptions.sort((a, b) => {
        return sort(a[SEARCH_MARK], b[SEARCH_MARK], mergedSearch, mergedFieldNames)
      })
    }

    return limit !== false && limit > 0
      ? filteredOptions.slice(0, limit as number)
      : filteredOptions
  })
}

export default useSearchOptions
