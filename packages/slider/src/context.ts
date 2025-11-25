import type { InjectionKey, Ref } from 'vue'
import type { AriaValueFormat, Direction, SliderClassNames, SliderStyles } from './interface'
import { defineComponent, inject, provide, ref } from 'vue'

export interface SliderContextProps {
  min: number
  max: number
  includedStart: number
  includedEnd: number
  direction: Direction
  disabled?: boolean
  keyboard?: boolean
  included?: boolean
  step: number | null
  range?: boolean
  tabIndex: number | number[]
  ariaLabelForHandle?: string | string[]
  ariaLabelledByForHandle?: string | string[]
  ariaRequired?: boolean
  ariaValueTextFormatterForHandle?: AriaValueFormat | AriaValueFormat[]
  classNames: SliderClassNames
  styles: SliderStyles
}

const SliderContextKey: InjectionKey<Ref<SliderContextProps>> = Symbol('SliderContext')

export const defaultSliderContextValue = {
  min: 0,
  max: 0,
  direction: 'ltr',
  step: 1,
  includedStart: 0,
  includedEnd: 0,
  tabIndex: 0,
  keyboard: true,
  styles: {},
  classNames: {},
}

export function useProviderSliderContext(ctx: Ref<SliderContextProps>) {
  provide(SliderContextKey, ctx)
}
export function useInjectSlider() {
  return inject(SliderContextKey, ref({} as SliderContextProps))
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

export const UnstableProvider = defineComponent((props, { slots }) => {
  provide(UnstableContextKey, props.value)
  return () => {
    return slots?.default?.()
  }
}, {
  props: ['value'],
})

export function useUnstableContext() {
  return inject(UnstableContextKey, {} as UnstableContextProps)
}
