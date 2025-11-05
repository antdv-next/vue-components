import type { CSSProperties } from 'vue'
import { classNames } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import isEqual from '@v-c/util/dist/isEqual'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, ref, toRef, watch } from 'vue'
import useKeyRecords from './hooks/useKeyRecords'
import useAccessibility, { getFocusableElements, refreshElements } from './hooks/useAccessibility'
import { provideIdContext } from './context/IdContext'
import { provideMenuContext } from './context/MenuContext'
import {
  providePathRegisterContext,
  providePathTrackerContext,
  providePathUserContext,
} from './context/PathContext'
import { providePrivateContext } from './context/PrivateContext'
import { parseItems } from './utils/nodeUtil'
import type {
  ItemType,
  MenuClickEventHandler,
  MenuInfo,
  MenuProps,
  MenuRef,
  RenderIconType,
  SelectInfo,
} from './interface'
import { warnItemProp } from './utils/warnUtil'

const EMPTY_LIST: string[] = []

let uuidSeed = 0

const Menu = defineComponent<MenuProps>({
  name: 'VcMenu',
  inheritAttrs: false,
  setup(props, { slots, attrs, expose }) {
    const prefixCls = computed(() => props.prefixCls ?? 'vc-menu')
    const mergedMode = computed(() => props.mode ?? 'vertical')

    if (process.env.NODE_ENV !== 'production') {
      warning(
        !(props as any).openTransitionName && !(props as any).openAnimation,
        '`openTransitionName` and `openAnimation` are removed. Please use `motion` or `defaultMotion` instead.',
      )
    }

    const [mergedOpenKeys, setMergedOpenKeys] = useMergedState<string[]>(props.defaultOpenKeys ?? [], {
      value: toRef(props, 'openKeys') as any,
      postState: keys => (Array.isArray(keys) ? keys : []),
      onChange: (val) => props.onOpenChange?.(val),
    })

    const [selectedKeys, setSelectedKeys] = useMergedState<string[]>(props.defaultSelectedKeys ?? [], {
      value: toRef(props, 'selectedKeys') as any,
      postState: keys => (Array.isArray(keys) ? keys : keys == null ? [] : [keys]),
    })

    const [activeKey, setActiveKey] = useMergedState<string | undefined>(undefined, {
      value: toRef(props, 'activeKey') as any,
    })

    const mergedSelectable = computed(() => props.selectable !== false)
    const mergedMultiple = computed(() => !!props.multiple)

    const items = computed<ItemType[] | undefined>(() => props.items)

    const childList = computed(() =>
      parseItems(
        slots.default?.(),
        items.value,
        EMPTY_LIST,
        props._internalComponents ?? {},
        prefixCls.value,
      ),
    )

    watch(
      childList,
      (list) => {
        if (props.defaultActiveFirst && !activeKey.value) {
          const first = list.find(node => node && node.key != null)
          if (first?.key !== undefined) {
            setActiveKey(String(first.key))
          }
        }
      },
      { immediate: true },
    )

    const containerRef = ref<HTMLUListElement | null>(null)

    const uuid = props.id ?? `vc-menu-${++uuidSeed}`
    provideIdContext(uuid)

    const {
      registerPath,
      unregisterPath,
      isSubPathKey,
      getKeyPath,
      getKeys,
      getSubPathKeys,
    } = useKeyRecords()

    providePathRegisterContext({ registerPath, unregisterPath })
    providePathUserContext({ isSubPathKey })

    providePrivateContext({
      _internalRenderMenuItem: props._internalRenderMenuItem,
      _internalRenderSubMenuItem: props._internalRenderSubMenuItem,
    })

    const triggerSelection = (info: MenuInfo) => {
      if (!mergedSelectable.value) {
        return
      }

      const targetKey = info.key
      const exist = selectedKeys.value.includes(targetKey)
      let newKeys: string[]

      if (mergedMultiple.value) {
        newKeys = exist
          ? selectedKeys.value.filter(key => key !== targetKey)
          : [...selectedKeys.value, targetKey]
      }
      else {
        newKeys = [targetKey]
      }

      setSelectedKeys(newKeys)

      const selectInfo: SelectInfo = {
        ...info,
        selectedKeys: newKeys,
      }

      if (exist) {
        props.onDeselect?.(selectInfo)
      }
      else {
        props.onSelect?.(selectInfo)
      }

      if (!mergedMultiple.value && mergedOpenKeys.value.length && mergedMode.value !== 'inline') {
        setMergedOpenKeys([])
      }
    }

    const onItemClick: MenuClickEventHandler = info => {
      props.onClick?.(warnItemProp(info))
      triggerSelection(info)
    }

    const onOpenChange = (key: string, open: boolean) => {
      let nextOpenKeys = mergedOpenKeys.value.filter(k => k !== key)
      if (open) {
        nextOpenKeys = [...nextOpenKeys, key]
      }
      else if (mergedMode.value !== 'inline') {
        const subPathKeys = getSubPathKeys(key)
        nextOpenKeys = nextOpenKeys.filter(k => !subPathKeys.has(k))
      }

      if (!isEqual(mergedOpenKeys.value, nextOpenKeys, true)) {
        setMergedOpenKeys(nextOpenKeys)
      }
    }

    const triggerAccessibilityOpen = (key: string, open?: boolean) => {
      const next = open ?? !mergedOpenKeys.value.includes(key)
      onOpenChange(key, next)
    }

    const onKeyDownHandler = useAccessibility(
      mergedMode.value,
      activeKey,
      props.direction === 'rtl',
      uuid,
      containerRef,
      getKeys,
      getKeyPath,
      key => setActiveKey(key),
      triggerAccessibilityOpen,
      props.onKeyDown,
    )

    const getPopupContainer = props.getPopupContainer ?? (() => containerRef.value || document.body)

    const menuContext = computed(() => ({
      prefixCls: prefixCls.value,
      classNames: props.classNames,
      styles: props.styles,
      rootClassName: props.rootClassName,
      openKeys: mergedOpenKeys.value,
      rtl: props.direction === 'rtl',
      mode: mergedMode.value,
      disabled: props.disabled,
      overflowDisabled: props.disabledOverflow,
      activeKey: activeKey.value ?? '',
      onActive: (key: string) => setActiveKey(key),
      onInactive: () => setActiveKey(undefined),
      selectedKeys: selectedKeys.value,
      inlineIndent: props.inlineIndent ?? 24,
      motion: props.motion,
      defaultMotions: props.defaultMotions,
      subMenuOpenDelay: props.subMenuOpenDelay ?? 0.1,
      subMenuCloseDelay: props.subMenuCloseDelay ?? 0.1,
      forceSubMenuRender: props.forceSubMenuRender,
      builtinPlacements: props.builtinPlacements,
      triggerSubMenuAction: props.triggerSubMenuAction ?? 'hover',
      popupRender: props.popupRender,
      itemIcon: props.itemIcon as RenderIconType,
      expandIcon: props.expandIcon,
      onItemClick,
      onOpenChange,
      getPopupContainer,
    }))

    const contextRef = provideMenuContext(menuContext.value as any)
    watch(
      menuContext,
      (val) => {
        contextRef.value = { ...val }
      },
      { deep: true },
    )

    const focus = (options?: FocusOptions) => {
      const keys = getKeys()
      const { elements, key2element, element2key } = refreshElements(keys, uuid)
      const focusableElements = getFocusableElements(containerRef.value, elements)
      const targetKey = activeKey.value && keys.includes(activeKey.value)
        ? activeKey.value
        : (focusableElements.length
          ? element2key.get(focusableElements[0])
          : childList.value.find(node => !(node as any)?.props?.disabled)?.key as string | undefined)

      const element = targetKey ? key2element.get(targetKey) : null
      element?.focus?.(options)
    }

    expose<MenuRef>({
      list: containerRef.value,
      focus,
      findItem: ({ key }) => {
        const keys = getKeys()
        const { key2element } = refreshElements(keys, uuid)
        return key2element.get(key) || null
      },
    })

    providePathTrackerContext(computed(() => EMPTY_LIST))

    const menuClassName = computed(() =>
      classNames(
        prefixCls.value,
        `${prefixCls.value}-root`,
        `${prefixCls.value}-${mergedMode.value}`,
        props.className,
        (attrs as any)?.class,
        {
          [`${prefixCls.value}-rtl`]: props.direction === 'rtl',
        },
        props.rootClassName,
      ),
    )

    return () => (
      <ul
        ref={containerRef}
        id={props.id}
        class={menuClassName.value}
        style={{
          ...(props.style as CSSProperties),
          ...((attrs as any)?.style as CSSProperties),
        }}
        role="menu"
        tabindex={props.tabIndex ?? 0}
        onKeydown={onKeyDownHandler}
      >
        {childList.value}
      </ul>
    )
  },
})

export default Menu
