import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'
import { useInjectMenu } from '../context/MenuContext'

export default defineComponent({
  name: 'SubMenuList',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    const { prefixCls, mode, rtl } = useInjectMenu()
    return () => (
      <ul
        {...attrs}
        class={classNames(
          prefixCls,
          rtl && `${prefixCls}-rtl`,
          `${prefixCls}-sub`,
          `${prefixCls}-${mode === 'inline' ? 'inline' : 'vertical'}`,
          [attrs.class],
        )}
        role="menu"
        data-menu-list
      >
        {slots.default?.()}
      </ul>
    )
  },
})
