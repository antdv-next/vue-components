import type { Ref } from 'vue'
import type { RawValueType } from '../interface'
import type { DefaultOptionType, LabelInValueType } from '../Select'
import { computed, shallowRef } from 'vue'

/**
 * Cache `value` related LabeledValue & options.
 */
export default function useCache(
  labeledValues: Ref<LabelInValueType[]>,
  valueOptions: Ref<Map<RawValueType, DefaultOptionType>>,
): [Ref<LabelInValueType[]>, (val: RawValueType) => DefaultOptionType | undefined] {
  const cacheRef = shallowRef<{
    values: Map<RawValueType, LabelInValueType>
    options: Map<RawValueType, DefaultOptionType>
  }>({
    values: new Map<RawValueType, LabelInValueType>(),
    options: new Map<RawValueType, DefaultOptionType>(),
  })

  const filledLabeledValues = computed<LabelInValueType[]>(() => {
    const { values: prevValueCache, options: prevOptionCache } = cacheRef.value

    // Fill label by cache
    const patchedValues = labeledValues.value.map((item) => {
      if (item.label === undefined) {
        return {
          ...item,
          label: prevValueCache.get(item.value)?.label,
        }
      }

      return item
    })

    // Refresh cache
    const valueCache = new Map<RawValueType, LabelInValueType>()
    const optionCache = new Map<RawValueType, DefaultOptionType>()

    patchedValues.forEach((item) => {
      valueCache.set(item.value, item)
      const option = valueOptions.value.get(item.value) || prevOptionCache.get(item.value)
      if (option) {
        optionCache.set(item.value, option)
      }
    })

    cacheRef.value = {
      values: valueCache,
      options: optionCache,
    }

    return patchedValues
  })

  const getOption = (val: RawValueType): DefaultOptionType | undefined => {
    return valueOptions.value.get(val) || cacheRef.value.options.get(val)
  }

  return [filledLabeledValues, getOption]
}
