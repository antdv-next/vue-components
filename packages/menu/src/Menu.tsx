import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
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
} from './interface.ts'
import type { SemanticName } from './SubMenu'
import Overflow from '@v-c/overflow'
import { classNames } from '@v-c/util'
import useId from '@v-c/util/dist/hooks/useId'
import isEqual from '@v-c/util/dist/isEqual'
import { filterEmpty } from '@v-c/util/dist/props-util'
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useIdContextProvide } from './context/IdContext'
import InheritableContextProvider, { useMenuContextProvider } from './context/MenuContext'
import { MeasureProvider, PathUserProvider } from './context/PathContext'
import { PrivateContextProvider } from './context/PrivateContext'
import useAccessibility, { getFocusableElements, refreshElements } from './hooks/useAccessibility.ts'
import useKeyRecords, { OVERFLOW_KEY } from './hooks/useKeyRecords.ts'
import useMemoCallback from './hooks/useMemoCallback.ts'
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
export interface MenuProps {
  prefixCls?: string
  rootClass?: string
  classes?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  items?: ItemType[]

  disabled?: boolean
  /** @private Disable auto overflow. Pls note the prop name may refactor since we do not final decided. */
  disabledOverflow?: boolean

  /** direction of menu */
  direction?: 'ltr' | 'rtl'

  // Mode
  mode?: MenuMode
  inlineCollapsed?: boolean

  // Open control
  defaultOpenKeys?: string[]
  openKeys?: string[]

  // Active control
  activeKey?: string
  defaultActiveFirst?: boolean

  // Selection
  selectable?: boolean
  multiple?: boolean

  defaultSelectedKeys?: string[]
  selectedKeys?: string[]

  onSelect?: SelectEventHandler
  onDeselect?: SelectEventHandler

  // Level
  inlineIndent?: number

  // Motion
  /** Menu motion define. Use `defaultMotions` if you need config motion of each mode */
  motion?: CSSMotionProps
  /** Default menu motion of each mode */
  defaultMotions?: Partial<{ [key in MenuMode | 'other']: CSSMotionProps }>

  // Popup
  subMenuOpenDelay?: number
  subMenuCloseDelay?: number
  forceSubMenuRender?: boolean
  triggerSubMenuAction?: TriggerSubMenuAction
  builtinPlacements?: BuiltinPlacements

  // Icon
  itemIcon?: RenderIconType
  expandIcon?: RenderIconType
  overflowedIndicator?: VueNode

  /** @private Internal usage. Do not use in your production. */
  overflowedIndicatorPopupClassName?: string

  // >>>>> Function
  getPopupContainer?: (node: HTMLElement) => HTMLElement

  // >>>>> Events
  onClick?: MenuClickEventHandler
  onOpenChange?: (openKeys: string[]) => void

  // >>>>> Internal
  /***
     * @private Only used for `pro-layout`. Do not use in your prod directly
     * and we do not promise any compatibility for this.
     */
  _internalRenderMenuItem?: (
    originNode: any,
    menuItemProps: any,
    stateProps: {
      selected: boolean
    },
  ) => any
  /***
     * @private Only used for `pro-layout`. Do not use in your prod directly
     * and we do not promise any compatibility for this.
     */
  _internalRenderSubMenuItem?: (
    originNode: any,
    subMenuItemProps: any,
    stateProps: {
      selected: boolean
      open: boolean
      active: boolean
      disabled: boolean
    },
  ) => any

  /**
   * @private NEVER! EVER! USE IN PRODUCTION!!!
   * This is a hack API for `antd` to fix `findDOMNode` issue.
   * Not use it! Not accept any PR try to make it as normal API.
   * By zombieJ
   */
  _internalComponents?: Components

  popupRender?: PopupRender
  id?: string

  labelRender?: (item: ItemType) => any
  extraRender?: (item: ItemType) => any
}

const defaults = {
  prefixCls: 'vc-menu',
  mode: 'vertical',
  subMenuOpenDelay: 0.1,
  subMenuCloseDelay: 0.1,
  selectable: true,
  multiple: false,
  inlineIndent: 24,
  triggerSubMenuAction: 'hover',
  overflowedIndicator: '...',
} as any

