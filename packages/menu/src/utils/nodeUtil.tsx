import type { VueNode } from '@v-c/util/dist/type'
import Divider from '../Divider'
import type { Components, ItemType } from '../interface'
import MenuItem from '../MenuItem'
import MenuItemGroup from '../MenuItemGroup'
import SubMenu from '../SubMenu'
import { parseChildren } from './commonUtil'

function convertItemsToNodes(
  list: ItemType[] | undefined,
  components: Required<Components>,
  prefixCls?: string,
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
        const { label, children, key, type, extra, ...restProps } = opt as any
        const mergedKey = key ?? `tmp-${index}`

        if (children || type === 'group') {
          if (type === 'group') {
            return (
              <MergedMenuItemGroup key={mergedKey} {...restProps} title={label}>
                {convertItemsToNodes(children, components, prefixCls)}
              </MergedMenuItemGroup>
            )
          }

          return (
            <MergedSubMenu key={mergedKey} {...restProps} title={label}>
              {convertItemsToNodes(children, components, prefixCls)}
            </MergedSubMenu>
          )
        }

        if (type === 'divider') {
          return <MergedDivider key={mergedKey} {...restProps} />
        }

        return (
          <MergedMenuItem key={mergedKey} {...restProps} extra={extra}>
            {label}
            {(extra !== undefined && extra !== null) && (
              <span class={`${prefixCls}-item-extra`}>{extra}</span>
            )}
          </MergedMenuItem>
        )
      }

      return null
    })
    .filter(Boolean) as VueNode[]
}

export function parseItems(
  children: VueNode | undefined,
  items: ItemType[] | undefined,
  keyPath: string[],
  components: Components,
  prefixCls?: string,
) {
  let childNodes = children

  const mergedComponents: Required<Components> = {
    divider: Divider,
    item: MenuItem,
    group: MenuItemGroup,
    submenu: SubMenu,
    ...components,
  } as Required<Components>

  if (items) {
    childNodes = convertItemsToNodes(items, mergedComponents, prefixCls)
  }

  return parseChildren(childNodes, keyPath)
}
