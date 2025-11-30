import { computed, ref } from 'vue'
import type { RawValueType } from '../BaseSelect'
import type { DefaultOptionType, LabelInValueType } from '../Select'

export default (
  labeledValues: () => LabelInValueType[],
  valueOptions: () => Map<RawValueType, DefaultOptionType>,
) => {
  const cacheRef = ref({
    values: new Map<RawValueType, LabelInValueType>(),
    options: new Map<RawValueType, DefaultOptionType>(),
  })

  const filledLabeledValues = computed(() => {
    const { values: prevValueCache, options: prevOptionCache } = cacheRef.value

    const patchedValues = labeledValues().map((item) => {
      if (item.label === undefined) {
        return {
          ...item,
          label: prevValueCache.get(item.value)?.label,
        }
      }
      return item
    })

    const valueCache = new Map<RawValueType, LabelInValueType>()
    const optionCache = new Map<RawValueType, DefaultOptionType>()

    patchedValues.forEach((item) => {
      valueCache.set(item.value, item)
      const optionItem = valueOptions().get(item.value) || prevOptionCache.get(item.value)
      if (optionItem) {
        optionCache.set(item.value, optionItem)
      }
    })

    cacheRef.value.values = valueCache
    cacheRef.value.options = optionCache

    return patchedValues
  })

  const getOption = (val: RawValueType) =>
    valueOptions().get(val) || cacheRef.value.options.get(val)

  return [filledLabeledValues, getOption] as const
}
