import { getCurrentInstance } from 'vue'

export function useScopeIdAttrs(): Record<string, ''> {
  const scopeIds = new Set<string>()
  let instance = getCurrentInstance()

  while (instance) {
    const { type, vnode } = instance
    const typeScopeId = (type as any).__scopeId
    if (typeScopeId) {
      scopeIds.add(typeScopeId)
    }
    if (vnode.scopeId) {
      scopeIds.add(vnode.scopeId)
    }
    const slotScopeIds = (vnode as typeof vnode & { slotScopeIds?: string[] }).slotScopeIds
    slotScopeIds?.forEach(scopeId => scopeIds.add(scopeId))
    instance = instance.parent
  }

  return Object.fromEntries([...scopeIds].map(scopeId => [scopeId, '']))
}
