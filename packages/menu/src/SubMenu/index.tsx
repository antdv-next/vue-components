import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { PopupRender, SubMenuType } from '../interface'
import Overflow from '@v-c/overflow'
import { classNames } from '@v-c/util'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, ref, watch } from 'vue'
import { useMenuId } from '../context/IdContext'
import MenuContextProvider, { useMenuContext } from '../context/MenuContext'
import { PathTrackerContext, useFullPath, useMeasure, usePathUserContext } from '../context/PathContext'
import { usePrivateContext } from '../context/PrivateContext'
import useActive from '../hooks/useActive'
import useDirectionStyle from '../hooks/useDirectionStyle'
import Icon from '../Icon'
import { parseChildren } from '../utils/commonUtil'
import InlineSubMenuList from './InlineSubMenuList'
import PopupTrigger from './PopupTrigger'
import SubMenuList from './SubMenuList'

export type SemanticName = 'list' | 'listTitle'
export interface SubMenuProps extends Omit<SubMenuType, 'key' | 'children' | 'label'> {
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  title?: VueNode

  /** @private Used for rest popup. Do not use in your prod */
  internalPopupClose?: boolean

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean
  popupRender?: PopupRender
}

const InternalSubMenu = defineComponent<SubMenuProps>(
  (props, { slots, attrs }) => {
    const eventKeyRef = computed(() => props?.eventKey || '')
    const domDataId = useMenuId(eventKeyRef)

    const menuContext = useMenuContext()
    const { _internalRenderSubMenuItem } = usePrivateContext()
    const pathUserContext = usePathUserContext()
    const connectedPath = useFullPath()

    // Filter out undefined values from path
    const validConnectedPath = computed(() => connectedPath.value.filter((k): k is string => k !== undefined))

    // ================================ Context Values ================================
    const prefixCls = computed(() => menuContext?.value?.prefixCls || 'vc-menu')
    const mode = computed(() => menuContext?.value?.mode || 'vertical')
    const openKeys = computed(() => menuContext?.value?.openKeys || [])
    const contextDisabled = computed(() => menuContext?.value?.disabled)
    const overflowDisabled = computed(() => menuContext?.value?.overflowDisabled)
    const activeKey = computed(() => menuContext?.value?.activeKey)
    const selectedKeys = computed(() => menuContext?.value?.selectedKeys || [])
    const contextExpandIcon = computed(() => menuContext?.value?.expandIcon)
    const contextPopupRender = computed(() => menuContext?.value?.popupRender)

    const onOpenChange = (key: string, open: boolean) => {
      menuContext?.value?.onOpenChange?.(key, open)
    }
    const onActive = (key: string) => {
      menuContext?.value?.onActive?.(key)
    }

    const subMenuPrefixCls = computed(() => `${prefixCls.value}-submenu`)
    const mergedDisabled = computed(() => !!(contextDisabled.value || props?.disabled))

    // ================================ Warn ================================
    if (process.env.NODE_ENV !== 'production' && props?.warnKey) {
      warning(false, 'SubMenu should not leave undefined `key`.')
    }

    // ================================ Icon ================================
    const mergedExpandIcon = computed(() => props?.expandIcon ?? contextExpandIcon.value)

    // ================================ Open ================================
    const originOpen = computed(() => {
      const key = props?.eventKey
      return key ? openKeys.value.includes(key) : false
    })
    const open = computed(() => !overflowDisabled.value && originOpen.value)

    // =============================== Select ===============================
    const childrenSelected = computed(() => {
      const key = props?.eventKey
      return key ? pathUserContext.isSubPathKey(selectedKeys.value, key) : false
    })

    // =============================== Active ===============================
    const eventKeyForActive = computed(() => props?.eventKey || '')
    const { active, ...activeProps } = useActive(
      eventKeyForActive,
      mergedDisabled,
      (e: any) => props?.onTitleMouseEnter?.(e),
      (e: any) => props?.onTitleMouseLeave?.(e),
    )

    const childrenActive = ref(false)

    const triggerChildrenActive = (newActive: boolean) => {
      if (!mergedDisabled.value) {
        childrenActive.value = newActive
      }
    }

    const onInternalMouseEnter = (domEvent: MouseEvent) => {
      triggerChildrenActive(true)
      props?.onMouseEnter?.({
        key: props.eventKey!,
        domEvent,
      })
    }

    const onInternalMouseLeave = (domEvent: MouseEvent) => {
      triggerChildrenActive(false)
      props?.onMouseLeave?.({
        key: props.eventKey!,
        domEvent,
      })
    }

    const mergedActive = computed(() => {
      if (active.value) {
        return active.value
      }
      if (mode.value !== 'inline') {
        const key = props?.eventKey
        const currentActiveKey = activeKey.value
        return (
          childrenActive.value
          || (key && currentActiveKey ? pathUserContext.isSubPathKey([currentActiveKey], key) : false)
        )
      }
      return false
    })

    // ========================== DirectionStyle ==========================
    const pathLength = computed(() => connectedPath.value.length)
    const directionStyle = useDirectionStyle(pathLength)

    // =============================== Events ===============================
    const onInternalTitleClick = (e: MouseEvent) => {
      if (mergedDisabled.value) {
        return
      }
      const key = props?.eventKey
      props?.onTitleClick?.({
        key: key!,
        domEvent: e,
      })
      if (mode.value === 'inline' && key) {
        onOpenChange(key, !originOpen.value)
      }
    }

    const onPopupVisibleChange = (newVisible: boolean) => {
      const key = props?.eventKey
      if (mode.value !== 'inline' && key) {
        onOpenChange(key, newVisible)
      }
    }

    const onInternalFocus = () => {
      const key = props?.eventKey
      if (key) {
        onActive(key)
      }
    }

    // Cache mode
    const triggerModeRef = ref(mode.value)
    watch(
      mode,
      () => {
        if (mode.value !== 'inline' && validConnectedPath.value.length > 1) {
          triggerModeRef.value = 'vertical'
        }
        else {
          triggerModeRef.value = mode.value
        }
      },
      { immediate: true },
    )
    return () => {
      const {
        style,
        title,
        class: className,
        popupClassName,
        popupOffset,
        popupStyle,
        ...restProps
      } = props

      const children = slots.default?.()
      const popupId = domDataId.value && `${domDataId.value}-popup`
      // >>>>> Expand Icon
      const expandIconProps = {
        isOpen: open.value,
        isSelected: childrenSelected.value,
        isSubMenu: true,
        disabled: mergedDisabled.value,
      }

      const expandIconNode = (
        <Icon
          icon={mode.value !== 'horizontal' ? mergedExpandIcon.value : undefined}
          props={expandIconProps}
        >
          <i class={`${subMenuPrefixCls.value}-arrow`} />
        </Icon>
      )

      // >>>>> Title
      let titleNode = (
        <div
          role="menuitem"
          style={directionStyle.value}
          class={`${subMenuPrefixCls.value}-title`}
          tabindex={mergedDisabled.value ? undefined : -1}
          title={typeof title === 'string' ? title : undefined}
          data-menu-id={overflowDisabled.value && domDataId.value ? undefined : domDataId.value}
          aria-expanded={open.value}
          aria-haspopup
          aria-controls={popupId}
          aria-disabled={mergedDisabled.value}
          onClick={onInternalTitleClick}
          onFocus={onInternalFocus}
          {...activeProps}
        >
          { title }
          {expandIconNode}
        </div>
      )

      const popupContentTriggerMode = triggerModeRef.value
      // >>>>> Popup Content
      const renderPopupContent = () => {
        const originNode = (
          <MenuContextProvider
            classNames={props.classNames}
            styles={props.styles}
            mode={popupContentTriggerMode === 'horizontal' ? 'vertical' : popupContentTriggerMode}
          >
            <SubMenuList id={popupId}>
              {children}
            </SubMenuList>
          </MenuContextProvider>
        )

        const mergedPopupRender = props?.popupRender || contextPopupRender.value
        if (mergedPopupRender) {
          return mergedPopupRender(originNode, {
            item: props,
            keys: validConnectedPath.value,
          })
        }
        return originNode
      }

      if (!overflowDisabled.value) {
        const triggerMode = triggerModeRef.value
        titleNode = (
          <PopupTrigger
            mode={triggerMode}
            prefixCls={subMenuPrefixCls.value}
            visible={!props?.internalPopupClose && open.value && mode.value !== 'inline'}
            popupClassName={popupClassName}
            popupOffset={popupOffset}
            popupStyle={popupStyle}
            popup={renderPopupContent()}
            disabled={mergedDisabled.value}
            onVisibleChange={onPopupVisibleChange}
          >
            {titleNode}
          </PopupTrigger>
        )
      }

      // >>>>> List Node
      let listNode = (
        <Overflow.Item
          role="none"
          {...attrs as any}
          {...restProps}
          component="li"
          style={style}
          class={classNames(
            subMenuPrefixCls.value,
            `${subMenuPrefixCls.value}-${mode.value}`,
            className,
            {
              [`${subMenuPrefixCls.value}-open`]: open.value,
              [`${subMenuPrefixCls.value}-active`]: mergedActive.value,
              [`${subMenuPrefixCls.value}-selected`]: childrenSelected.value,
              [`${subMenuPrefixCls.value}-disabled`]: mergedDisabled.value,
            },
          )}
          onMouseenter={onInternalMouseEnter}
          onMouseleave={onInternalMouseLeave}
        >
          {titleNode}

          {!overflowDisabled.value && (
            <InlineSubMenuList
              id={popupId}
              open={open.value}
              keyPath={validConnectedPath.value}
            >
              {children}
            </InlineSubMenuList>
          )}
        </Overflow.Item>
      )

      if (_internalRenderSubMenuItem) {
        listNode = _internalRenderSubMenuItem(listNode, props, {
          selected: childrenSelected.value,
          active: mergedActive.value,
          open: open.value,
          disabled: mergedDisabled.value,
        })
      }

      return listNode
    }
  },
  {
    name: 'InternalSubMenu',
    inheritAttrs: false,
  },
)

const SubMenu = defineComponent<SubMenuProps>(
  (props, { slots }) => {
    const eventKeyRef = computed(() => props?.eventKey)
    const connectedKeyPath = useFullPath(eventKeyRef)
    const measure = useMeasure()

    // Filter out undefined values
    const validKeyPath = computed(() =>
      connectedKeyPath.value.filter((k): k is string => k !== undefined),
    )

    watch(
      [validKeyPath, () => props.eventKey],
      () => {
        if (measure && props.eventKey) {
          measure.registerPath(props.eventKey, validKeyPath.value)
        }
      },
      // { immediate: true, flush: 'post' },
    )
    return () => {
      const children = slots.default?.()
      const childList = parseChildren(children, validKeyPath.value)

      let renderNode: VueNode

      if (measure) {
        renderNode = childList
      }
      else {
        renderNode = <InternalSubMenu {...props}>{childList}</InternalSubMenu>
      }

      return (
        <PathTrackerContext.Provider value={validKeyPath.value}>
          {renderNode}
        </PathTrackerContext.Provider>
      )
    }
  },
  {
    name: 'SubMenu',
    inheritAttrs: false,
  },
)

export default SubMenu
