import type { RenderIconInfo, RenderIconType } from './interface.ts'
import { createVNode, defineComponent } from 'vue'

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
        iconNode = createVNode((icon as any)(), {
          ...iconProps,
        })
      }
      else if (typeof icon !== 'boolean') {
        iconNode = icon
      }
      return iconNode || slots.default?.() || null
    }
  },
)

export default Icon
