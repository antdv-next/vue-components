import type { CSSProperties } from 'vue'
import type { PanelProps } from './Panel'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, nextTick, shallowRef, Transition, watch } from 'vue'

import { offset } from '../../util'
import Panel from './Panel'

export type ContentProps = {
  motionName?: string
  ariaId: string
  onVisibleChanged: (visible: boolean) => void
} & PanelProps

const Content = defineComponent<ContentProps>(
  (props, { slots }) => {
    const dialogRef = shallowRef<HTMLDivElement>()

    const transformOrigin = shallowRef('')

    function onPrepare() {
      const { mousePosition } = props
      nextTick(() => {
        if (dialogRef.value) {
          const elementOffset = offset(dialogRef.value)
          transformOrigin.value = mousePosition && (mousePosition.x || mousePosition.y) ? `${mousePosition.x - elementOffset.left}px ${mousePosition.y - elementOffset.top}px` : ''
        }
      })
    }
    const animationVisible = shallowRef(props.visible)
    watch(() => props.visible, () => {
      if (props.visible) {
        animationVisible.value = true
      }
    })
    return () => {
      const {
        prefixCls,
        className,
        style,
        visible,
        destroyOnHidden,
        onVisibleChanged,
        ariaId,
        title,
        motionName,
      } = props
      // ============================= Style ==============================
      const contentStyle: CSSProperties = {}
      if (transformOrigin.value) {
        contentStyle.transformOrigin = transformOrigin.value
      }

      // ============================= Render =============================
      const transitionProps = getTransitionProps(motionName)
      return (
        <Transition
          {...transitionProps}
          onBeforeEnter={onPrepare}
          onAfterEnter={() => onVisibleChanged?.(true)}
          onAfterLeave={() => {
            onVisibleChanged?.(false)
            animationVisible.value = false
          }}
        >
          {
            (visible || !destroyOnHidden)
              ? (
                  <Panel
                    v-show={visible}
                    {...props}
                    animationVisible={animationVisible.value!}
                    v-slots={slots}
                    title={title}
                    ariaId={ariaId}
                    prefixCls={prefixCls}
                    style={{ ...style, ...contentStyle }}
                    class={[className]}
                    holderRef={(el) => {
                      dialogRef.value = el
                    }}
                  />
                )
              : null

          }
        </Transition>
      )
    }
  },
  {
    name: 'Content',
  },
)

export default Content
