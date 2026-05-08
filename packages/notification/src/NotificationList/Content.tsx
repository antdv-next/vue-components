import type { CSSProperties, PropType, TransitionGroupProps } from 'vue'
import { classNames as clsx } from '@v-c/util'
import { defineComponent, h, shallowRef, TransitionGroup } from 'vue'

export interface ContentProps {
  listPrefixCls: string
  height: number
  topNoticeHeight?: number
  topNoticeWidth?: number
  class?: string
  style?: CSSProperties
  motionProps?: TransitionGroupProps
  onAfterLeave?: () => void
}

const Content = defineComponent({
  name: 'NotificationListContent',
  inheritAttrs: false,
  props: {
    listPrefixCls: { type: String, required: true },
    height: { type: Number, required: true },
    topNoticeHeight: { type: Number, default: 0 },
    topNoticeWidth: { type: Number, default: 0 },
    class: { type: String, default: undefined },
    style: { type: Object as PropType<CSSProperties>, default: undefined },
    motionProps: { type: Object as PropType<TransitionGroupProps>, default: undefined },
    onAfterLeave: { type: Function as PropType<() => void>, default: undefined },
  },
  setup(props, { slots, expose }) {
    let prevHeight = props.height
    const innerRef = shallowRef<HTMLElement | null>(null)
    expose({
      get nativeElement() {
        return innerRef.value
      },
    })

    return () => {
      const {
        listPrefixCls,
        height,
        topNoticeHeight,
        topNoticeWidth,
        class: className,
        style,
        motionProps,
        onAfterLeave,
      } = props
      const heightStatus: 'increase' | 'decrease' = height < prevHeight ? 'decrease' : 'increase'
      prevHeight = height

      const contentPrefixCls = `${listPrefixCls}-content`
      const contentStyle: CSSProperties & Record<string, any> = {
        ...style,
        'height': `${height}px`,
        '--top-notificiation-height': `${topNoticeHeight ?? 0}px`,
        '--top-notificiation-width': `${topNoticeWidth ?? 0}px`,
      }
      const contentClass = clsx(
        contentPrefixCls,
        `${contentPrefixCls}-${heightStatus}`,
        className,
      )

      return h(
        TransitionGroup,
        {
          tag: 'div',
          appear: true,
          ...motionProps,
          ref: (el: any) => {
            innerRef.value = (el?.$el ?? el) as HTMLElement | null
          },
          class: contentClass,
          style: contentStyle,
          onAfterLeave,
        },
        () => slots.default?.(),
      )
    }
  },
})

export default Content
