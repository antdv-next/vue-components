function getRoot(ele?: Node | null) {
  return ele?.getRootNode?.()
}

/**
 * Check if is in shadowRoot
 */
export function inShadow(ele?: Node | null) {
  // Guard against an unavailable ShadowRoot global (e.g. in SSR or tests)
  // to avoid a ReferenceError in the instanceof check.
  if (typeof ShadowRoot === 'undefined')
    return false
  return getRoot(ele) instanceof ShadowRoot
}

/**
 * Return shadowRoot if possible
 */
export function getShadowRoot(ele?: Node | null): ShadowRoot | null {
  return inShadow(ele) ? (getRoot(ele) as ShadowRoot) : null
}
