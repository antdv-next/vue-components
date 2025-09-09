import type { CSSProperties } from 'vue'
import { useInjectMenu } from '../context/MenuContext'

export default function useDirectionStyle(level: number): CSSProperties | null {
  const { mode, rtl, inlineIndent } = useInjectMenu()

  if (mode !== 'inline') {
    return null
  }

  const len = level
  return rtl
    ? { paddingRight: `${len * inlineIndent}px` }
    : { paddingLeft: `${len * inlineIndent}px` }
}
