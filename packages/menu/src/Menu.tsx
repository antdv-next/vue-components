import type { CSSProperties, ExtractPropTypes, PropType, SlotsType, VNode } from 'vue'
import type {
  BuiltinPlacements,
  Components,
  ItemType,
  MenuClickEventHandler,
  MenuInfo,
  MenuMode,
  PopupRender,
  RenderIconType,
  SelectEventHandler,
  SelectInfo,
  TriggerSubMenuAction,
} from './interface'
import type { SemanticName } from './SubMenu'
import Overflow from '@v-c/overflow'
import isEqual from '@v-c/util/dist/isEqual'
import warning from '@v-c/util/dist/warning'
import classNames from 'classnames'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { IdContextProvider } from './context/IdContext'
import MenuContextProvider from './context/MenuContext'
import { PathRegisterContextProvider, PathUserContextProvider } from './context/PathContext'
import { PrivateContextProvider } from './context/PrivateContext'
import { refreshElements, useAccessibility } from './hooks/useAccessibility'
import useKeyRecords, { OVERFLOW_KEY } from './hooks/useKeyRecords'
import useMemoCallback from './hooks/useMemoCallback'
import useUUID from './hooks/useUUID'
import MenuItem from './MenuItem'
import SubMenu from './SubMenu'
import { parseItems } from './utils/nodeUtil'
import { warnItemProp } from './utils/warnUtil'

/**
 * Menu modify after refactor:
 * ## Add
 * - disabled
 *
 * ## Remove
 * - openTransitionName
 * - openAnimation
 * - onDestroy
 * - siderCollapsed: Seems antd do not use this prop (Need test in antd)
 * - collapsedWidth: Seems this logic should be handle by antd Layout.Sider
 */

// optimize for render
const EMPTY_LIST: string[] = []

export function menuProps() {
  return {
    id: String,
    tabIndex: {
      type: Number,
      default: 0,
    },
    prefixCls: {
      type: String,
      default: () => 'vc-menu',
    },
    rootClassName: String,
    classNames: Object as PropType<Partial<Record<SemanticName, object>>>,
    styles: Object as PropType<Partial<Record<SemanticName, CSSProperties>>>,
    items: [Array, Object] as PropType<ItemType[]>,

    /** @deprecated Please use `items` instead */

    disabled: Boolean,
    /** @private Disable auto overflow. Pls note the prop name may refactor since we do not final decided. */
    disabledOverflow: Boolean,

    /** direction of menu */
    direction: String as PropType<'ltr' | 'rtl'>,

    // Mode
    mode: {
      type: String as PropType<MenuMode>,
      default: () => 'vertical',
    },
    inlineCollapsed: Boolean,

    // Open control
    defaultOpenKeys: Array as PropType<string[]>,
    openKeys: [Array, Object] as PropType<string[] | object>,

    // Active control
    activeKey: String,
    defaultActiveFirst: Boolean,

    // Selection
    selectable: {
      type: Boolean,
      default: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },

    defaultSelectedKeys: Array as PropType<string[]>,
    selectedKeys: Array as PropType<string[]>,

    onSelect: Function as PropType<SelectEventHandler>,
    onDeselect: Function as PropType<SelectEventHandler>,

    // Level
    inlineIndent: {
      type: Number,
      default: 24,
    },

    // Motion
    /** Menu motion define. Use `defaultMotions` if you need config motion of each mode */
    motion: Object,
    /** Default menu motion of each mode */
    defaultMotions: Object as PropType<Partial<{ [key in MenuMode | 'other']: object }>>,

    // Popup
    subMenuOpenDelay: { type: Number, default: 0.1 },
    subMenuCloseDelay: { type: Number, default: 0.1 },
    forceSubMenuRender: Boolean,
    triggerSubMenuAction: {
      type: String as PropType<TriggerSubMenuAction>,
      default: () => 'hover',
    },
    builtinPlacements: Object as PropType<BuiltinPlacements>,

    // Icon
    itemIcon: Function as PropType<(v: RenderIconType) => any>,
    expandIcon: Function as PropType<(v: RenderIconType) => any>,
    overflowedIndicator: {
      type: String,
    },
    /** @private Internal usage. Do not use in your production. */
    overflowedIndicatorPopupClassName: String,

    // >>>>> Function
    getPopupContainer: Function as PropType<(node: HTMLElement) => HTMLElement>,

    // >>>>> Events
    onClick: Function as PropType<MenuClickEventHandler>,
    onOpenChange: Function as PropType<(openKeys: string[]) => void>,
    onKeydown: Function as PropType<(e: KeyboardEvent) => void>,
    openAnimation: String,
    openTransitionName: String,

    // >>>>> Internal
    _internalRenderMenuItem: Function as PropType<(
      originNode: VNode,
      menuItemProps: any,
      stateProps: {
        selected: boolean
      },
    ) => VNode>,
    _internalRenderSubMenuItem: Function as PropType<(
      originNode: VNode,
      subMenuItemProps: any,
      stateProps: {
        selected: boolean
        open: boolean
        active: boolean
        disabled: boolean
      },
    ) => VNode>,

    /**
     * @private NEVER! EVER! USE IN PRODUCTION!!!
     * This is a hack API for `antd` to fix `findDOMNode` issue.
     * Not use it! Not accept any PR try to make it as normal API.
     * By zombieJ
     */
    _internalComponents: Object as PropType<Components>,

    popupRender: Function as PropType<PopupRender>,
  }
}

