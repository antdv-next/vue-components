import type { VNode } from 'vue'
import type { BaseSliderProps } from '../components/Slider'
import Slider from '../components/Slider'

export interface Components {
  slider?: VNode<BaseSliderProps>
}

export default function useComponent(
  components?: Components,
) {
  const { slider } = components || {}

  return [slider || Slider] as unknown as [any]
}
