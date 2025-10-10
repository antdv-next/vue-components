import type { CSSProperties } from 'vue'
import type { MenuDividerType } from './interface'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'
import { useInjectMenu } from './context/MenuContext'
import { useMeasure } from './context/PathContext.tsx'

export type DividerProps = Omit<MenuDividerType, 'type'>

export default defineComponent({
  name: 'Divider',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    const { prefixCls } = useInjectMenu()
    const measure = useMeasure()

    if (measure) {
      return null
    }

    return () => (
      <li
        role="separator"
        class={classNames(`${prefixCls}-item-divider`, [attrs.class])}
        style={{ ...attrs.style as CSSProperties }}
      />
    )
  },
})
