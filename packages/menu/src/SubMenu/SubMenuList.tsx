import type { HTMLAttributes } from 'vue'
import { classNames } from '@v-c/util'
import { defineComponent, shallowRef } from 'vue'
import { useMenuContext } from '../context/MenuContext'

export interface SubMenuListProps {
  id?: string
}

const SubMenuList = defineComponent<SubMenuListProps>(
  (props, { slots, attrs, expose }) => {
    const context = useMenuContext()
    const listRef = shallowRef<HTMLUListElement | null>(null)
    expose({
      nativeElement: listRef,
    })

    return () => {
      const menu = context?.value
      const prefixCls = menu?.prefixCls ?? 'vc-menu'
      const mode = menu?.mode ?? 'vertical'
      const rtl = menu?.rtl

      const { class: classAttr, style: styleAttr, ...restAttrs } = attrs as HTMLAttributes

      return (
        <ul
          ref={listRef}
          role="menu"
          data-menu-list
          id={props.id}
          class={classNames(
            prefixCls,
            rtl && `${prefixCls}-rtl`,
            `${prefixCls}-sub`,
            `${prefixCls}-${mode === 'inline' ? 'inline' : 'vertical'}`,
            classAttr,
          )}
          style={styleAttr}
          {...restAttrs}
        >
          {slots.default?.()}
        </ul>
      )
    }
  },
)

export default SubMenuList
