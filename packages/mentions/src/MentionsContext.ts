import type { VueNode } from '@v-c/util'
import type { InjectionKey, Ref } from 'vue'
import type { OptionProps } from './Option.tsx'
import { computed, defineComponent, inject, provide, ref } from 'vue'

export interface MentionsContextProps {
  notFoundContent: VueNode
  activeIndex: number
  setActiveIndex: (index: number) => void
  selectOption: (option: OptionProps) => void
  onFocus: (e: FocusEvent) => void
  onBlur: (e: FocusEvent) => void
  onScroll: (e: UIEvent) => void
}

const MentionsContextKey: InjectionKey<Ref<MentionsContextProps>> = Symbol('MentionsContext')

export function useMentionsContext() {
  return inject(MentionsContextKey, ref() as Ref<MentionsContextProps>)
}

export const MentionsProvider = defineComponent<{
  value: MentionsContextProps
}>(
  (props, { slots }) => {
    const value = computed(() => props.value)
    provide(MentionsContextKey, value)
    return () => {
      return slots?.default?.()
    }
  },
  {
    name: 'MentionsProvider',
    inheritAttrs: false,
    props: ['value'],
  },
)
