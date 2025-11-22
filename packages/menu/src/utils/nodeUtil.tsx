import type { VueNode } from '@v-c/util/dist/type'
import type { Components, ItemType } from '../interface'
import { filterEmpty } from '@v-c/util/dist/props-util'
import Divider from '../Divider'
import MenuItem from '../MenuItem'
import MenuItemGroup from '../MenuItemGroup'
import SubMenu from '../SubMenu'
import { parseChildren } from './commonUtil'

function convertItemsToNodes(
  list: ItemType[],
  components: Required<Components>,
  prefixCls?: string,
  slots?: {
    labelRender?: (item: ItemType) => any
    extraRender?: (item: ItemType) => any
  },
): VueNode[] {
  const {
    item: MergedMenuItem,
    group: MergedMenuItemGroup,
    submenu: MergedSubMenu,
    divider: MergedDivider,
  } = components

  return (list || [])
    .map((opt, index) => {
      if (opt && typeof opt === 'object') {
        const { children, key, type, ...restProps } = opt as any
        const mergedKey = key ?? `tmp-${index}`
        let label
        let extra
        const _labelRender = slots?.labelRender ? slots.labelRender(opt) : null
        const _extraRender = slots?.extraRender ? slots.extraRender(opt) : null
        const labelArr = filterEmpty(Array.isArray(_labelRender) ? _labelRender : [_labelRender])
        const extraArr = filterEmpty(Array.isArray(_extraRender) ? _extraRender : [_extraRender])
        if (labelArr.length) {
          label = labelArr?.[0]
        }
        if (extraArr.length) {
          extra = extraArr?.[0]
        }
        if (!label) {
          label = (opt as any).label
        }
        if (!extra) {
          extra = (opt as any).extra
        }

        // MenuItemGroup & SubMenuItem
        if (children || type === 'group') {
          if (type === 'group') {
            // Group
            return (
              <MergedMenuItemGroup key={mergedKey} {...restProps} title={label}>
                {convertItemsToNodes(children, components, prefixCls)}
              </MergedMenuItemGroup>
            )
          }

          // Sub Menu
          return (
            <MergedSubMenu key={mergedKey} {...restProps} title={label}>
              {convertItemsToNodes(children, components, prefixCls)}
            </MergedSubMenu>
          )
        }

        // MenuItem & Divider
        if (type === 'divider') {
          return <MergedDivider key={mergedKey} {...restProps} />
        }

        return (
          <MergedMenuItem key={mergedKey} {...restProps} extra={extra}>
            {label}
            {(!!extra || extra === 0) && (
              <span class={`${prefixCls}-item-extra`}>{extra}</span>
            )}
          </MergedMenuItem>
        )
      }

      return null
    })
    .filter(opt => opt)
}

export function parseItems(
  children: VueNode | undefined,
  items: ItemType[] | undefined,
  keyPath: string[],
  components: Components,
  prefixCls?: string,
  slots?: {
    labelRender?: (item: ItemType) => any
    extraRender?: (item: ItemType) => any
  },
) {
  let childNodes = children

  const mergedComponents: Required<Components> = {
    divider: Divider,
    item: MenuItem,
    group: MenuItemGroup,
    submenu: SubMenu,
    ...components,
  }

  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents, prefixCls, slots)
  }

  return parseChildren(childNodes, keyPath)
}
