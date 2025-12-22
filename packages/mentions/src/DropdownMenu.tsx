import type { DataDrivenOptionProps } from './Mentions'
import { defineComponent } from 'vue'

export interface DropdownMenuProps {
  prefixCls?: string
  options: DataDrivenOptionProps[]
  opened: boolean
}

/**
 * We only use Menu to display the candidate.
 * The focus is controlled by textarea to make accessibility easy.
 */

const DropdownMenu = defineComponent<DropdownMenuProps>(
  () => {
    return () => {
      return null
    }
  },
  {
    name: 'DropdownMenu',
    inheritAttrs: false,
  },
)

export default DropdownMenu
