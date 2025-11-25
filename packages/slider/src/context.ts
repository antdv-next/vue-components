import type { InjectionKey, ShallowRef } from 'vue'
import type { AriaValueFormat, Direction, SliderClassNames, SliderStyles } from './interface'
import { inject, provide, shallowRef } from 'vue'

export interface SliderContextProps {
  min: ShallowRef<number>
  max: ShallowRef<number>
  includedStart: ShallowRef<number>
  includedEnd: ShallowRef<number>
  direction: ShallowRef<Direction>
  disabled?: boolean
  keyboard?: boolean
  included?: boolean
  step: ShallowRef<number | null>
  range?: boolean
  tabIndex: number | number[]
  ariaLabelForHandle?: string | string[]
  ariaLabelledByForHandle?: string | string[]
  ariaRequired?: boolean
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[]
  classNames: SliderClassNames
  styles: SliderStyles
}

const SliderContextKey: InjectionKey<SliderContextProps> = Symbol('SliderContext')

export const defaultSliderContextValue = {
  min: shallowRef(0),
  max: shallowRef(0),
  direction: shallowRef('ltr'),
  step: shallowRef(1),
  includedStart: shallowRef(0),
  includedEnd: shallowRef(0),
  tabIndex: 0,
  keyboard: true,
  styles: {},
  classNames: {},
}

export function useProviderSliderContext(ctx: SliderContextProps) {
  provide(SliderContextKey, ctx)
}
export function useInjectSlider(): SliderContextProps {
  return inject(SliderContextKey)!
}

export interface UnstableContextProps {
  onDragStart?: (info: {
    rawValues: number[]
    draggingIndex: number
    draggingValue: number
  }) => void
  onDragChange?: (info: {
    rawValues: number[]
    deleteIndex: number
    draggingIndex: number
    draggingValue: number
  }) => void
}

/** @private NOT PROMISE AVAILABLE. DO NOT USE IN PRODUCTION. */
export const UnstableContextKey: InjectionKey<UnstableContextProps> = Symbol('UnstableContext')

// 默认值
export const defaultUnstableContextValue: UnstableContextProps = {}
