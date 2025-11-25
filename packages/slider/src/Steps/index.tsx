import type { CSSProperties } from 'vue'
import type { InternalMarkObj } from '../Marks'
import { computed, defineComponent } from 'vue'
import { useInjectSlider } from '../context'
import Dot from './Dot'

export interface StepsProps {
  prefixCls: string
  marks: InternalMarkObj[]
  dots?: boolean
  style?: CSSProperties | ((dotValue: number) => CSSProperties)
  activeStyle?: CSSProperties | ((dotValue: number) => CSSProperties)
}

const Steps = defineComponent<StepsProps>((props, { attrs }) => {
  const sliderContext = useInjectSlider()

  const stepDots = computed<number[]>(() => {
    const { max, min, step } = sliderContext.value
    const { marks, dots } = props

    const dotSet = new Set<number>()

    // Add marks
    marks.forEach((mark) => {
      dotSet.add(mark.value)
    })

    // Fill dots
    if (dots && step !== null) {
      let current = min
      while (current <= max) {
        dotSet.add(current)
        current += step!
      }
    }

    return Array.from(dotSet)
  })

  return () => {
    const { prefixCls, activeStyle } = props

    return (
      <div class={`${prefixCls}-step`}>
        {stepDots.value.map(dotValue => (
          <Dot
            prefixCls={prefixCls}
            key={dotValue}
            value={dotValue}
            style={{ ...attrs.style as CSSProperties }}
            activeStyle={activeStyle}
          />
        ))}
      </div>
    )
  }
})
export default Steps
