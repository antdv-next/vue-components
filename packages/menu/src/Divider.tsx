import type { CSSProperties } from 'vue'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'
import { useMenuContext } from './context/MenuContext'
import { useMeasure } from './context/PathContext'
import type { MenuDividerProps } from './interface'

const Divider = defineComponent<MenuDividerProps>(
  (props, { attrs }) => {
    const context = useMenuContext()
    const measure = useMeasure()

    return () => {
      if (measure) {
        return null
      }

      const prefixCls = context?.value?.prefixCls ?? 'vc-menu'
      const mergedClass = classNames(
        `${prefixCls}-item-divider`,
        props.className,
        (attrs as any)?.class,
      )

      return (
        <li
          role="separator"
          class={mergedClass}
          style={{
            ...(props.style as CSSProperties),
            ...((attrs as any)?.style as CSSProperties),
          }}
        />
      )
    }
  },
)

export default Divider
