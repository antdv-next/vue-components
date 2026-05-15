import type { CSSProperties } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent, ref } from 'vue'

export interface ContentProps {
  listPrefixCls: string
  height: number
  topNoticeHeight?: number
  topNoticeWidth?: number
  className?: string
  style?: CSSProperties
}

interface ContentStyle extends CSSProperties {
  '--top-notificiation-height': string
  '--top-notificiation-width': string
}

const Content = defineComponent<ContentProps>(
  (props, { slots, expose }) => {
    const contentRef = ref<HTMLDivElement | null>(null)
    let prevHeight = props.height

    expose({
      nativeElement: contentRef,
    })

    return () => {
      const {
        listPrefixCls,
        height,
        topNoticeHeight = 0,
        topNoticeWidth = 0,
        className,
        style,
      } = props

      const heightStatus = height < prevHeight ? 'decrease' : 'increase'
      prevHeight = height

      const contentPrefixCls = `${listPrefixCls}-content`
      const contentStyle: ContentStyle = {
        ...style,
        height,
        '--top-notificiation-height': `${topNoticeHeight}px`,
        '--top-notificiation-width': `${topNoticeWidth}px`,
      }

      return (
        <div
          ref={contentRef}
          class={clsx(contentPrefixCls, `${contentPrefixCls}-${heightStatus}`, className)}
          style={contentStyle}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
  {
    name: 'NotificationListContent',
    inheritAttrs: false,
  },
)

export default Content
