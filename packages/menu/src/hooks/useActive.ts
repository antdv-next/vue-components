import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { useMenuContext } from '../context/MenuContext'
import type { MenuHoverEventHandler } from '../interface'

interface ActiveObj {
  active: ComputedRef<boolean>
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
}

export default function useActive(
  eventKey: string,
  disabled: boolean,
  onMouseEnter?: MenuHoverEventHandler,
  onMouseLeave?: MenuHoverEventHandler,
): ActiveObj {
  const context = useMenuContext()

  const active = computed(() => context?.value?.activeKey === eventKey)

  if (disabled) {
    return {
      active,
    }
  }

  return {
    active,
    onMouseEnter: (domEvent: MouseEvent) => {
      onMouseEnter?.({ key: eventKey, domEvent })
      context?.value?.onActive(eventKey)
    },
    onMouseLeave: (domEvent: MouseEvent) => {
      onMouseLeave?.({ key: eventKey, domEvent })
      context?.value?.onInactive(eventKey)
    },
  }
}
