import type { CSSProperties, PropType, SlotsType, VNode } from 'vue'
import type { MenuInfo, PopupRender, SubMenuType } from '../interface'
import Overflow from '@v-c/overflow'
import warning from '@v-c/util/dist/warning'
import { classNames } from '@v-c/util'
import { computed, defineComponent, ref, watch } from 'vue'
import { useMenuId } from '../context/IdContext.tsx'
import MenuContextProvider, { useInjectMenu } from '../context/MenuContext'
import {
  PathTrackerContextProvider,
  useFullPath,
  useInjectPathUserContext,
  useMeasure,
} from '../context/PathContext.tsx'
import { useInjectPrivateContext } from '../context/PrivateContext.tsx'
import useActive from '../hooks/useActive'
import useDirectionStyle from '../hooks/useDirectionStyle'
import useMemoCallback from '../hooks/useMemoCallback'
import Icon from '../Icon'
import { parseChildren } from '../utils/commonUtil'
import { warnItemProp } from '../utils/warnUtil'
import InlineSubMenuList from './InlineSubMenuList'
import PopupTrigger from './PopupTrigger'
import SubMenuList from './SubMenuList'

export type SemanticName = 'list' | 'listTitle'
export interface SubMenuProps extends Omit<SubMenuType, 'key' | 'children' | 'label'> {
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  title?: VNode

  children?: VNode

  /** @private Used for rest popup. Do not use in your prod */
  internalPopupClose?: boolean

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean
  popupRender?: PopupRender
  // >>>>>>>>>>>>>>>>>>>>> Next  Round <<<<<<<<<<<<<<<<<<<<<<<
  // onDestroy?: DestroyEventHandler;
}

