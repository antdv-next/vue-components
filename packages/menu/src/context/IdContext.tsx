import type { InjectionKey, Ref } from 'vue'
import { computed, defineComponent, inject, provide, ref } from 'vue'

const IdContextKey: InjectionKey<Ref<string>> = Symbol('IdContext')

export function useIdContextProvide(id: Ref<string>) {
  provide(IdContextKey, id)
}

export const IdContextProvider = defineComponent<{
  id: string
}>(
  (props, { slots }) => {
    const id = computed(() => props.id)
    useIdContextProvide(id)
    return () => slots?.default?.()
  },
)

export function getMenuId(uuid: string, eventKey: string) {
  return `${uuid}-${eventKey}`
}

/**
 * Get `data-menu-id`
 */
export function useMenuId(eventKey: Ref<string>) {
  const id = inject(IdContextKey, ref(''))
  return computed(() => getMenuId(id.value, eventKey.value))
}
