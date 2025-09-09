import type { InjectionKey } from 'vue'
import { defineComponent, inject, provide } from 'vue'

export const IdContext: InjectionKey<string> = Symbol.for('MenuId')

export const IdContextProvider = defineComponent({
  name: 'IdContextProvider',
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    provide(IdContext, props.value)
    return () => slots.default?.()
  },
})

export function getMenuId(uuid: string, eventKey: string) {
  if (uuid === undefined) {
    return null
  }
  return `${uuid}-${eventKey}`
}

/**
 * Get `data-menu-id`
 */
export function useMenuId(eventKey: string) {
  const id = inject(IdContext) || ''
  return getMenuId(id, eventKey)
}