const Menu = defineComponent<MenuProps>(
  (props = defaults, { slots, expose, attrs: _attrs }) => {
    const containerRef = shallowRef<HTMLUListElement>()
    const uuid = useId(props?.id ? `rc-menu-uuid-${props.id}` : 'rc-menu-uuid')
    const isRtl = computed(() => props?.direction === 'rtl')
    const childList = shallowRef<any[]>([])
    const mergedOverflowIndicator = computed(
      () => props.overflowedIndicator ?? defaults.overflowedIndicator,
    )
    const overflowIndicatorVersion = ref(0)
    watch(
      mergedOverflowIndicator,
      () => {
        overflowIndicatorVersion.value += 1
      },
      { immediate: true },
    )

    // Provide uuid context
    useIdContextProvide(computed(() => uuid))

    // ========================= Open =========================
    const innerOpenKeys = ref(props?.openKeys ?? props?.defaultOpenKeys)
    watch(
      () => props.openKeys,
      () => {
        innerOpenKeys.value = props?.openKeys
      },
    )

    const mergedOpenKeys = computed({
      get() {
        if (props.openKeys) {
          return props.openKeys
        }
        return innerOpenKeys.value ?? EMPTY_LIST
      },
      set(value) {
        innerOpenKeys.value = value
      },
    })

    const triggerOpenKeys = (keys: string[], forceFlush = false) => {
      function doUpdate() {
        mergedOpenKeys.value = keys
        props?.onOpenChange?.(keys)
      }
      if (forceFlush) {
        nextTick(doUpdate)
      }
      else {
        doUpdate()
      }
    }

    // >>>>> Cache & Reset open keys when inlineCollapsed changed
    const inlineCacheOpenKeys = shallowRef(mergedOpenKeys.value)
    const mountRef = shallowRef(false)

    // ========================= Mode =========================
    const modeMerged = computed(() => {
      const { mode, inlineCollapsed } = props
      if ((mode === 'inline' || mode === 'vertical') && inlineCollapsed) {
        return ['vertical', inlineCollapsed]
      }
      return [mode, false]
    })
    const mergedMode = computed(() => modeMerged.value[0])
    const mergedInlineCollapsed = computed(() => modeMerged.value[1])
    const isInlineMode = computed(() => mergedMode.value === 'inline')
    const internalMode = shallowRef(mergedMode.value)
    const internalInlineCollapsed = shallowRef(mergedInlineCollapsed.value)

    watch(
      [mergedMode, mergedInlineCollapsed],
      () => {
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
      },
    )

    // ====================== Responsive ======================
    const lastVisibleIndex = shallowRef(0)

    // Cache
    watch(mergedOpenKeys, () => {
      if (isInlineMode.value) {
        inlineCacheOpenKeys.value = mergedOpenKeys.value
      }
    })
    onMounted(() => {
      mountRef.value = true
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

    // ======================= Context Providers ==============
    const registerPathContext = computed(() => ({
      registerPath,
      unregisterPath,
    }))

    const pathUserContext = computed(() => ({
      isSubPathKey,
    }))

    // ======================== Active ========================
    const mergedActiveKey = shallowRef(props?.activeKey)
    watch(
      () => props.activeKey,
      () => {
        mergedActiveKey.value = props?.activeKey
      },
    )

    const onActive = useMemoCallback((key: string) => {
      mergedActiveKey.value = key
    })
    const onInactive = useMemoCallback(() => {
      mergedActiveKey.value = undefined
    })

    // ======================== Select ========================
    // >>>>> Select keys
    const innerSelectKeys = ref(props?.selectedKeys ?? props?.defaultSelectedKeys ?? EMPTY_LIST)
    watch(
      () => props.selectedKeys,
      () => {
        if (props.selectedKeys) {
          innerSelectKeys.value = props.selectedKeys
        }
      },
    )

    const mergedSelectKeys = computed(() => {
      const keys = innerSelectKeys.value
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
            newSelectKeys = mergedSelectKeys.value.filter(key => key !== targetKey)
          }
          else {
            newSelectKeys = [...mergedSelectKeys.value, targetKey]
          }
        }
        else {
          newSelectKeys = [targetKey]
        }

        innerSelectKeys.value = newSelectKeys

        // Trigger event
        const selectInfo: SelectInfo = {
          ...info,
          selectedKeys: newSelectKeys,
        }

        if (exist) {
          props.onDeselect?.(selectInfo)
        }
        else {
          props.onSelect?.(selectInfo)
        }
      }

      // Whatever selectable, always close it
      if (!props.multiple && mergedOpenKeys.value.length && internalMode.value !== 'inline') {
        triggerOpenKeys(EMPTY_LIST)
      }
    }

    // =========================  Open =========================
    /**
     * Click for item. SubMenu do not have selection status
     */
    const onInternalClick = (info: MenuInfo) => {
      props.onClick?.(warnItemProp(info))
      triggerSelection(info)
    }

    const onInternalOpenChange = (key: string, open: boolean) => {
      let newOpenKeys = mergedOpenKeys.value.filter(k => k !== key)

      if (open) {
        newOpenKeys.push(key)
      }
      else if (internalMode.value !== 'inline') {
        // We need find all related popup to close
        const subPathKeys = getSubPathKeys(key)
        newOpenKeys = newOpenKeys.filter(k => !subPathKeys.has(k))
      }

      if (!isEqual(mergedOpenKeys.value, newOpenKeys, true)) {
        triggerOpenKeys(newOpenKeys, true)
      }
    }

    // ==================== Accessibility =====================
    const triggerAccessibilityOpen = (key: string, open?: boolean) => {
      const nextOpen = open ?? !mergedOpenKeys.value.includes(key)
      onInternalOpenChange(key, nextOpen)
    }
    const setMergedActiveKey = (key: string) => {
      mergedActiveKey.value = key
    }
    // TODO: Add keyboard accessibility support
    // const onInternalKeyDown = useAccessibility(...)
    const onInternalKeyDown = useAccessibility(
      internalMode as any,
      mergedActiveKey as any,
      isRtl as any,
      uuid,

      containerRef as any,
      getKeys,
      getKeyPath,

      setMergedActiveKey,
      triggerAccessibilityOpen,

      (...args) => {
        (_attrs as any)?.onKeydown?.(...args)
      },
    )

    // ======================== Effect ========================
    watch(
      () => [props.activeKey, () => props.defaultActiveFirst, childList.value],
      () => {
        if (props.activeKey !== undefined) {
          mergedActiveKey.value = props.activeKey
        }
        else if (props.defaultActiveFirst && childList.value[0]) {
          mergedActiveKey.value = (childList.value[0] as any)?.key
        }
      },
      { immediate: true },
    )

    const allVisible = computed(
      () =>
        lastVisibleIndex.value >= childList.value.length - 1
        || internalMode.value !== 'horizontal'
        || props?.disabledOverflow,
    )

    watch(allVisible, () => {
      refreshOverflowKeys(
        allVisible.value
          ? EMPTY_LIST
          : childList.value.slice(lastVisibleIndex.value + 1).map(child => (child as any).key as string),
      )
    })

    // ======================= Context ========================
    const privateContext = computed(() => ({
      _internalRenderMenuItem: props._internalRenderMenuItem,
      _internalRenderSubMenuItem: props._internalRenderSubMenuItem,
    }))

    const menuContext = computed(() => {
      return {
        prefixCls: props.prefixCls || defaults.prefixCls,
        rootClass: props.rootClass,
        classes: props.classes,
        styles: props.styles,
        mode: internalMode.value as MenuMode,
        openKeys: mergedOpenKeys.value,
        rtl: isRtl.value,
        // Disabled
        disabled: props.disabled,
        // Motion
        motion: props.motion,
        defaultMotions: props.defaultMotions,
        // Active
        activeKey: mergedActiveKey.value!,
        onActive,
        onInactive,
        // Selection
        selectedKeys: mergedSelectKeys.value,
        // Level
        inlineIndent: props.inlineIndent || defaults.inlineIndent,
        // Popup
        subMenuOpenDelay: props.subMenuOpenDelay || defaults.subMenuOpenDelay,
        subMenuCloseDelay: props.subMenuCloseDelay || defaults.subMenuCloseDelay,
        forceSubMenuRender: props.forceSubMenuRender,
        builtinPlacements: props.builtinPlacements,
        triggerSubMenuAction: props.triggerSubMenuAction || defaults.triggerSubMenuAction,
        getPopupContainer: props.getPopupContainer!,
        // Icon
        itemIcon: props.itemIcon,
        expandIcon: props.expandIcon,
        // Events
        onItemClick: onInternalClick,
        onOpenChange: onInternalOpenChange,
        popupRender: props.popupRender,
      }
    })

    useMenuContextProvider(menuContext)

    expose({
      list: containerRef,
      focus: (options: any) => {
        const keys = getKeys()
        const { elements, key2element, element2key } = refreshElements(keys, uuid)
        const focusableElements = getFocusableElements(containerRef.value!, elements)
        let shouldFocusKey: string
        if (mergedActiveKey.value && keys.includes(mergedActiveKey.value)) {
          shouldFocusKey = mergedActiveKey.value
        }
        else {
          shouldFocusKey = focusableElements[0]
            ? element2key.get(focusableElements[0])
            : childList.value.find(node => !node.props.disabled)?.key
        }
        const elementToFocus = key2element.get(shouldFocusKey)
        if (shouldFocusKey && elementToFocus) {
          elementToFocus?.focus?.(options)
        }
      },
      findItem: ({ key: itemKey }: any) => {
        const keys = getKeys()
        const { key2element } = refreshElements(keys, uuid)
        return key2element.get(itemKey) || null
      },
    })

    return () => {
      // 在 render 函数中获取 slots
      const children = filterEmpty(slots.default?.())

      // 解析 items 或 children 为节点列表
      const parsedChildList = parseItems(
        children,
        props?.items,
        EMPTY_LIST,
        props?._internalComponents || {},
        props?.prefixCls || defaults.prefixCls,
        {
          labelRender: props?.labelRender,
          extraRender: props?.extraRender,
        },
      )

      // 只有在列表真正改变时才更新，避免不必要的响应式触发
      const shouldUpdate = childList.value.length !== parsedChildList.length
        || !isEqual(
          childList.value.map(n => (n as any)?.key),
          parsedChildList.map(n => (n as any)?.key),
        )

      if (shouldUpdate) {
        childList.value = parsedChildList
      }

      // Measure child list for path registration
      const measureChildList = parseItems(
        children,
        props?.items,
        EMPTY_LIST,
        {},
        props?.prefixCls || defaults.prefixCls,
      )

      // >>>>> Children
      const wrappedChildList
        = internalMode.value !== 'horizontal' || props?.disabledOverflow
          ? childList.value // Need wrap for overflow dropdown that do not response for open
          : childList.value.map((child, index) => (
            // Always wrap provider to avoid sub node re-mount
              <InheritableContextProvider
                key={(child as any).key}
                overflowDisabled={index > lastVisibleIndex.value}
                classes={props.classes}
                styles={props.styles}
              >
                {child}
              </InheritableContextProvider>
            ))
      // >>>>> Container
      const container = (
        <Overflow
          ref={containerRef}
          prefixCls={`${props.prefixCls || defaults.prefixCls}-overflow`}
          component="ul"
          itemComponent={MenuItem}
          class={classNames(
            props.prefixCls || defaults.prefixCls,
            `${props.prefixCls || defaults.prefixCls}-root`,
            `${props.prefixCls || defaults.prefixCls}-${internalMode.value}`,
            (_attrs.class as any) || '',
            {
              [`${props.prefixCls || defaults.prefixCls}-inline-collapsed`]: internalInlineCollapsed.value,
              [`${props.prefixCls || defaults.prefixCls}-rtl`]: isRtl.value,
            },
            props.rootClass,
          )}
          style={_attrs.style as CSSProperties}
          data={wrappedChildList}
          renderRawItem={(node: any) => {
            return node
          }}
          renderRawRest={(omitItems: any[]) => {
            // We use origin list since wrapped list use context to prevent open
            const len = omitItems.length
            const originOmitItems = len ? childList.value.slice(-len) : null
            return (
              <SubMenu
                eventKey={OVERFLOW_KEY}
                title={mergedOverflowIndicator.value}
                disabled={allVisible.value}
                internalPopupClose={len === 0}
                popupClassName={props.overflowedIndicatorPopupClassName}
              >
                {originOmitItems}
              </SubMenu>
            )
          }}
          maxCount={
            internalMode.value !== 'horizontal' || props?.disabledOverflow
              ? (Overflow as any).INVALIDATE
              : (Overflow as any).RESPONSIVE
          }
          ssr="full"
          data-menu-list
          onVisibleChange={(newLastIndex: number) => {
            lastVisibleIndex.value = newLastIndex
          }}
          {
            ...{
              onKeydown: onInternalKeyDown,
            }
          }
        />
      )

      // >>>>> Render
      return (
        <PrivateContextProvider{...privateContext.value}>
          <PathUserProvider {...pathUserContext.value}>
            {container}
          </PathUserProvider>

          {/* Measure menu keys. Add `display: none` to avoid some developer miss use the Menu */}
          <div style={{ display: 'none' }} aria-hidden>
            <MeasureProvider
              {...registerPathContext.value}
            >
              {measureChildList}
            </MeasureProvider>
          </div>
        </PrivateContextProvider>
      )
    }
  },
  {
    name: 'VcMenu',
    inheritAttrs: false,
  },
)

export default Menu
