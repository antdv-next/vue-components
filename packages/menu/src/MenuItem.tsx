import type { HTMLAttributes } from 'vue'
import type { MenuItemType } from './interface.ts'
import Overflow from '@v-c/overflow'
import { clsx, warning } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
import { toPropsRefs } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useMenuId } from './context/IdContext.ts'
import { useMenuContext } from './context/MenuContext.ts'
import { useFullPath, useMeasure } from './context/PathContext.tsx'
import { usePrivateContext } from './context/PrivateContext.ts'
import useActive from './hooks/useActive.ts'
import useDirectionStyle from './hooks/useDirectionStyle.ts'
import Icon from './Icon.tsx'
import { warnItemProp } from './utils/warnUtil.ts'

export interface MenuItemProps extends Omit<MenuItemType, 'label' | 'key' > {
  /** @private Internal filled key. Do not set it directly */
  eventKey?: string

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean

  /** @deprecated No place to use this. Should remove */
  attribute?: Record<string, string>

  onKeyDown?: (e: KeyboardEvent) => void
  onFocus?: (e: FocusEvent) => void
  role?: string
}

// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.
const LegacyMenuItem = defineComponent<{
  elementRef?: any
}>(
  (props, { slots, attrs }) => {
    return () => {
      const { title, attribute, ...restProps } = attrs
      const { elementRef } = props
      // Here the props are eventually passed to the DOM element.
      // React does not recognize non-standard attributes.
      // Therefore, remove the props that is not used here.
      // ref: https://github.com/ant-design/ant-design/issues/41395
      const passedProps = omit(restProps, [
        'eventKey',
        'popupClassName',
        'popupOffset',
        'onTitleClick',
      ])

      warning(!attribute, '`attribute` of Menu.Item is deprecated. Please pass attribute directly.')

      return (
        <Overflow.Item
          {...attribute as any}
          title={typeof title === 'string' ? title : undefined}
          {...passedProps}
          ref={elementRef}
        >
          {slots?.default?.()}
        </Overflow.Item>
      )
    }
  },
  {
    name: 'LegacyMenuItem',
    inheritAttrs: false,
  },
)

/**
 * Real Menu Item component
 */

const InternalMenuItem = defineComponent<MenuItemProps>(
  (props, { slots, attrs }) => {
    const { eventKey } = toPropsRefs(props, 'eventKey')
    const domDataId = useMenuId(eventKey as any)
    const menuContext = useMenuContext()
    const privateContext = usePrivateContext()
    const legacyMenuItemRef = shallowRef()
    const elementRef = shallowRef<HTMLLIElement>()
    const mergedDisabled = computed(() => props.disabled ?? menuContext?.value?.disabled)
    const connectedKeys = useFullPath(eventKey as any)
    // ================================ Warn ================================
    if (process.env.NODE_ENV !== 'production' && props.warnKey) {
      warning(false, 'MenuItem should not leave undefined `key`.')
    }
    // ============================= Info =============================
    const getEventInfo = (e: MouseEvent | KeyboardEvent) => {
      return {
        key: eventKey.value,
        // Note: For legacy code is reversed which not like other antd component
        keyPath: [...connectedKeys.value].reverse(),
        item: legacyMenuItemRef.value,
        domEvent: e,
      }
    }

    // ============================ Active ============================
    const ret = useActive(
      eventKey as any,
      mergedDisabled as any,
      props?.onMouseEnter,
      props?.onMouseLeave,
    )
    const active = ret.active

    // ============================ Select ============================
    const selected = computed(() => !!menuContext?.value?.selectedKeys?.includes?.(eventKey.value as any))

    // ======================== DirectionStyle ========================
    const directionStyle = useDirectionStyle(computed(() => connectedKeys.value.length))

    // ============================ Events ============================
    const onInternalClick = (e: MouseEvent) => {
      if (mergedDisabled.value) {
        return
      }
      const info = getEventInfo(e)

      props?.onClick?.(warnItemProp(info as any) as any)
      menuContext?.value?.onItemClick?.(info as any)
    }

    const onInternalKeyDown = (e: KeyboardEvent) => {
      props?.onKeyDown?.(e)
      if (e.which === KeyCode.ENTER) {
        const info = getEventInfo(e)

        // Legacy. Key will also trigger click event
        props?.onClick?.(warnItemProp(info as any) as any)
        menuContext?.value?.onItemClick?.(info as any)
      }
    }

    /**
     * Used for accessibility. Helper will focus element without key board.
     * We should manually trigger an active
     */
    const onInternalFocus = (e: FocusEvent) => {
      menuContext?.value?.onActive?.(eventKey.value as any)
      props?.onFocus?.(e)
    }
    // ============================ Render ============================
    return () => {
      const { role, disabled, itemIcon, ...restProps } = props
      const optionRoleProps: HTMLAttributes = {}
      if (role === 'option') {
        optionRoleProps['aria-selected'] = selected.value
      }

      const {
        prefixCls,
        overflowDisabled,
        itemIcon: contextItemIcon,
      } = menuContext?.value ?? {}

      // ============================= Icon =============================
      const mergedItemIcon = itemIcon || contextItemIcon
      const itemCls = `${prefixCls}-item`
      const activeProps = {
        onMouseenter: ret.onMouseEnter,
        onMouseleave: ret.onMouseLeave,
      }

      let renderNode = (
        <LegacyMenuItem
          ref={legacyMenuItemRef}
          elementRef={elementRef}
          role={role === null ? 'none' : role || 'menuitem'}
          tabIndex={disabled ? null : -1}
          data-menu-id={overflowDisabled && domDataId.value ? null : domDataId.value}
          {...omit({ ...restProps, ...attrs }, ['extra'])}
          {...activeProps}
          {...optionRoleProps as any}
          component="li"
          aria-disabled={disabled}
          style={[
            directionStyle.value,
            props?.style,
          ]}
          className={clsx(
            itemCls,
            {
              [`${itemCls}-active`]: active.value,
              [`${itemCls}-selected`]: selected.value,
              [`${itemCls}-disabled`]: mergedDisabled.value,
            },
            props.class,
          )}
          onClick={onInternalClick}
          onKeydown={onInternalKeyDown}
          onFocus={onInternalFocus}
        >
          {slots?.default?.()}
          <Icon
            props={{
              ...props,
              isSelected: selected.value,
            }}
            icon={mergedItemIcon}
          />
        </LegacyMenuItem>
      )
      if (privateContext._internalRenderMenuItem) {
        renderNode = privateContext._internalRenderMenuItem(renderNode, props, { selected: selected.value })
      }
      return renderNode
    }
  },
  {
    name: 'InternalMenuItem',
    inheritAttrs: false,
  },
)

const MenuItem = defineComponent<MenuItemProps>(
  (props, { slots, attrs }) => {
    const { eventKey } = toPropsRefs(props, 'eventKey')
    // ==================== Record KeyPath ====================
    const measure = useMeasure()
    const connectedKeyPath = useFullPath(eventKey as any)
    watch(
      [connectedKeyPath],
      (_n, _o, onCleanup) => {
        if (measure) {
          measure.registerPath(eventKey.value!, connectedKeyPath.value as any)
        }
        onCleanup(() => {
          measure?.unregisterPath(eventKey.value!, connectedKeyPath.value as any)
        })
      },
      {
        immediate: true,
      },
    )
    return () => {
      if (measure) {
        return null
      }
      // ======================== Render ========================
      return <InternalMenuItem {...{ ...attrs, ...props }} v-slots={slots} />
    }
  },
  {
    name: 'MenuItem',
    inheritAttrs: false,
  },
)

export default MenuItem
