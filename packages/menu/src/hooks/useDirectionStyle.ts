import type { CSSProperties, Ref } from 'vue'
import { computed } from 'vue'
import { useMenuContext } from '../context/MenuContext.tsx'

export default function useDirectionStyle(level: Ref<number>): Ref<CSSProperties | null> {
  const menuContext = useMenuContext()

  return computed<CSSProperties | null>(() => {
    const { mode, rtl, inlineIndent } = menuContext?.value ?? {}
    if (mode !== 'inline') {
      return null
    }
    const len = level.value
    return rtl
      ? {
          paddingRight: `${len * inlineIndent!}px`,
        }
      : {
          paddingLeft: `${len * inlineIndent!}px`,
        }
  })
}
