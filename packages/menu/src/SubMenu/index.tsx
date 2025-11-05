import type { CSSProperties } from 'vue'
import { classNames } from '@v-c/util'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import Icon from '../Icon'
import MenuContextProvider, { useMenuContext } from '../context/MenuContext'
import { useMenuId } from '../context/IdContext'
import {
  useFullPath,
  useMeasure,
  usePathUserContext,
  providePathTrackerContext,
} from '../context/PathContext'
import { usePrivateContext } from '../context/PrivateContext'
import useActive from '../hooks/useActive'
import useDirectionStyle from '../hooks/useDirectionStyle'
import useMemoCallback from '../hooks/useMemoCallback'
import type { MenuInfo, MenuMode, SubMenuProps } from '../interface'
import { parseChildren } from '../utils/commonUtil'
import { warnItemProp } from '../utils/warnUtil'
import InlineSubMenuList from './InlineSubMenuList'
import PopupTrigger from './PopupTrigger'
import SubMenuList from './SubMenuList'

export type SemanticName = 'list' | 'listTitle'

const SubMenu = defineComponent<SubMenuProps>(
  (props, { slots, attrs }) => {
    const eventKey = props.eventKey!

    const menu = useMenuContext()
    const privateContext = usePrivateContext()
    const pathUserContext = usePathUserContext()

    const connectedPath = useFullPath(eventKey)
    providePathTrackerContext(connectedPath)
    const measure = useMeasure()

    if (process.env.NODE_ENV !== 'production' && props.warnKey) {
      warning(false, 'SubMenu should not leave undefined `key`.')
    }

    if (measure) {
      watch(
        () => connectedPath.value,
        (path, _, onCleanup) => {
          measure.registerPath(eventKey, path)
          onCleanup(() => measure.unregisterPath(eventKey, path))
        },
        { immediate: true },
      )
    }

    const menuContext = computed(() => menu?.value)

    const domDataId = useMenuId(eventKey)

    const mergedDisabled = computed(
      () => (menuContext.value?.disabled ?? false) || !!props.disabled,
    )

    const open = computed(() => menuContext.value?.openKeys.includes(eventKey) ?? false)

    const childNodes = computed(() => {
      const children = props.children ?? slots.default?.()
      return parseChildren(children, connectedPath.value)
    })

    const directionStyle = useDirectionStyle(connectedPath.value.length)

    const { active, onMouseEnter, onMouseLeave } = useActive(
      eventKey,
      mergedDisabled.value,
      props.onTitleMouseEnter,
      props.onTitleMouseLeave,
    )

    const selected = computed(() => {
      const keys = menuContext.value?.selectedKeys ?? []
      if (keys.includes(eventKey)) {
        return true
      }
      return keys.some(key => pathUserContext?.isSubPathKey?.([key], eventKey))
    })

    const triggerModeRef = shallowRef<MenuMode>(menuContext.value?.mode ?? 'vertical')
    watch(
      () => menuContext.value?.mode,
      (mode) => {
        if (!mode) {
          return
        }
        if (mode !== 'inline' && connectedPath.value.length > 1) {
          triggerModeRef.value = 'vertical'
        }
        else {
          triggerModeRef.value = mode
        }
      },
      { immediate: true },
    )

    const onInternalTitleClick = (e: MouseEvent) => {
      if (mergedDisabled.value) {
        return
      }

      props.onTitleClick?.({
        key: eventKey,
        domEvent: e,
      })

      if (menuContext.value?.mode === 'inline') {
        menuContext.value?.onOpenChange(eventKey, !open.value)
      }
    }

    const onMergedItemClick = useMemoCallback((info: MenuInfo) => {
      props.onClick?.(warnItemProp(info))
      menuContext.value?.onItemClick(info)
    })

    const onPopupVisibleChange = (visible: boolean) => {
      if (menuContext.value?.mode !== 'inline') {
        menuContext.value?.onOpenChange(eventKey, visible)
      }
    }

    const onInternalFocus = () => {
      menuContext.value?.onActive(eventKey)
    }

    const prefixCls = computed(() => menuContext.value?.prefixCls ?? 'vc-menu')
    const subMenuPrefixCls = computed(() => `${prefixCls.value}-submenu`)

    const expandIcon = computed(() => {
      const icon = props.expandIcon ?? menuContext.value?.expandIcon
      if (menuContext.value?.mode === 'horizontal') {
        return null
      }

      return Icon({
        icon,
        props: {
          ...props,
          isOpen: open.value,
          isSubMenu: true,
        },
        children: <i class={`${subMenuPrefixCls.value}-arrow`} />,
      })
    })

    const popupId = domDataId ? `${domDataId}-popup` : undefined

    const renderPopupContent = () => {
      const popupMode
        = triggerModeRef.value === 'horizontal'
          ? 'vertical'
          : triggerModeRef.value

      const contextPopupRender = menuContext.value?.popupRender
      const mergedPopupRender = props.popupRender ?? contextPopupRender

      const originNode = (
        <MenuContextProvider
          classNames={props.classNames}
          styles={props.styles}
          mode={popupMode}
          onItemClick={onMergedItemClick as any}
        >
          <SubMenuList id={popupId}>
            {childNodes.value}
          </SubMenuList>
        </MenuContextProvider>
      )

      if (mergedPopupRender) {
        return mergedPopupRender(originNode, {
          item: props,
          keys: connectedPath.value,
        })
      }
      return originNode
    }

    const renderInlineContent = () => (
      <InlineSubMenuList
        id={popupId}
        open={open.value}
        keyPath={connectedPath.value}
      >
        {childNodes.value}
      </InlineSubMenuList>
    )

    const content = () => {
      const titleNode = (
        <div
          class={classNames(
            `${subMenuPrefixCls.value}-title`,
            props.className,
            (attrs as any)?.class,
            {
              [`${subMenuPrefixCls.value}-title-active`]: active.value,
              [`${subMenuPrefixCls.value}-title-selected`]: selected.value,
              [`${subMenuPrefixCls.value}-title-disabled`]: mergedDisabled.value,
            },
          )}
          style={{
            ...(directionStyle.value as CSSProperties),
            ...(props.style as CSSProperties),
            ...((attrs as any)?.style as CSSProperties),
          }}
          tabindex={mergedDisabled.value ? undefined : -1}
          role="menuitem"
          data-menu-id={
            menuContext.value?.overflowDisabled && domDataId ? null : domDataId
          }
          aria-expanded={open.value}
          aria-haspopup="true"
          aria-controls={popupId}
          aria-disabled={mergedDisabled.value}
          onClick={onInternalTitleClick}
          onFocus={onInternalFocus}
          onMouseenter={onMouseEnter}
          onMouseleave={onMouseLeave}
        >
          <span class={`${subMenuPrefixCls.value}-title-content`}>
            {props.title ?? slots.title?.()}
          </span>
          {expandIcon.value}
        </div>
      )

      const wrappedTitle
        = menuContext.value?.mode === 'inline'
          ? titleNode
          : (
            <PopupTrigger
              prefixCls={subMenuPrefixCls.value}
              mode={triggerModeRef.value}
              visible={open.value}
              popup={renderPopupContent}
              popupStyle={props.popupStyle}
              popupClassName={props.popupClassName}
              popupOffset={props.popupOffset}
              disabled={mergedDisabled.value}
              onVisibleChange={onPopupVisibleChange}
            >
              {titleNode}
            </PopupTrigger>
            )

      return (
        <li
          class={classNames(
            subMenuPrefixCls.value,
            {
              [`${subMenuPrefixCls.value}-open`]: open.value,
              [`${subMenuPrefixCls.value}-active`]: active.value,
              [`${subMenuPrefixCls.value}-selected`]: selected.value,
              [`${subMenuPrefixCls.value}-disabled`]: mergedDisabled.value,
            },
            props.className,
          )}
          role="presentation"
          onFocus={onInternalFocus}
        >
          {wrappedTitle}
          {menuContext.value?.mode === 'inline' ? renderInlineContent() : null}
        </li>
      )
    }

    let node = content()

    const internalRender = privateContext.value._internalRenderSubMenuItem
    if (internalRender) {
      node = internalRender(node, props, {
        selected: selected.value,
        open: open.value,
        active: active.value,
        disabled: mergedDisabled.value,
      }) as any
    }

    return () => node
  },
)

export default SubMenu
