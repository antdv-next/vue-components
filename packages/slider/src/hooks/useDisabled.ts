import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export type IsHandleDisabled = (index: number) => boolean
export type GetDisabledState = (rawValues: number[]) => [disabled: boolean, hasDisabledHandle: boolean]

/**
 * Mirrors rc-slider#1069 `useDisabled`. Accepts either a boolean (the legacy
 * single-flag form) or a `boolean[]` (one entry per handle, missing entries
 * default to `false`). Returns:
 *
 *   - `isHandleDisabled(index)` — does THIS specific handle ignore input?
 *   - `getDisabledState(values)` — derive the global `disabled` flag (all
 *     handles disabled) and a `hasDisabledHandle` flag (any handle disabled)
 *     for a given value list.
 */
export default function useDisabled(
  rawDisabled: MaybeRefOrGetter<boolean | boolean[] | undefined>,
): {
    isHandleDisabled: IsHandleDisabled
    getDisabledState: GetDisabledState
  } {
  const isHandleDisabled: IsHandleDisabled = (index: number) => {
    const value = toValue(rawDisabled)
    if (typeof value === 'boolean')
      return value
    return value?.[index] ?? false
  }

  const getDisabledState: GetDisabledState = (rawValues: number[]) => {
    const value = toValue(rawDisabled)
    if (typeof value === 'boolean')
      return [!!value, !!value && rawValues.length > 0]
    return [
      rawValues.length > 0 && rawValues.every((_, index) => isHandleDisabled(index)),
      rawValues.some((_, index) => isHandleDisabled(index)),
    ]
  }

  return { isHandleDisabled, getDisabledState }
}

/**
 * Convenience wrapper that exposes the disabled-derived values as Vue
 * `computed`s for templates that need to react to changes.
 */
export function useDisabledRefs(
  rawDisabled: MaybeRefOrGetter<boolean | boolean[] | undefined>,
  rawValues: MaybeRefOrGetter<number[]>,
) {
  const { isHandleDisabled, getDisabledState } = useDisabled(rawDisabled)
  const state = computed(() => getDisabledState(toValue(rawValues)))
  return {
    isHandleDisabled,
    getDisabledState,
    disabled: computed(() => state.value[0]),
    hasDisabledHandle: computed(() => state.value[1]),
  }
}
