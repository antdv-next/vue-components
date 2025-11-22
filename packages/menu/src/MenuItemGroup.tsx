import type { VueNode } from '@v-c/util/dist/type'
import type { MenuItemGroupType } from './interface'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, defineComponent } from 'vue'
import { useMenuContext } from './context/MenuContext.tsx'
import { useFullPath, useMeasure } from './context/PathContext.tsx'
import { parseChildren } from './utils/commonUtil.ts'

export interface MenuItemGroupProps extends Omit<MenuItemGroupType, 'type' | 'children' | 'label'> {
  title?: VueNode

  // children?: React.ReactNode;
  /**
   *
   * @private
   */
  eventKey?: string

  /**
   *  @private
   */
  warnKey?: boolean
}

const InternalMenuItemGroup = defineComponent<MenuItemGroupProps>(
  (props, { slots }) => {
    const context = useMenuContext()
    return () => {
      const { class: className, title, eventKey, ...restProps } = props
      const { prefixCls, classes: menuClassNames, styles } = context?.value ?? {}
      const groupPrefixCls = `${prefixCls}-item-group`

      return (
        <li
          role="presentation"
          {...restProps}
          onClick={e => e.stopPropagation()}
          class={clsx(groupPrefixCls, className)}
        >
          <div
            role="presentation"
            class={clsx(`${groupPrefixCls}-title`, menuClassNames?.listTitle)}
            style={styles?.listTitle}
            title={typeof title === 'string' ? title : undefined}
          >
            {title}
          </div>
          <ul
            role="group"
            class={clsx(`${groupPrefixCls}-list`, menuClassNames?.list)}
            style={styles?.list}
          >
            {slots?.default ? slots.default() : null}
          </ul>
        </li>
      )
    }
  },
  {
    name: 'InternalMenuItemGroup',
  },
)

const MenuItemGroup = defineComponent<MenuItemGroupProps>(
  (props, ctx) => {
    const connectedKeyPath = useFullPath(computed(() => props.eventKey!))
    const measure = useMeasure()

    return () => {
      const slots = ctx.slots
      const children = filterEmpty(slots.default ? slots.default() : [])
      const childList = parseChildren(children, connectedKeyPath.value as any)
      if (measure) {
        return childList
      }
      return (
        <InternalMenuItemGroup {...omit(props, ['warnKey'])}>
          {childList}
        </InternalMenuItemGroup>
      )
    }
  },
  {
    name: 'MenuItemGroup',
    inheritAttrs: false,
  },
)

export default MenuItemGroup
