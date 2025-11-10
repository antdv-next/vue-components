import type { RenderIconInfo, RenderIconType } from './interface.ts'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { createVNode, defineComponent, isVNode } from 'vue'

export interface IconProps {
  icon?: RenderIconType
  props?: RenderIconInfo
}

const Icon = defineComponent<IconProps>(
  (props, { slots }) => {
    return () => {
      const { icon, props: iconProps } = props
      let iconNode: any
      if (icon === null || icon === false) {
        return null
      }
      if (typeof icon === 'function') {
        const childIcons = (icon as any)(iconProps)
        const childArray = Array.isArray(childIcons) ? childIcons : [childIcons]
        const iconChild = filterEmpty(childArray)?.[0]
        if (isVNode(iconChild)) {
          iconNode = createVNode(iconChild)
        }
        else {
          iconNode = iconChild
        }
      }
      else if (typeof icon !== 'boolean') {
        iconNode = icon
      }
      return iconNode || slots.default?.(iconProps) || null
    }
  },
)

export default Icon
