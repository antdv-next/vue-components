import type { CSSProperties, PropType } from 'vue'
import type { OnStartMove } from '../interface'
import cls from 'classnames'
import { defineComponent } from 'vue'
import { useInjectSlider } from '../context'
import { getOffset } from '../util'

export interface TrackProps {
  prefixCls: string
  /** Replace with origin prefix concat className */
  replaceCls?: string
  start: number
  end: number
  index: number
  onStartMove?: OnStartMove
}

const Track = defineComponent({
  name: 'Track',
  props: {
    prefixCls: { type: String, required: true },
    replaceCls: { type: String },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    index: { type: Number, default: () => null },
    onStartMove: { type: Function as PropType<OnStartMove> },
  },
  setup(props, { attrs }) {
    const { direction, min, max, disabled, range, classNames } = useInjectSlider()

    // ============================ Events ============================
    const onInternalStartMove = (e: MouseEvent | TouchEvent) => {
      if (!disabled && props.onStartMove) {
        props.onStartMove(e, -1)
      }
    }

    // ============================ Render ============================
    const positionStyle: CSSProperties = {}

    return () => {
      const { prefixCls, index, onStartMove, replaceCls, start, end } = props

      const offsetStart = getOffset(start, min.value, max.value)
      const offsetEnd = getOffset(end, min.value, max.value)

      const trackPrefixCls = `${prefixCls}-track`
      const className
        = replaceCls
          || cls(
            trackPrefixCls,
            {
              [`${trackPrefixCls}-${index + 1}`]: index !== null && range,
              [`${prefixCls}-track-draggable`]: onStartMove,
            },
            classNames.track,
          )
      switch (direction.value) {
        case 'rtl':
          positionStyle.right = `${offsetStart * 100}%`
          positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`
          break

        case 'btt':
          positionStyle.bottom = `${offsetStart * 100}%`
          positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`
          break

        case 'ttb':
          positionStyle.top = `${offsetStart * 100}%`
          positionStyle.height = `${offsetEnd * 100 - offsetStart * 100}%`
          break

        default:
          positionStyle.left = `${offsetStart * 100}%`
          positionStyle.width = `${offsetEnd * 100 - offsetStart * 100}%`
      }
      return (
        <div
          class={className}
          style={{ ...positionStyle, ...attrs.style as CSSProperties }}
          onMousedown={onStartMove ? onInternalStartMove : undefined}
        />
      )
    }
  },
})

export default Track
