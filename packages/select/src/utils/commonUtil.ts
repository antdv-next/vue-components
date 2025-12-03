import type { DisplayValueType } from '../interface'

function isTitleType(title: any) {
  return ['string', 'number'].includes(typeof title)
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
