import type { CSSProperties, ExtractPropTypes, PropType } from 'vue'
import type { MenuInfo, MenuItemType } from './interface'
import Overflow from '@v-c/overflow'
import KeyCode from '@v-c/util/dist/KeyCode'
import omit from '@v-c/util/dist/omit'
// import { useComposeRef } from '@v-c/util/dist/ref'
import warning from '@v-c/util/dist/warning'
import classNames from 'classnames'
import { defineComponent, ref, watch } from 'vue'
import { useMenuId } from './context/IdContext.tsx'
import { useInjectMenu } from './context/MenuContext'
import { useFullPath, useMeasure } from './context/PathContext.tsx'
import { useInjectPrivateContext } from './context/PrivateContext.tsx'
import useActive from './hooks/useActive'
import useDirectionStyle from './hooks/useDirectionStyle'
import Icon from './Icon'
import { warnItemProp } from './utils/warnUtil'

function menuItemProps() {
  return {
    eventKey: String,
    warnKey: Boolean,
    attribute: Object,
    disabled: Boolean,
    title: [String, Array, Object],
    icon: Function,
    itemIcon: Function,
    role: [Object, String],
    popupClassName: String,
    popupOffset: Array,
    onMouseenter: Function as PropType<MenuItemType['onMouseenter']>,
    onMouseleave: Function as PropType<MenuItemType['onMouseleave']>,
    onClick: Function as PropType<MenuItemType['onClick'] | ((e: MouseEvent) => void)>,
    onTitleClick: Function as PropType<(e: MouseEvent) => void>,
    component: String as PropType<any>,
    extra: Function,
    onKeydown: Function as PropType<(e: KeyboardEvent) => void>,
    onFocus: Function as PropType<(e: FocusEvent) => void>,
    tabIndex: [Number, String] as PropType<number | null>,
  }
}

export type MenuItemProps = Partial<ExtractPropTypes<ReturnType<typeof menuItemProps>>>

// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.

const LegacyMenuItem = defineComponent({
  name: 'LegacyMenuItem',
  inheritAttrs: false,
  props: menuItemProps(),
  emits: ['mouseenter', 'mouseleave', 'keydown', 'click', 'focus', 'titleClick'],
  setup(props, { attrs, slots }) {
    return () => {
      const { title, attribute, ...restProps } = props

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
          {...attribute}
          title={typeof title === 'string' ? title : undefined}
          {...passedProps}
          {...attrs}
          v-slots={{
            default: () => slots.default?.(),
          }}
        />
      )
    }
  },
})

/**
 * Real Menu Item component
 */
