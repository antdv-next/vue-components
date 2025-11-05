import type { MenuDividerType } from './interface'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { useMenuContext } from './context/MenuContext.ts'
import { useMeasure } from './context/PathContext.tsx'

export type DividerProps = Omit<MenuDividerType, 'type'>

const Divider = defineComponent<DividerProps>(
  (props) => {
    const menuContext = useMenuContext()
    const measure = useMeasure()
    return () => {
      const { prefixCls } = menuContext?.value ?? {}
      if (measure) {
        return null
      }
      return <li role="separator" class={clsx(`${prefixCls}-item-divider`, props.class)} style={props.style} />
    }
  },
  {
    name: 'Divider',
  },
)

export default Divider
