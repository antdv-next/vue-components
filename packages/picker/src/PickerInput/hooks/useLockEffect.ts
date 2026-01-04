import type { Ref } from 'vue'
import { watch } from 'vue'
import { raf } from '../Selector/util'

/**
 * Trigger `callback` immediately when `condition` is `true`.
 * But trigger `callback` in next frame when `condition` is `false`.
 */
export default function useLockEffect(
  condition: Ref<boolean | undefined>,
  callback: (next: boolean) => void,
) {
  watch(condition, (val) => {
    if (val) {
      callback(val)
    }
    else {
      raf(() => {
        callback(!!val)
      })
    }
  }, { flush: 'post' })
}
