import type { Ref } from 'vue'
import type { MenuHoverEventHandler } from '../interface.ts'
import { computed, watchEffect } from 'vue'
import { useMenuContext } from '../context/MenuContext.tsx'

interface ActiveObj {
  active: Ref<boolean>
  onMouseEnter?: (event: MouseEvent) => void
  onMouseLeave?: (event: MouseEvent) => void
}
export default function useActive(
  eventKey: Ref<string>,
  disabled: Ref<boolean>,
  onMouseEnter?: MenuHoverEventHandler,
  onMouseLeave?: MenuHoverEventHandler,
) {
  const menuContext = useMenuContext()

  const active = computed(() => menuContext?.value?.activeKey === eventKey.value)

  const ret: ActiveObj = {
    active,
  }

  watchEffect(() => {
    if (!disabled.value) {
      ret.onMouseEnter = (domEvent: MouseEvent) => {
        onMouseEnter?.({
          key: eventKey.value,
          domEvent,
        })
        menuContext?.value?.onActive?.(eventKey.value)
      }
      ret.onMouseLeave = (domEvent: MouseEvent) => {
        onMouseLeave?.({
          key: eventKey.value,
          domEvent,
        })
        menuContext?.value?.onInactive?.(eventKey.value)
      }
    }
  })
  return ret
}
