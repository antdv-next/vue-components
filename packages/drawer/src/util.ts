import type { DrawerProps } from './Drawer'
import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import warning from '@v-c/util/dist/warning'

export function parseWidthHeight(value?: number | string) {
  if (typeof value === 'string' && String(Number(value)) === value) {
    warning(
      false,
      'Invalid value type of `width` or `height` which should be number type instead.',
    )
    return Number(value)
  }

  return value
}

export function warnCheck(props: DrawerProps) {
  warning(
    !('wrapperClassName' in props),
    `'wrapperClassName' is removed. Please use 'rootClassName' instead.`,
  )

  warning(
    canUseDom() || !props.open,
    `Drawer with 'open' in SSR is not work since no place to createPortal. Please move to 'useEffect' instead.`,
  )
}
