import warning from '@v-c/util/dist/warning'

export function warnItemProp<T extends { item: any }>({ item, ...restInfo }: T): T {
  Object.defineProperty(restInfo, 'item', {
    get: () => {
      warning(
        false,
        '`info.item` is deprecated since we will move to function component that not provides component instance in future.',
      )
      return item
    },
  })

  return restInfo as T
}
