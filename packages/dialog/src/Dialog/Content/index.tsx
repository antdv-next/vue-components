import type { CSSProperties } from 'vue'
import type { PanelProps } from './Panel'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { defineComponent, nextTick, shallowRef, Transition, vShow, withDirectives } from 'vue'

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
    return () => {
      const {
        prefixCls,
        className,
        style,
        visible,
        destroyOnClose,
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
      const dom = (
        <Panel
          {...props}
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
      // 改造render函数
      const renderDom = () => {
        if (visible || !destroyOnClose) {
          return withDirectives(dom, [
            [vShow, visible],
          ])
        }
        return null
      }
      return (
        <Transition
          {...transitionProps}
          onBeforeEnter={onPrepare}
          onAfterEnter={() => onVisibleChanged?.(true)}
          onAfterLeave={() => onVisibleChanged?.(false)}
        >
          {renderDom()}
        </Transition>
      )
    }
  },
  {
    name: 'Content',
  },
)

export default Content
