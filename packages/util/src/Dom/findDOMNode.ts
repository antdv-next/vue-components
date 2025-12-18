import type { ComponentPublicInstance, MaybeRef } from 'vue'
import { unref } from 'vue'

export function isDOM(node: any): node is HTMLElement | SVGElement {
  // https://developer.mozilla.org/en-US/docs/Web/API/Element
  // Since XULElement is also subclass of Element, we only need HTMLElement and SVGElement
  return node instanceof HTMLElement || node instanceof SVGElement
}

export function getDOM(elementRef: MaybeRef) {
  const unrefElementRef = unref(elementRef)
  const dom = findDOMNode(unrefElementRef) || (unrefElementRef && typeof unrefElementRef === 'object' ? findDOMNode((unrefElementRef as any).nativeElement) : null)

  // Vue components may render as Fragment/Transition placeholders, whose `$el` is a Text/Comment node.
  // In that case, resolve to the next element sibling as the real measurable DOM element.
  if (dom && (dom.nodeType === 3 || dom.nodeType === 8) && (dom as any).nextElementSibling)
    return (dom as any).nextElementSibling as HTMLElement

  return dom
}

/**
 * Return if a node is a DOM node. Else will return by `findDOMNode`
 */
export default function findDOMNode<T = Element | Text>(
  _node: MaybeRef<ComponentPublicInstance | HTMLElement | SVGElement>,
): T | null {
  const node = unref(_node)
  if (isDOM(node))
    return (node as unknown) as T
  else if (node && '$el' in node)
    return (node.$el as unknown) as T

  return null
}
