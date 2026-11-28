import type { ComponentInternalInstance, VNode, VNodeNormalizedChildren } from 'vue'
import { Comment, getCurrentInstance, isVNode } from 'vue'

const STABLE_FRAGMENT = 1 << 11

type ScopeVNode = VNode & {
  slotScopeIds?: string[] | null
  ssContent?: VNode | null
  ssFallback?: VNode | null
}

function filterSingleRoot(children: VNodeNormalizedChildren): ScopeVNode | undefined {
  if (!Array.isArray(children)) {
    return
  }

  let singleRoot: ScopeVNode | undefined

  for (const child of children) {
    if (!isVNode(child)) {
      return
    }
    if (child.type !== Comment || child.children === 'v-if') {
      if (singleRoot) {
        return
      }
      singleRoot = child
      if (singleRoot.patchFlag > 0 && singleRoot.patchFlag & STABLE_FRAGMENT) {
        return filterSingleRoot(singleRoot.children)
      }
    }
  }

  return singleRoot
}

function isParentRoot(parent: ComponentInternalInstance, vnode: ScopeVNode) {
  let subTree: ScopeVNode | null = parent.subTree

  if (!subTree) {
    return false
  }
  if (process.env.NODE_ENV !== 'production' && subTree.patchFlag > 0 && subTree.patchFlag & STABLE_FRAGMENT) {
    subTree = filterSingleRoot(subTree.children) || subTree
  }

  return vnode === subTree
    || ((subTree.type as any).__isSuspense
      && (subTree.ssContent === vnode || subTree.ssFallback === vnode))
}

export function useScopeIdAttrs(): Record<string, ''> {
  const scopeIds = new Set<string>()
  let instance = getCurrentInstance()

  while (instance) {
    const vnode = instance.vnode as ScopeVNode
    if (vnode.scopeId) {
      scopeIds.add(vnode.scopeId)
    }
    vnode.slotScopeIds?.forEach(scopeId => scopeIds.add(scopeId))

    const parent = instance.parent
    if (!parent || !isParentRoot(parent, vnode)) {
      break
    }
    instance = parent
  }

  return Object.fromEntries([...scopeIds].map(scopeId => [scopeId, '']))
}
