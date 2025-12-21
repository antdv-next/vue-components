import type { Ref } from 'vue'
import type { OpenConfig } from '../../interface'
import { computed } from 'vue'
import useDelayState from './useDelayState'

/**
 * Control the open state.
 * Will not close if activeElement is on the popup.
 */
export default function useOpen(
  open: Ref<boolean | undefined>,
  defaultOpen: Ref<boolean | undefined>,
  disabledList: Ref<boolean[] | undefined>,
  onOpenChange?: (open: boolean) => void,
) {
  const mergedOpen = computed(() => (disabledList.value?.every(disabled => disabled) ? false : open.value))

  // Delay for handle the open state, in case fast shift from `open` -> `close` -> `open`
  const [rafOpen, setRafOpen] = useDelayState(mergedOpen, defaultOpen.value || false, onOpenChange)

  function setOpen(next: boolean, config: OpenConfig = {}) {
    if (!config.inherit || rafOpen.value) {
      setRafOpen(next, config.force)
    }
  }

  return [rafOpen, setOpen] as const
}
