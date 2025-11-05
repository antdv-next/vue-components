import type { InjectionKey, Ref } from 'vue'
import { inject, provide, ref } from 'vue'

const IdContextKey: InjectionKey<Ref<string>> = Symbol('IdContext')

export function useIdContextProvide(id: Ref<string>) {
  provide(IdContextKey, id)
}

export function getMenuId(uuid: string, eventKey: string) {
  return `${uuid}-${eventKey}`
}

/**
 * Get `data-menu-id`
 */
export function useMenuId(eventKey: string) {
  const id = inject(IdContextKey, ref(''))
  return getMenuId(id.value, eventKey)
}
