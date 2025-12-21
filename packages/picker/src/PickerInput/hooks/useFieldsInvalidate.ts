import type { Ref } from 'vue'
import type useInvalidate from './useInvalidate'
import { computed, ref } from 'vue'
import { fillIndex } from '../../utils/miscUtil'

/**
 * Used to control each fields invalidate status
 */
export default function useFieldsInvalidate<DateType extends object, ValueType extends DateType[]>(
  calendarValue: Ref<ValueType>,
  isInvalidateDate: ReturnType<typeof useInvalidate<DateType>>,
  allowEmpty: Ref<boolean[] | undefined> = ref([]),
) {
  const fieldsInvalidates = ref<[boolean, boolean]>([false, false])

  const onSelectorInvalid = (invalid: boolean, index: number) => {
    fieldsInvalidates.value = fillIndex(fieldsInvalidates.value, index, invalid)
  }

  /**
   * For the Selector Input to mark as `aria-disabled`
   */
  const submitInvalidates = computed(() => {
    return fieldsInvalidates.value.map((invalid, index) => {
      // If typing invalidate
      if (invalid) {
        return true
      }

      const current = calendarValue.value[index]

      // Not check if all empty
      if (!current) {
        return false
      }

      // Not allow empty
      if (!allowEmpty.value?.[index] && !current) {
        return true
      }

      // Invalidate
      if (current && isInvalidateDate(current, { activeIndex: index })) {
        return true
      }

      return false
    }) as [boolean, boolean]
  })

  return [submitInvalidates, onSelectorInvalid] as const
}
