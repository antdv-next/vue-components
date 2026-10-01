// jsdom throws "Not implemented" for getComputedStyle with a pseudo element,
// which @v-c/util's scrollbar measurement calls during Table mount.
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = ((elt: Element, pseudoElt?: string | null) => {
  if (pseudoElt) {
    return { getPropertyValue: () => '' } as unknown as CSSStyleDeclaration
  }
  return originalGetComputedStyle.call(window, elt)
}) as typeof window.getComputedStyle
