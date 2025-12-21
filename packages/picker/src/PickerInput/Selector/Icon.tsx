import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, PropType } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { usePickerContext } from '../context'

export interface IconProps {
  icon?: VueNode
  type: 'suffix' | 'clear'
}

const Icon = defineComponent({
  name: 'Icon',
  inheritAttrs: false,
  props: {
    icon: { type: [Object, String] as PropType<VueNode> },
    type: { type: String as PropType<IconProps['type']>, required: true },
  },
  setup(props, { attrs }) {
    const ctx = usePickerContext()

    return () => {
      const { icon, type } = props

      if (!icon) {
        return null
      }

      const { prefixCls, classNames, styles } = ctx.value

      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs as any
      const mergedAttrStyle
        = attrStyle && typeof attrStyle === 'object'
          ? attrStyle as CSSProperties
          : {}

      return (
        <span
          {...restAttrs}
          class={clsx(`${prefixCls}-${type}`, classNames.suffix, attrClass)}
          style={{ ...(styles.suffix || {}), ...mergedAttrStyle }}
        >
          {icon}
        </span>
      )
    }
  },
})

export default Icon

export interface ClearIconProps extends Omit<IconProps, 'type'> {
  onClear: VoidFunction
}

export const ClearIcon = defineComponent({
  name: 'ClearIcon',
  inheritAttrs: false,
  props: {
    icon: { type: [Object, String] as PropType<VueNode> },
    onClear: { type: Function as PropType<VoidFunction>, required: true },
  },
  setup(props, { attrs }) {
    return () => {
      return (
        <Icon
          {...(attrs as any)}
          icon={props.icon}
          type="clear"
          role="button"
          onMousedown={(e: MouseEvent) => {
            e.preventDefault()
          }}
          onClick={(e: MouseEvent) => {
            e.stopPropagation()
            props.onClear()
          }}
        />
      )
    }
  },
})
