import type { Ref } from 'vue'
import type { CountConfig, InputProps, ShowCountFormatter } from '../interface'
import { computed } from 'vue'

type ForcedCountConfig = Omit<CountConfig, 'show'>
  & Pick<Required<CountConfig>, 'strategy'> & {
    show: boolean
    showFormatter?: ShowCountFormatter
  }

/**
 * Cut `value` by the `count.max` prop.
 */
export function inCountRange(value: string, countConfig: ForcedCountConfig) {
  if (!countConfig.max) {
    return true
  }

  const count = countConfig.strategy(value)
  return count <= countConfig.max
}

export default function useCount(
  count?: Ref<CountConfig>,
  showCount?: Ref<InputProps['showCount']>,
) {
  return computed(() => {
    let mergedConfig: CountConfig = {}

    if (showCount?.value) {
      mergedConfig.show
        = typeof showCount.value === 'object' && showCount.value?.formatter
          ? showCount.value?.formatter
          : !!showCount.value
    }

    mergedConfig = {
      ...mergedConfig,
      ...count?.value,
    }

    const { show, ...rest } = mergedConfig!

    return {
      ...rest,
      show: !!show,
      showFormatter: typeof show === 'function' ? show : undefined,
      strategy: rest.strategy || (value => value.length),
    }
  })
}
