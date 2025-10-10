import type { CSSProperties, HTMLAttributes } from 'vue'
import { getTransitionProps } from '@v-c/util/dist/utils/transition.ts'
import { classNames } from '@v-c/util'
import { defineComponent, Transition } from 'vue'

export interface MaskProps {
  prefixCls: string
  visible: boolean
  motionName?: string
  style?: CSSProperties
  maskProps?: HTMLAttributes
  className?: string
}

const Mask = defineComponent<MaskProps>(
  (props) => {
    return () => {
      const {
        maskProps,
        prefixCls,
        className,
        style,
        visible,
        motionName,
      } = props
      return (
        <Transition
          {...getTransitionProps(motionName!)}
          key="mask"
        >
          {visible && (
            <div
              style={[style]}
              class={classNames(`${prefixCls}-mask`, className)}
              {...maskProps}
            />
          )}
        </Transition>
      )
    }
  },
  {
    name: 'Mask',
  },
)

export default Mask
