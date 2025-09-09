import warning from '@v-c/util/dist/warning'

/**
 * `onClick` event return `info.item` which point to vue node directly.
 * We should warning this since it will not work on FC.
 */
export function warnItemProp<T extends { item: unknown }>({ item, ...restInfo }: T): T {
  Object.defineProperty(restInfo, 'item', {
    get: () => {
      warning(
        false,
        '`info.item` is deprecated since we will move to function component that not provides Vue Node instance in future.',
      )

      return item
    },
  })

  return restInfo as T
}