const InternalSubMenu = defineComponent({
  name: 'InternalSubMenu',
  inheritAttrs: false,
  props: {
    id: String,
    title: {
      type: [String, Object],
    },
    classNames: Object,
    styles: Object,
    eventKey: String,
    internalPopupClose: Boolean,
    warnKey: Boolean,
    disabled: Boolean,
  },
  slots: Object as SlotsType<{
    title: any
    default: any
  }>,
  emits: ['mouseenter', 'mouseleave', 'keydown', 'click', 'focus', 'titleClick'],
  setup(props, { attrs, slots, emit }) {
    const domDataId = useMenuId(props.eventKey)

    const {
      prefixCls,
      mode,
      openKeys,

      // Disabled
      disabled: contextDisabled,
      overflowDisabled,

      // ActiveKey
      activeKey,

      // SelectKey
      selectedKeys,

      // Icon
      itemIcon: contextItemIcon,
      expandIcon: contextExpandIcon,

      // Events
      onItemClick,
      onOpenChange,

      onActive,
      popupRender: contextPopupRender,
    } = useInjectMenu()

    const { _internalRenderSubMenuItem } = useInjectPrivateContext()

    const { isSubPathKey } = useInjectPathUserContext()
    const connectedPath = useFullPath()

    const subMenuPrefixCls = `${prefixCls}-submenu`
    const mergedDisabled = contextDisabled || props.disabled
    const elementRef = ref<HTMLDivElement>()
    const popupRef = ref<HTMLUListElement>()

    // ================================ Warn ================================
    if (process.env.NODE_ENV !== 'production' && props.warnKey) {
      warning(false, 'SubMenu should not leave undefined `key`.')
    }

    // ================================ Icon ================================
    const mergedItemIcon = props.itemIcon ?? contextItemIcon
    const mergedExpandIcon = props.expandIcon ?? contextExpandIcon

    // ================================ Open ================================
    const originOpen = openKeys.value?.includes(props.eventKey)
    const open = !overflowDisabled && originOpen

    // =============================== Select ===============================
    const childrenSelected = isSubPathKey(selectedKeys, props.eventKey)

    // =============================== Active ===============================
    const { active, ...activeProps } = useActive(
      props.eventKey,
      mergedDisabled,
      props.onTitleMouseEnter,
      props.onTitleMouseLeave,
    )

    // Fallback of active check to avoid hover on menu title or disabled item
    const childrenActive = ref(false)

    const triggerChildrenActive = (newActive: boolean) => {
      if (!mergedDisabled) {
        childrenActive.value = newActive
      }
    }

    const onInternalMouseEnter = (domEvent: Event) => {
      triggerChildrenActive(true)
      emit('mouseenter', {
        key: props.eventKey,
        domEvent,
      })
    }

    const onInternalMouseLeave = (domEvent: Event) => {
      triggerChildrenActive(false)
      emit('mouseleave', {
        key: props.eventKey,
        domEvent,
      })
    }

    const mergedActive = computed(() => {
      if (active) {
        return active
      }

      if (mode !== 'inline') {
        return childrenActive || isSubPathKey([activeKey], props.eventKey)
      }

      return false
    })

    // ========================== DirectionStyle ==========================
    const directionStyle = useDirectionStyle(connectedPath.length)

    // =============================== Events ===============================
    // >>>> Title click
    const onInternalTitleClick = (e: MouseEvent) => {
      // Skip if disabled
      if (mergedDisabled) {
        return
      }
      emit('titleClick', {
        key: props.eventKey,
        domEvent: e,
      })

      // Trigger open by click when mode is `inline`
      if (mode === 'inline') {
        onOpenChange(!originOpen)
      }
    }

    // >>>> Context for children click
    const onMergedItemClick = useMemoCallback((info: MenuInfo) => {
      emit('click', warnItemProp(info))
      onItemClick(info)
    })

    // >>>>> Visible change
    const onPopupVisibleChange = (newVisible: boolean) => {
      if (mode !== 'inline') {
        onOpenChange(props.eventKey, newVisible)
      }
    }

    /**
     * Used for accessibility. Helper will focus element without key board.
     * We should manually trigger an active
     */
    const onInternalFocus = () => {
      onActive(props.eventKey)
    }

    return () => {
      const {

        styles,
        classNames: menuClassNames,

        title = slots.title?.(),
        eventKey,
        warnKey,

        disabled,
        internalPopupClose,
        // Icons
        itemIcon,
        expandIcon,

        // Popup
        popupClassName,
        popupOffset,
        popupStyle,

        // Events
        onClick,
        onMouseenter,
        onMouseleave,
        onTitleClick,
        onTitleMouseEnter,
        onTitleMouseLeave,
        popupRender: propsPopupRender,
        ...restProps
      } = props

      // =============================== Render ===============================
      const popupId = domDataId && `${domDataId}-popup`

      const expandIconNode = (
        <Icon
          icon={mode !== 'horizontal' ? mergedExpandIcon : undefined}
          {...props}
          isOpen={open}
          isSubMenu={true}
        >
          <i class={`${subMenuPrefixCls}-arrow`} />
        </Icon>
      )

      // >>>>> Title
      let titleNode = (
        <div
          role="menuitem"
          style={directionStyle}
          class={`${subMenuPrefixCls}-title`}
          tabIndex={mergedDisabled ? null : -1}
          ref={elementRef}
          title={typeof title === 'string' ? title : null}
          data-menu-id={overflowDisabled && domDataId ? null : domDataId}
          aria-expanded={open}
          aria-haspopup
          aria-controls={popupId}
          aria-disabled={mergedDisabled}
          onClick={onInternalTitleClick}
          onFocus={onInternalFocus}
          {...activeProps}
        >
          {title}
          {/* Only non-horizontal mode shows the icon */}
          {expandIconNode}
        </div>
      )

      // Cache mode if it change to `inline` which do not have popup motion
      const triggerModeRef = ref(mode)
      if (mode !== 'inline' && connectedPath.length > 1) {
        triggerModeRef.value = 'vertical'
      }
      else {
        // triggerModeRef.value = mode
      }
      const popupContentTriggerMode = triggerModeRef.value
      const renderPopupContent = () => {
        const originNode = (
          <MenuContextProvider
            class={classNames(menuClassNames, [attrs.class])}
            styles={styles}
            mode={popupContentTriggerMode === 'horizontal' ? 'vertical' : popupContentTriggerMode}
          >
            <SubMenuList id={popupId} ref={popupRef}>
              {slots.default?.()}
            </SubMenuList>
          </MenuContextProvider>
        )
        const mergedPopupRender = propsPopupRender || contextPopupRender
        if (mergedPopupRender) {
          const node = mergedPopupRender(originNode, {
            item: props,
            keys: connectedPath,
          })
          return node
        }
        return originNode
      }

      if (!overflowDisabled) {
        const triggerMode = triggerModeRef.value

        // Still wrap with Trigger here since we need avoid react re-mount dom node
        // Which makes motion failed
        titleNode = (
          <PopupTrigger
            mode={triggerMode}
            prefixCls={subMenuPrefixCls}
            visible={!internalPopupClose && open && mode !== 'inline'}
            popupClassName={popupClassName}
            popupOffset={popupOffset}
            popupStyle={popupStyle}
            disabled={mergedDisabled}
            onVisibleChange={onPopupVisibleChange}
            v-slots={{
              popup: () => renderPopupContent(),
            }}
          >
            {titleNode}
          </PopupTrigger>
        )
      }

      // >>>>> List node
      let listNode = (
        <Overflow.Item
          ref={ref}
          role="none"
          {...restProps}
          component="li"
          style={{ ...attrs.style as CSSProperties }}
          class={classNames(subMenuPrefixCls, `${subMenuPrefixCls}-${mode.value}`, [attrs.class], {
            [`${subMenuPrefixCls}-open`]: open,
            [`${subMenuPrefixCls}-active`]: mergedActive.value,
            [`${subMenuPrefixCls}-selected`]: childrenSelected,
            [`${subMenuPrefixCls}-disabled`]: mergedDisabled,
          })}
          onMouseenter={onInternalMouseEnter}
          onMouseleave={onInternalMouseLeave}
        >
          {titleNode}

          {/* Inline mode */}
          {!overflowDisabled && (
            <InlineSubMenuList id={popupId} open={open} keyPath={connectedPath}>
              {slots.default?.()}
            </InlineSubMenuList>
          )}
        </Overflow.Item>
      )

      if (_internalRenderSubMenuItem) {
        listNode = _internalRenderSubMenuItem(listNode, props, {
          selected: childrenSelected,
          active: mergedActive.value,
          open,
          disabled: mergedDisabled,
        })
      }

      // >>>>> Render
      return (
        <MenuContextProvider
          class={menuClassNames}
          styles={styles}
          onItemClick={onMergedItemClick}
          mode={mode === 'horizontal' ? 'vertical' : mode}
          itemIcon={mergedItemIcon}
          expandIcon={mergedExpandIcon}
        >
          {listNode}
        </MenuContextProvider>
      )
    }
  },
})

