import type { RenderIconInfo, RenderIconType } from './interface.ts'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { defineComponent } from 'vue'

export interface IconProps {
  icon?: RenderIconType
  props?: RenderIconInfo
}

const Icon = defineComponent<IconProps>(
  (props, { slots }) => {
    return () => {
      const { icon, props: iconProps } = props
      const children = slots.default?.()
      let iconNode: any
      if (icon === null || icon === false) {
        return null
      }
      if (typeof icon === 'function') {
        const childIcons = (icon as any)(iconProps)
        if (!childIcons) {
          iconNode = null
          return children
        }
        const childArray = childIcons ? (Array.isArray(childIcons) ? childIcons : [childIcons]) : []
        iconNode = filterEmpty(childArray)
      }
      else if (typeof icon !== 'boolean') {
        iconNode = icon
      }
      return iconNode || children || null
    }
  },
)

export default Icon
