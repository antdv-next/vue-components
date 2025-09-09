import type { RenderIconInfo, RenderIconType } from './interface'
import { defineComponent } from 'vue'

export interface IconProps extends RenderIconInfo {
  icon?: RenderIconType
}

export default defineComponent({
  name: 'Icon',
  inheritAttrs: false,
  props: {
    icon: {
      type: [Function, Object, Boolean],
    },
    isSelected: Boolean,
    isOpen: Boolean,
    isSubMenu: Boolean,
    disabled: Boolean,
  },
  setup(props, { slots }) {
    return () => {
      const { icon, ...iconProps } = props
      let iconNode

      if (icon === null || icon === false) {
        return null
      }

      if (typeof icon === 'function') {
        iconNode = (
          <>
            <icon {...iconProps} />
          </>
        )
      }
      else if (typeof icon !== 'boolean') {
        // Compatible for origin definition
        iconNode = icon
      }

      return iconNode || slots.default?.() || null
    }
  },
})
