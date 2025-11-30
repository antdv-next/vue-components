import type { RawValueType } from '../BaseSelect'
import type { DefaultOptionType, LabelInValueType } from '../Select'
import { computed, shallowRef, watchEffect } from 'vue'

export default (
  labeledValues: () => LabelInValueType[],
  valueOptions: () => Map<RawValueType, DefaultOptionType>,
) => {
  const prevValueCache = shallowRef(new Map<RawValueType, LabelInValueType>())
  const prevOptionCache = shallowRef(new Map<RawValueType, DefaultOptionType>())

  const filledLabeledValues = computed(() => {
    const patchedValues = labeledValues().map((item) => {
      if (item.label === undefined) {
        return {
          ...item,
          label: prevValueCache.value.get(item.value)?.label,
        }
      }
      return item
    })

    return patchedValues
  })

  // 使用 watchEffect 处理缓存更新，避免在 computed 中产生副作用
  watchEffect(() => {
    const valueCache = new Map<RawValueType, LabelInValueType>()
    const optionCache = new Map<RawValueType, DefaultOptionType>()

    filledLabeledValues.value.forEach((item) => {
      valueCache.set(item.value, item)
      const optionItem = valueOptions().get(item.value) || prevOptionCache.value.get(item.value)
      if (optionItem) {
        optionCache.set(item.value, optionItem)
      }
    })

    prevValueCache.value = valueCache
    prevOptionCache.value = optionCache
  })

  const getOption = (val: RawValueType) =>
    valueOptions().get(val) || prevOptionCache.value.get(val)

  return [filledLabeledValues, getOption] as const
}
