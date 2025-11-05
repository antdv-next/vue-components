import type { CSSProperties } from 'vue'
import { classNames } from '@v-c/util'
import Overflow from '@v-c/overflow'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useMenuId } from './context/IdContext'
import { useMenuContext } from './context/MenuContext'
import { useFullPath, useMeasure } from './context/PathContext'
import { usePrivateContext } from './context/PrivateContext'
import useActive from './hooks/useActive'
import useDirectionStyle from './hooks/useDirectionStyle'
import Icon from './Icon'
import type { MenuInfo, MenuItemProps } from './interface'
import { warnItemProp } from './utils/warnUtil'

const MenuItem = defineComponent<MenuItemProps>(
  (props, { slots, attrs, expose }) => {
    const eventKey = props.eventKey ?? (props as any).key
    const domDataId = useMenuId(eventKey)
    const context = useMenuContext()
    const privateContext = usePrivateContext()

    const connectedKeys = useFullPath(eventKey)
    const measure = useMeasure()

    if (process.env.NODE_ENV !== 'production' && props.warnKey) {
      warning(false, 'MenuItem should not leave undefined `key`.')
    }

    if (measure && eventKey !== undefined) {
      watch(
        () => connectedKeys.value,
        (path, _, onCleanup) => {
          measure.registerPath(eventKey, path)
          onCleanup(() => measure.unregisterPath(eventKey, path))
        },
        { immediate: true },
      )
    }

    const menu = context?.value
    const prefixCls = menu?.prefixCls ?? 'vc-menu'
    const itemCls = `${prefixCls}-item`

    const elementRef = shallowRef<any>(null)
    expose({
      nativeElement: elementRef,
    })

    const mergedDisabled = computed(() => (menu?.disabled ?? false) || !!props.disabled)
    const mergedItemIcon = computed(() => props.itemIcon ?? menu?.itemIcon)
    const selected = computed(() => menu?.selectedKeys.includes(eventKey) ?? false)
    const directionStyle = useDirectionStyle(connectedKeys.value.length)

    const { active, onMouseEnter, onMouseLeave } = useActive(
      eventKey,
      mergedDisabled.value,
      props.onMouseEnter,
      props.onMouseLeave,
    )

    const legacyItem = computed(() => {
      const instance = elementRef.value
      if (!instance) {
        return null
      }
      return instance.$el ?? instance
    })

    const getEventInfo = (domEvent: MouseEvent | KeyboardEvent): MenuInfo => ({
      key: eventKey,
      keyPath: [...connectedKeys.value].reverse(),
      item: legacyItem.value,
      domEvent,
    })

    const onInternalClick = (e: MouseEvent) => {
      if (mergedDisabled.value) {
        return
      }
      const info = getEventInfo(e)
      props.onClick?.(warnItemProp(info))
      menu?.onItemClick(info)
    }

    const onInternalKeyDown = (e: KeyboardEvent) => {
      if (e.which === KeyCode.ENTER) {
        const info = getEventInfo(e)
        props.onClick?.(warnItemProp(info))
        menu?.onItemClick(info)
      }
    }

    const onInternalFocus = () => {
      menu?.onActive(eventKey)
    }

    const overflowDisabled = menu?.overflowDisabled

    const optionRoleProps: Record<string, any> = {}
    if ((props as any).role === 'option') {
      optionRoleProps['aria-selected'] = selected.value
    }

    if (process.env.NODE_ENV !== 'production' && props.attribute) {
      warning(
        false,
        '`attribute` of Menu.Item is deprecated. Please pass attribute directly.',
      )
    }

    return () => {
      const slotChildren = props.children ?? slots.default?.()
      const slotExtra = props.extra ?? slots.extra?.()
      const hasExtra = slotExtra !== undefined && slotExtra !== null

      const contentNodes: any[] = []
      if (slotChildren !== undefined) {
        if (Array.isArray(slotChildren)) {
          contentNodes.push(...slotChildren)
        }
        else {
          contentNodes.push(slotChildren)
        }
      }

      if (hasExtra) {
        contentNodes.push(
          <span class={`${prefixCls}-item-extra`}>
            {slotExtra}
          </span>,
        )
      }

      contentNodes.push(
        Icon({
          icon: mergedItemIcon.value,
          props: {
            ...props,
            isSelected: selected.value,
          },
        }),
      )

      const mergedStyle: CSSProperties = {
        ...(directionStyle.value as CSSProperties),
        ...(props.style as CSSProperties),
        ...((attrs as any)?.style as CSSProperties),
      }

      const className = classNames(
        itemCls,
        {
          [`${itemCls}-active`]: active.value,
          [`${itemCls}-selected`]: selected.value,
          [`${itemCls}-disabled`]: mergedDisabled.value,
        },
        props.className,
        (attrs as any)?.class,
      )

      const restProps = omit(props, [
        'eventKey',
        'warnKey',
        'itemIcon',
        'children',
        'extra',
        'attribute',
        'onMouseEnter',
        'onMouseLeave',
      ])
      const restAttrs = omit(attrs, ['class', 'style'])

      const itemProps: any = {
        ...restProps,
        ...restAttrs,
        ref: elementRef,
        component: 'li',
        class: className,
        role: (props as any).role === null ? 'none' : (props as any).role || 'menuitem',
        tabindex: mergedDisabled.value ? undefined : -1,
        'data-menu-id': overflowDisabled && domDataId ? null : domDataId,
        'aria-disabled': mergedDisabled.value,
        style: mergedStyle,
        onClick: onInternalClick,
        onKeydown: onInternalKeyDown,
        onFocus: onInternalFocus,
        onMouseenter: onMouseEnter,
        onMouseleave: onMouseLeave,
        ...optionRoleProps,
        'v-slots': {
          default: () => contentNodes,
        },
      }

      let renderNode = <Overflow.Item {...itemProps} />

      const internalRenderMenuItem = privateContext.value._internalRenderMenuItem
      if (internalRenderMenuItem) {
        renderNode = internalRenderMenuItem(
          renderNode,
          props,
          { selected: selected.value },
        ) as any
      }

      return renderNode
    }
  },
)

export default MenuItem
