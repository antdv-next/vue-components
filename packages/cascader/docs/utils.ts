import type { VueNode } from '@v-c/util'

export interface Option {
  code?: string
  name?: string
  nodes?: Option[]
  disabled?: boolean
}

export interface Option2 {
  value?: string
  label?: VueNode
  title?: VueNode
  disabled?: boolean
  disableCheckbox?: boolean
  isLeaf?: boolean
  loading?: boolean
  children?: Option2[]
}

export function arrayTreeFilter<T extends Record<string, any>>(
  data: T[],
  filter: (item: T, level: number) => boolean,
  options: { childrenKeyName?: string } = {},
): T[] {
  const childrenKeyName = options.childrenKeyName || 'children'
  const result: T[] = []
  let level = 0
  let currentList = data

  while (currentList && currentList.length) {
    const target = currentList.find(item => filter(item, level))
    if (!target) {
      break
    }

    result.push(target)
    currentList = target[childrenKeyName] as T[]
    level += 1
  }

  return result
}
