import type { FunctionalComponent, VNode } from 'vue'
import type { BaseSliderProps } from '../components/Slider'
import Slider from '../components/Slider'

export interface Components {
  slider?: VNode<BaseSliderProps>
}

type RequiredComponents = Required<Components>

export default function useComponent(
  components?: Components,
): [Slider: RequiredComponents['slider'] | FunctionalComponent<BaseSliderProps>] {
  const { slider } = components || {}

  return [slider || Slider]
}