export default defineComponent({
  name: 'SubMenu',
  inheritAttrs: false,
  props: {
    prefixCls: String,
    mode: String,
    title: {
      type: [String, Object],
    },
    icon: {
      type: Object,
    },
    popupClassName: String,
    popupOffset: Array,
    popupStyle: Object,
    disabled: Boolean,
    popupRender: Function as PropType<PopupRender>,
    eventKey: String,
  },
  slots: Object as SlotsType<{
    title: any
    default: any
  }>,
  setup(props, { slots, attrs }) {
    const connectedKeyPath = useFullPath(props.eventKey)

    // ==================== Record KeyPath ====================
    const measure = useMeasure()
    watch(() => connectedKeyPath, (_newP, _oldP, onCleanup) => {
      if (measure) {
        measure.registerPath(props.eventKey, connectedKeyPath)
      }
      onCleanup(() => {
        measure.unregisterPath(props.eventKey, connectedKeyPath)
      })
    })

    return () => {
      const childList = parseChildren(slots.default?.(), connectedKeyPath)

      let renderNode

      // ======================== Render ========================
      if (measure) {
        renderNode = childList
      }
      else {
        renderNode = (
          <InternalSubMenu {...props} {...attrs} v-slots={slots}>
            {childList}
          </InternalSubMenu>
        )
      }
      return (
        <PathTrackerContextProvider value={connectedKeyPath}>
          {renderNode}
        </PathTrackerContextProvider>
      )
    }
  },
})
