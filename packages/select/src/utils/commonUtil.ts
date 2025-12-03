import type { VueNode } from '@v-c/util/dist/type'
import type { DisplayValueType } from '../interface'

export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

function isTitleType(title: any) {
  return ['string', 'number'].includes(typeof title)
}

export function injectPropsWithOption(option: any): any {
  return { ...option }
}

export function toVueNode(value: VueNode | VueNode[]): VueNode[] {
  return toArray(value)
}

export function getTitle(item: DisplayValueType): string {
  let title: string | undefined
  if (item) {
    if (isTitleType(item.title)) {
      title = (item as any).title.toString()
    }
    else if (isTitleType(item.label)) {
      title = (item as any).label.toString()
    }
  }

  return title as any
}
