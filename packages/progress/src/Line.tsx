import type { ProgressProps } from './interface.ts'
import { defineComponent } from 'vue'
import { defaultProps, useTransitionDuration } from './common.ts'

const Line = defineComponent<ProgressProps>(
  (props = defaultProps) => {
    const paths = useTransitionDuration()

    return () => {
      const {
        className,
        percent,
        prefixCls,
        strokeColor,
        strokeLinecap,
        strokeWidth,
        style,
        trailColor,
        trailWidth,
        transition,
        ...restProps
      } = props

      delete restProps.gapPosition
      const percentList = Array.isArray(percent) ? percent : [percent]
      const strokeColorList = Array.isArray(strokeColor) ? strokeColor : [strokeColor]

      const center = strokeWidth / 2
      const right = 100 - strokeWidth / 2
      const pathString = `M ${strokeLinecap === 'round' ? center : 0},${center}
         L ${strokeLinecap === 'round' ? right : 100},${center}`
      const viewBoxString = `0 0 100 ${strokeWidth}`
      const stackPtg = 0
      return <svg></svg>
    }
  },
  {
    name: 'Line',
  },
)

export default Line
