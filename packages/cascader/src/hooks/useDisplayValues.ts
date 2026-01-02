import type { ComputedRef, Ref } from 'vue'
import type {
  CascaderProps,
  DefaultOptionType,
  InternalFieldNames,
  SingleValueType,
} from '../Cascader'
import { cloneVNode, computed, isVNode } from 'vue'
import { toPathKey } from '../utils/commonUtil'
import { toPathOptions } from '../utils/treeUtil'

export default (
  rawValues: Ref<SingleValueType[]>,
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
  multiple: Ref<boolean>,
  displayRender: Ref<CascaderProps['displayRender'] | undefined>,
): ComputedRef<any[]> => {
  return computed(() => {
    const mergedDisplayRender
      = displayRender.value
        || ((labels: any[]) => {
          const mergedLabels = multiple.value ? labels.slice(-1) : labels
          const split = ' / '

          if (mergedLabels.every(label => ['string', 'number'].includes(typeof label))) {
            return mergedLabels.join(split)
          }

          return mergedLabels.reduce((list: any[], label, index) => {
            const nextLabel = isVNode(label) ? cloneVNode(label, { key: index }) : label
            if (index === 0) {
              return [nextLabel]
            }
            return [...list, split, nextLabel]
          }, [])
        })

    return rawValues.value.map((valueCells) => {
      const valueOptions = toPathOptions(valueCells, options.value, fieldNames.value)

      const label = mergedDisplayRender(
        valueOptions.map(({ option, value }) => option?.[fieldNames.value.label] ?? value),
        valueOptions.map(({ option }) => option),
      )

      const value = toPathKey(valueCells)

      return {
        label,
        value,
        key: value,
        valueCells,
        disabled: valueOptions[valueOptions.length - 1]?.option?.disabled,
      }
    })
  })
}
