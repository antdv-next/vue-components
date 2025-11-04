import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, Transition } from 'vue'

export interface MaskProps {
  prefixCls: string
  open?: boolean
  zIndex?: number
  mask?: boolean

  // Motion
  motion?: CSSMotionProps

  mobile?: boolean
}

const Mask = defineComponent<MaskProps>(
  (props, { attrs }) => {
    return () => {
      const { prefixCls, open, zIndex, mask, motion, mobile } = props
      if (!mask) {
        return null
      }
      const transitionProps = getTransitionProps(motion?.name, motion)
      return (
        <Transition {...transitionProps}>
          {open
            ? (
                <div
                  style={{ zIndex }}
                  class={[
                    `${prefixCls}-mask`,
                    mobile && `${prefixCls}-mask-mobile`,
                    (attrs as any).class,
                  ]}
                />
              )
            : null }
        </Transition>
      )
    }
  },
  {
    inheritAttrs: false,
    name: 'PopupMask',
  },
)
export default Mask
