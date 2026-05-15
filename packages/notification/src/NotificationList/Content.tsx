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
      // Force height to a string so Vue's style patcher always re-applies the
      // unit. Passing a plain number (e.g. 0 → 216) was getting silently
      // skipped during patch — the CSS variables on the same vnode style
      // were applied, but `height: 216` was not patched onto the DOM until
      // a manual `inst.update()` was invoked.
      const contentStyle: ContentStyle = {
        ...style,
        height: `${height}px`,
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
    // Declare runtime props so Vue tracks reactive reads inside the render
    // closure. Without this, `props.height` in `const { height } = props`
    // does not subscribe to updates, so the rendered `height: 0px` stays
    // stale even after position recomputes with measured node sizes.
    props: ['listPrefixCls', 'height', 'topNoticeHeight', 'topNoticeWidth', 'className', 'style'] as any,
  },
)

export default Content
