import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { useMenuContext } from '../context/MenuContext'

export default function useDirectionStyle(level: number) {
  const context = useMenuContext()

  return computed<CSSProperties | null>(() => {
    const menu = context?.value
    if (!menu || menu.mode !== 'inline') {
      return null
    }

    const indent = menu.inlineIndent ?? 0
    const size = `${level * indent}px`

    if (menu.rtl) {
      return { paddingRight: size }
    }

    return { paddingLeft: size }
  })
}
