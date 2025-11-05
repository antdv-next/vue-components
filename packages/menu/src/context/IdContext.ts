import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

const IdContextKey: InjectionKey<string> = Symbol('MenuIdContext')

export function provideIdContext(id: string) {
  provide(IdContextKey, id)
}

export function useIdContext() {
  return inject(IdContextKey, '')
}

export function getMenuId(uuid: string, eventKey: string) {
  return `${uuid}-${eventKey}`
}

export function useMenuId(eventKey?: string) {
  const id = useIdContext()
  if (!id || eventKey === undefined) {
    return ''
  }
  return getMenuId(id, eventKey)
}
