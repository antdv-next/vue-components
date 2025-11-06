import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'
import type {
  BuiltinPlacements,
  Components,
  ItemType,
  MenuClickEventHandler,
  MenuMode,
  PopupRender,
  RenderIconType,
  SelectEventHandler,
  TriggerSubMenuAction,
} from './interface.ts'
import type { SemanticName } from './SubMenu'
import useId from '@v-c/util/dist/hooks/useId.ts'
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { getFocusableElements, refreshElements } from './hooks/useAccessibility.ts'
import useKeyRecords from './hooks/useKeyRecords.ts'

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
  rootClassName?: string
  classNames?: Partial<Record<SemanticName, string>>
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
}

interface LegacyMenuProps extends MenuProps {
  openTransitionName?: string
  openAnimation?: string
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
  (props = defaults, { slots, expose, attrs }) => {
    const mounted = shallowRef(false)
    const containerRef = shallowRef<HTMLUListElement>()
    const uuid = useId(props?.id ? `rc-menu-uuid-${props.id}` : 'rc-menu-uuid')
    const isRtl = computed(() => props?.direction === 'rtl')
    const childList = shallowRef<any[]>([])
    // ========================= Open =========================
    const innerOpenKeys = ref(props?.openKeys ?? props?.defaultOpenKeys)
    watch(
      () => props.openKeys,
      () => {
        innerOpenKeys.value = props?.openKeys
      },
    )
    const _mergedOpenKeys = ref<string[]>()

    const mergedOpenKeys = computed({
      get() {
        return innerOpenKeys.value ?? EMPTY_LIST
      },
      set(value) {
        _mergedOpenKeys.value = value
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
    const registerPathContext = computed(() => {
      return {
        registerPath,
        unregisterPath,
      }
    })

    const pathUserContext = computed(() => {
      return {
        isSubPathKey,
      }
    })

    // ======================== Active ========================
    const mergedActiveKey = shallowRef(props?.activeKey)
    const onActive = (key: string) => {
      mergedActiveKey.value = key
    }
    const onInactive = () => {
      mergedActiveKey.value = undefined
    }

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
      // const allVisible = lastVisibleIndex >= childList.length - 1 || internalMode !== 'horizontal' || disabledOverflow;
      return null
    }
  },
  {
    name: 'VcMenu',
  },
)

export default Menu
