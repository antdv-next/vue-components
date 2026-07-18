import type { Key } from '@v-c/util/dist/type'

/** Which kind of entity a tagged key addresses. */
export type KeyType = 'item' | 'group'

/**
 * Build the type-tagged key (`item:x` / `group:x`) used for virtual row keys,
 * scroll targets, getSize lookups and raw-mode data-key attributes, so item
 * and group keys can never collide. Constructed and compared as a whole —
 * never parsed back.
 */
export function toTaggedKey(oriKey: Key, type: KeyType): string {
  return `${type}:${oriKey}`
}