export type MenuProps = Partial<ExtractPropTypes<ReturnType<typeof menuProps>>>

export interface LegacyMenuProps extends MenuProps {
  openTransitionName: string
  openAnimation: string
}

export default defineComponent({
  name: 'Menu',
  inheritAttrs: false,
  props: {
    ...menuProps(),
  },
  emits: ['click', 'deselect', 'select', 'openChange'],
  slots: Object as SlotsType<{
    default: any
    overflowedIndicator: any
  }>,
  setup(props, { attrs, expose, emit, slots }) {
    const mounted = ref(false)

    const containerRef = ref<HTMLUListElement>()

    const uuid = useUUID(props.id)

    const isRtl = computed(() => props.direction === 'rtl')

    // ========================= Warn =========================
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !props.openAnimation && !props.openTransitionName,
        '`openAnimation` and `openTransitionName` is removed. Please use `motion` or `defaultMotion` instead.',
      )
    }

    // ========================= Open =========================
    const mergedOpenKeys = ref(props.defaultOpenKeys || props.openKeys)

    // React 18 will merge mouse event which means we open key will not sync
    // ref: https://github.com/ant-design/ant-design/issues/38818
    const triggerOpenKeys = (keys: string[], _forceFlush = false) => {
      mergedOpenKeys.value = keys
      emit('openChange', keys)
    }

    // >>>>> Cache & Reset open keys when inlineCollapsed changed
    const inlineCacheOpenKeys = ref(mergedOpenKeys.value)

    const mountRef = ref(false)

    // ========================= Mode =========================
    const mergedMode = ref<MenuMode>('vertical')
    const mergedInlineCollapsed = ref(false)
    watchEffect(() => {
      const { mode, inlineCollapsed } = props
      if ((mode === 'inline' || mode === 'vertical') && inlineCollapsed) {
        mergedMode.value = 'vertical'
        mergedInlineCollapsed.value = inlineCollapsed
      }
      else {
        mergedMode.value = mode
        mergedInlineCollapsed.value = false
      }
    })

    const isInlineMode = computed(() => mergedMode.value === 'inline')

    const internalMode = ref<MenuMode>(mergedMode.value)
    const internalInlineCollapsed = ref(mergedInlineCollapsed)

    watch([mergedMode, mergedInlineCollapsed], () => {
      internalMode.value = mergedMode.value
      internalInlineCollapsed.value = mergedInlineCollapsed.value

      if (!mountRef.value) {
        return
      }
      // Synchronously update MergedOpenKeys
      if (isInlineMode.value) {
        mergedOpenKeys.value = inlineCacheOpenKeys.value
      }
      else {
        // Trigger open event in case its in control
        triggerOpenKeys(EMPTY_LIST)
      }
    })

    // ====================== Responsive ======================
    const lastVisibleIndex = ref(0)

    // Cache
    watch(mergedOpenKeys, () => {
      if (isInlineMode.value) {
        inlineCacheOpenKeys.value = mergedOpenKeys.value
      }
    })
    onMounted(() => {
      mountRef.value = true
      mounted.value = true
    })
    onUnmounted(() => {
      mountRef.value = false
    })

    // ========================= Path =========================
    const {
      registerPath,
      unregisterPath,
      refreshOverflowKeys,

      isSubPathKey,
      getKeyPath,
      getKeys,
      getSubPathKeys,
    } = useKeyRecords()

    // ======================== Active ========================
    const mergedActiveKey = ref(props.activeKey)

    const onActive = useMemoCallback((key: string) => {
      mergedActiveKey.value = key
    })

    const onInactive = useMemoCallback(() => {
      mergedActiveKey.value = undefined
    })

    expose({
      list: containerRef.value,
      focus: (_options: unknown) => {
        // const keys = getKeys()
        // const { elements, key2element, element2key } = refreshElements(keys, uuid)
        // const focusableElements = getFocusableElements(containerRef.value, elements)
        //
        // const shouldFocusKey = mergedActiveKey
        //   ?? (focusableElements[0]
        //     ? element2key.get(focusableElements[0])
        //     : childList.find(node => !node.props.disabled)?.key)
        //
        // const elementToFocus = key2element.get(shouldFocusKey.value)
        //
        // if (shouldFocusKey && elementToFocus) {
        //   elementToFocus?.focus?.(options)
        // }
      },
      findItem: ({ key: itemKey }: any) => {
        const keys = getKeys()
        const { key2element } = refreshElements(keys, uuid.value!)
        return key2element.get(itemKey) || null
      },
    })

    // ======================== Select ========================
    // >>>>> Select keys
    const mergedSelectKeys = ref(props.defaultSelectedKeys || [] || props.selectedKeys)
    computed(() => {
      const keys = mergedSelectKeys.value
      if (Array.isArray(keys)) {
        return keys
      }

      if (keys === null || keys === undefined) {
        return EMPTY_LIST
      }

      return [keys]
    })

    // >>>>> Trigger select
    const triggerSelection = (info: MenuInfo) => {
      if (props.selectable) {
        // Insert or Remove
        const { key: targetKey } = info
        const exist = mergedSelectKeys.value.includes(targetKey)
        let newSelectKeys: string[]

        if (props.multiple) {
          if (exist) {
            newSelectKeys = mergedSelectKeys.value.filter((key: unknown) => key !== targetKey)
          }
          else {
            newSelectKeys = [...mergedSelectKeys.value, targetKey]
          }
        }
        else {
          newSelectKeys = [targetKey]
        }

        mergedSelectKeys.value = newSelectKeys

        // Trigger event
        const selectInfo: SelectInfo = {
          ...info,
          selectedKeys: newSelectKeys,
        }

        if (exist) {
          emit('deselect', selectInfo)
        }
        else {
          emit('select', selectInfo)
        }
      }

      // Whatever selectable, always close it
      if (!props.multiple && mergedOpenKeys.value?.length && internalMode.value !== 'inline') {
        triggerOpenKeys(EMPTY_LIST)
      }
    }

    // ========================= Open =========================
    /**
     * Click for item. SubMenu do not have selection status
     */
    const onInternalClick = useMemoCallback((info: MenuInfo) => {
      emit('click', warnItemProp(info))
      triggerSelection(info)
    })

    const onInternalOpenChange = useMemoCallback((key: string, open: boolean) => {
      let newOpenKeys = mergedOpenKeys.value?.filter((k: unknown) => k !== key)

      if (open) {
        newOpenKeys?.push(key)
      }
      else if (internalMode.value !== 'inline') {
        // We need find all related popup to close
        const subPathKeys = getSubPathKeys(key)
        newOpenKeys = newOpenKeys?.filter(k => !subPathKeys.has(k))
      }

      if (!isEqual(mergedOpenKeys.value, newOpenKeys, true)) {
        triggerOpenKeys(newOpenKeys!, true)
      }
    })

    // ==================== Accessibility =====================
    const triggerAccessibilityOpen = (key: string, open: boolean) => {
      const nextOpen = open ?? !mergedOpenKeys.value?.includes(key)

      onInternalOpenChange(key, nextOpen)
    }

    const onInternalKeyDown = useAccessibility(
      internalMode,
      mergedActiveKey,
      isRtl,
      uuid!,

      containerRef,
      getKeys,
      getKeyPath,
      triggerAccessibilityOpen,

      props.onKeydown,
    )

    // >>>>> Render
    return () => {
      const {
        prefixCls = 'vc-menu',
        rootClassName,
        styles,
        classNames: menuClassNames,
        tabIndex = 0,
        items,
        direction,

        id,

        // Mode
        mode = 'vertical',
        inlineCollapsed,

        // Disabled
        disabled,
        disabledOverflow,

        // Open
        subMenuOpenDelay = 0.1,
        subMenuCloseDelay = 0.1,
        forceSubMenuRender,
        defaultOpenKeys,
        openKeys,

        // Active
        activeKey,
        defaultActiveFirst,

        // Selection
        selectable = true,
        multiple = false,
        defaultSelectedKeys,
        selectedKeys,
        onSelect,
        onDeselect,

        // Level
        inlineIndent = 24,

        // Motion
        motion,
        defaultMotions,

        // Popup
        triggerSubMenuAction = 'hover',
        builtinPlacements,

        // Icon
        itemIcon,
        expandIcon,
        overflowedIndicator = slots.overflowedIndicator?.() || '...',
        overflowedIndicatorPopupClassName,

        // Function
        getPopupContainer,

        // Events
        onClick,
        onOpenChange,
        onKeydown,

        // Deprecated
        openAnimation,
        openTransitionName,

        // Internal
        _internalRenderMenuItem,
        _internalRenderSubMenuItem,

        _internalComponents,

        popupRender,
      } = props
      const [childList, measureChildList] = [
        parseItems(slots.default?.(), items, EMPTY_LIST, _internalComponents, prefixCls),
        parseItems(slots.default?.(), items, EMPTY_LIST, {}, prefixCls),
      ]

      const allVisible = lastVisibleIndex.value >= childList.length - 1 || internalMode.value !== 'horizontal' || disabledOverflow
      refreshOverflowKeys(
        allVisible
          ? EMPTY_LIST
          : childList.slice(lastVisibleIndex.value + 1).map(child => child.key as string),
      )

      const registerPathContext = { registerPath, unregisterPath }

      const pathUserContext = { isSubPathKey }

      // ======================= Context ========================
      const privateContext = {
        _internalRenderMenuItem,
        _internalRenderSubMenuItem,
      }

      // ======================== Render ========================

      // >>>>> Children
      const wrappedChildList = internalMode.value !== 'horizontal' || disabledOverflow
        ? childList
        : childList.map((child, index) => (
            // Always wrap provider to avoid sub node re-mount
            <MenuContextProvider
              key={child.key}
              overflowDisabled={index > lastVisibleIndex.value}
              class={menuClassNames}
              styles={styles}
            >
              {child}
            </MenuContextProvider>
          ))

      // >>>>> Container
      const container = (
        <Overflow
          id={id}
          ref={containerRef as any}
          prefixCls={`${prefixCls}-overflow`}
          component="ul"
          itemComponent={MenuItem}
          class={classNames(
            prefixCls,
            `${prefixCls}-root`,
            `${prefixCls}-${internalMode.value}`,
            [attrs.class],
            {
              [`${prefixCls}-inline-collapsed`]: internalInlineCollapsed.value,
              [`${prefixCls}-rtl`]: isRtl.value,
            },
            rootClassName,
          )}
          dir={direction}
          // style={{ ...attrs.style as CSSProperties }}
          role="menu"
          tabIndex={tabIndex}
          data={wrappedChildList}
          maxCount={
            internalMode.value !== 'horizontal' || disabledOverflow
              ? Overflow.INVALIDATE
              : Overflow.RESPONSIVE
          }
          ssr="full"
          data-menu-list
          onVisibleChange={(newLastIndex) => {
            lastVisibleIndex.value = newLastIndex
          }}
          onKeydown={onInternalKeyDown}
          v-slots={{
            renderRawItem: node => node,
            renderRawRest: (omitItems) => {
              // We use origin list since wrapped list use context to prevent open
              const len = omitItems.length

              const originOmitItems = len ? childList.slice(-len) : null

              return (
                <SubMenu
                  eventKey={OVERFLOW_KEY}
                  disabled={allVisible}
                  internalPopupClose={len === 0}
                  popupClassName={overflowedIndicatorPopupClassName}
                  v-slots={{
                    title: () => overflowedIndicator,
                  }}
                >
                  {originOmitItems}
                </SubMenu>
              )
            },
          }}
        />
      )
      return (
        <>
          <PrivateContextProvider value={privateContext}>
            <IdContextProvider value={uuid.value}>
              <MenuContextProvider
                prefixCls={prefixCls}
                rootClassName={rootClassName}
                classNames={menuClassNames}
                styles={styles}
                mode={internalMode}
                openKeys={mergedOpenKeys}
                rtl={isRtl.value}
                // Disabled
                disabled={disabled}
                // Motion
                motion={mounted.value ? motion : null}
                defaultMotions={mounted.value ? defaultMotions : null}
                // Active
                activeKey={mergedActiveKey}
                onActive={onActive}
                onInactive={onInactive}
                // Selection
                selectedKeys={mergedSelectKeys}
                // Level
                inlineIndent={inlineIndent}
                // Popup
                subMenuOpenDelay={subMenuOpenDelay}
                subMenuCloseDelay={subMenuCloseDelay}
                forceSubMenuRender={forceSubMenuRender}
                builtinPlacements={builtinPlacements}
                triggerSubMenuAction={triggerSubMenuAction}
                getPopupContainer={getPopupContainer}
                // Icon
                itemIcon={itemIcon}
                expandIcon={expandIcon}
                // Events
                onItemClick={onInternalClick}
                onOpenChange={onInternalOpenChange}
                popupRender={popupRender}
              >
                <PathUserContextProvider value={pathUserContext}>{container}</PathUserContextProvider>

                {/* Measure menu keys. Use positioning to make it invisible but measurable */}
                <div style={{ display: 'none' }} aria-hidden>
                  <PathRegisterContextProvider value={registerPathContext}>
                    {measureChildList}
                  </PathRegisterContextProvider>
                </div>
              </MenuContextProvider>
            </IdContextProvider>
          </PrivateContextProvider>
        </>
      )
    }
  },
})
