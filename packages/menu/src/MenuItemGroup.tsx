import type { CSSProperties } from 'vue'
import { classNames } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { computed, defineComponent } from 'vue'
import { useMenuContext } from './context/MenuContext'
import { useFullPath, useMeasure } from './context/PathContext'
import type { MenuItemGroupProps } from './interface'
import { parseChildren } from './utils/commonUtil'

const MenuItemGroup = defineComponent<MenuItemGroupProps>(
  (props, { slots, attrs }) => {
    const connectedKeyPath = useFullPath(props.eventKey)
    const measure = useMeasure()
    const context = useMenuContext()

    const childList = computed(() => {
      const childrenNodes = props.children ?? slots.default?.()
      return parseChildren(childrenNodes, connectedKeyPath.value)
    })

    return () => {
      if (measure) {
        return childList.value as any
      }

      const menu = context?.value
      const prefixCls = menu?.prefixCls ?? 'vc-menu'
      const { classNames: menuClassNames, styles } = menu || {}
      const groupPrefixCls = `${prefixCls}-item-group`

      const { className, title, ...restProps } = props
      const { class: classAttr, style: styleAttr, ...restAttrs } = attrs as any

      return (
        <li
          role="presentation"
          class={classNames(groupPrefixCls, className, classAttr)}
          onClick={event => event.stopPropagation()}
          {...omit(restProps, ['warnKey', 'children', 'eventKey'])}
          {...restAttrs}
        >
          <div
            role="presentation"
            class={classNames(`${groupPrefixCls}-title`, menuClassNames?.listTitle)}
            style={styles?.listTitle as CSSProperties}
            title={typeof title === 'string' ? title : undefined}
          >
            {title ?? slots.title?.()}
          </div>
          <ul
            role="group"
            class={classNames(`${groupPrefixCls}-list`, menuClassNames?.list)}
            style={styles?.list as CSSProperties}
          >
            {childList.value}
          </ul>
        </li>
      )
    }
  },
)

export default MenuItemGroup
