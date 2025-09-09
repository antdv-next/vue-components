import type { MenuHoverEventHandler } from '../interface'
import { useInjectMenu } from '../context/MenuContext'

interface ActiveObj {
  active: boolean
  onMouseenter?: (e: MouseEvent) => void
  onMouseleave?: (e: MouseEvent) => void
}

export default function useActive(
  eventKey: string,
  disabled: boolean,
  onMouseenter?: MenuHoverEventHandler,
  onMouseleave?: MenuHoverEventHandler,
): ActiveObj {
  const {
    // Active
    activeKey,
    onActive,
    onInactive,
  } = useInjectMenu()

  const ret: ActiveObj = {
    active: activeKey === eventKey,
  }

  // Skip when disabled
  if (!disabled) {
    ret.onMouseenter = (domEvent) => {
      onMouseenter?.({
        key: eventKey,
        domEvent,
      })
      onActive(eventKey)
    }
    ret.onMouseleave = (domEvent) => {
      onMouseleave?.({
        key: eventKey,
        domEvent,
      })
      onInactive(eventKey)
    }
  }

  return ret
}
