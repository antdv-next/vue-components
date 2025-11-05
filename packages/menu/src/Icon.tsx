import type { VueNode } from '@v-c/util/dist/type'
import type { RenderIconInfo, RenderIconType } from './interface'

export interface IconProps {
  icon?: RenderIconType
  props: RenderIconInfo
  children?: VueNode
}

export default function Icon({ icon, props, children }: IconProps) {
  if (icon === null || icon === false) {
    return null
  }

  let iconNode: VueNode

  if (typeof icon === 'function') {
    iconNode = (icon as (info: RenderIconInfo) => VueNode)(props)
  }
  else if (icon !== undefined && icon !== true) {
    iconNode = icon
  }

  return iconNode ?? children ?? null
}
