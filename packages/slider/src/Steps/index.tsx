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
  const { min, max, step } = useInjectSlider()

  return () => {
    const { prefixCls, marks, dots, activeStyle } = props

    const stepDots = computed<number[]>(() => {
      const dotSet = new Set<number>()

      // Add marks
      marks.forEach((mark) => {
        dotSet.add(mark.value)
      })

      // Fill dots
      if (dots && step !== null) {
        let current = min.value
        while (current <= max.value) {
          dotSet.add(current)
          current += step.value!
        }
      }

      return Array.from(dotSet)
    })

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