const InternalMenuItem = defineComponent({
  name: 'InternalMenuItem',
  inheritAttrs: false,
  props: menuItemProps(),
  emits: ['click', 'mouseenter', 'mouseleave', 'focus', 'keydown'],
  setup(props, { attrs, slots, emit }) {
    const domDataId = useMenuId(props.eventKey!)

    const {
      prefixCls,
      onItemClick,

      disabled: contextDisabled,
      overflowDisabled,

      // Icon
      itemIcon: contextItemIcon,

      // Select
      selectedKeys,

      // Active
      onActive,
    } = useInjectMenu()

    const { _internalRenderMenuItem } = useInjectPrivateContext()

    const itemCls = `${prefixCls}-item`

    const legacyMenuItemRef = ref<any>()
    // const elementRef = ref<HTMLLIElement>()
    const mergedDisabled = contextDisabled || props.disabled

    // const mergedEleRef = useComposeRef(ref, elementRef)

    const connectedKeys = useFullPath(props.eventKey)

    // ================================ Warn ================================
    if (process.env.NODE_ENV !== 'production' && props.warnKey) {
      warning(false, 'MenuItem should not leave undefined `key`.')
    }

    // ============================= Info =============================
    const getEventInfo = (
      e: MouseEvent | KeyboardEvent,
    ): MenuInfo => {
      return {
        key: props.eventKey!,
        // Note: For legacy code is reversed which not like other antd component
        keyPath: [...connectedKeys].reverse(),
        item: legacyMenuItemRef.value,
        domEvent: e,
      }
    }

    // ============================= Icon =============================
    const mergedItemIcon = props.itemIcon || contextItemIcon

    // ============================ Active ============================
    const { active, ...activeProps } = useActive(
      props.eventKey!,
      mergedDisabled,
      props.onMouseenter,
      props.onMouseleave,
    )

    // ============================ Select ============================
    const selected = selectedKeys.value?.includes(props.eventKey)

    // ======================== DirectionStyle ========================
    const directionStyle = useDirectionStyle(connectedKeys?.length)

    // ============================ Events ============================
    const onInternalClick = (e: MouseEvent) => {
      if (mergedDisabled) {
        return
      }

      const info = getEventInfo(e)

      emit('click', warnItemProp(info))
      onItemClick(info)
    }

    const onInternalKeyDown = (e: KeyboardEvent) => {
      emit('keydown', e)

      if (e.which === KeyCode.ENTER) {
        const info = getEventInfo(e)

        // Legacy. Key will also trigger click event
        emit('click', warnItemProp(info))
        onItemClick(info)
      }
    }

    /**
     * Used for accessibility. Helper will focus element without key board.
     * We should manually trigger an active
     */
    const onInternalFocus = (e: FocusEvent) => {
      onActive(props.eventKey)
      emit('focus', e)
    }

    return () => {
      const {
        eventKey,
        warnKey,
        disabled,
        itemIcon,

        // Aria
        role,

        // Active
        onMouseenter,
        onMouseleave,

        onClick,
        onKeydown,

        onFocus,

        ...restProps
      } = props
      // ============================ Render ============================
      const optionRoleProps: { 'aria-selected'?: boolean } = {}

      if (role === 'option') {
        optionRoleProps['aria-selected'] = selected
      }

      let renderNode = (
        <LegacyMenuItem
          ref={legacyMenuItemRef}
          // elementRef={mergedEleRef}
          role={role === null ? 'none' : role || 'menuitem'}
          tabIndex={disabled ? null : -1}
          data-menu-id={overflowDisabled && domDataId ? null : domDataId}
          {...omit(restProps, ['extra'])}
          {...activeProps}
          {...optionRoleProps}
          component="li"
          aria-disabled={disabled}
          style={{
            ...directionStyle,
            ...attrs.style as CSSProperties,
          }}
          class={classNames(
            itemCls,
            {
              [`${itemCls}-active`]: active,
              [`${itemCls}-selected`]: selected,
              [`${itemCls}-disabled`]: mergedDisabled,
            },
            [attrs.class],
          )}
          onClick={onInternalClick}
          onKeydown={onInternalKeyDown}
          onFocus={onInternalFocus}
        >
          {slots.default?.()}
          <Icon
            {...props}
            isSelected={selected}
            icon={mergedItemIcon}
          />
        </LegacyMenuItem>
      )

      if (_internalRenderMenuItem) {
        renderNode = _internalRenderMenuItem(renderNode, props, { selected })
      }
      return renderNode
    }
  },
})

export default defineComponent({
  name: 'MenuItem',
  inheritAttrs: false,
  props: menuItemProps(),
  setup(props, { slots }) {
    // ==================== Record KeyPath ====================
    const measure = useMeasure()
    const connectedKeyPath = useFullPath(props.eventKey)

    watch(() => connectedKeyPath, (newPath, _oldPath, onCleanup) => {
      if (measure) {
        measure.registerPath(props.eventKey!, newPath)

        onCleanup(() => {
          measure.unregisterPath(props.eventKey!, newPath)
        })
      }
    })

    // ======================== Render ========================
    return () => {
      if (measure) {
        return null
      }
      return <InternalMenuItem {...props} v-slots={slots} />
    }
  },
})
