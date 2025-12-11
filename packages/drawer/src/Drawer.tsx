import type { PortalProps } from '@v-c/portal'
import type { DrawerPanelEvents } from './DrawerPanel'
import type { DrawerPopupProps } from './DrawerPopup'
import type { DrawerClassNames, DrawerStyles } from './inter'
import Portal from '@v-c/portal'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useRefProvide } from './context'
import DrawerPopup from './DrawerPopup'
import { warnCheck } from './util'

export type Placement = 'left' | 'top' | 'right' | 'bottom'

export interface DrawerProps extends Omit<DrawerPopupProps, 'prefixCls' | 'inline'>, DrawerPanelEvents {
  prefixCls?: string
  open?: boolean
  onClose?: (e: MouseEvent | KeyboardEvent) => void
  destroyOnHidden?: boolean
  getContainer?: PortalProps['getContainer']
  panelRef?: any
  wrapperClassName?: string
  classNames?: DrawerClassNames
  styles?: DrawerStyles
}

const defaults = {
  prefixCls: 'vc-drawer',
  placement: 'right',
  autoFocus: true,
  keyboard: true,
  mask: true,
  maskClosable: true,
  destroyOnHidden: false,
} as DrawerProps

const Drawer = defineComponent<DrawerProps>({
  name: 'Drawer',
  props: {
    open: {
      type: Boolean,
      default: undefined,
    },
  },
  setup(rawProps, { slots, expose, attrs }) {
    const mergedOpen = shallowRef<boolean>(!!rawProps.open)

    const mergedProps = computed(() => {
      return {
        ...defaults,
        ...(attrs as Record<string, any>),
        ...(rawProps as Record<string, any>),
        open: mergedOpen.value,
      } as DrawerProps
    })

    if (process.env.NODE_ENV !== 'production') {
      warnCheck(mergedProps.value)
    }

    const animatedVisible = shallowRef(!!(mergedProps.value.forceRender || mergedOpen.value))
    const prefixCls = computed(() => mergedProps.value.prefixCls ?? 'vc-drawer')
    const lastActiveRef = shallowRef<HTMLElement | null>(null)
    const popupRef = shallowRef<any>()

    const externalPanelRef = shallowRef<any>()
    watch(
      () => mergedProps.value.panelRef,
      () => {
        externalPanelRef.value = mergedProps.value.panelRef
      },
      { immediate: true },
    )

    const { panel } = useRefProvide((el) => {
      const refTarget = externalPanelRef.value
      if (typeof refTarget === 'function') {
        refTarget(el)
      }
      else if (refTarget && typeof refTarget === 'object' && 'value' in refTarget) {
        refTarget.value = el
      }
    })

    watch(
      mergedOpen,
      (visible) => {
        if (visible) {
          animatedVisible.value = true
          lastActiveRef.value = document.activeElement as HTMLElement
        }
        else if (mergedProps.value.destroyOnHidden) {
          animatedVisible.value = false
        }
      },
      { immediate: true },
    )

    const internalAfterOpenChange = (nextVisible: boolean) => {
      if (nextVisible) {
        animatedVisible.value = true
      }
      else if (mergedProps.value.destroyOnHidden) {
        animatedVisible.value = false
      }

      mergedProps.value.afterOpenChange?.(nextVisible)

      if (!nextVisible && lastActiveRef.value) {
        const panelEl = popupRef.value?.panelRef?.value as HTMLDivElement | undefined
        if (panelEl && !panelEl.contains(lastActiveRef.value)) {
          try {
            lastActiveRef.value?.focus?.({ preventScroll: true } as any)
          }
          catch (e) {
            // Do nothing
          }
        }
      }
    }

    expose({
      panel,
      popupRef,
    })

    return () => {
      mergedOpen.value = !!rawProps.open
      const mp = mergedProps.value
      const shouldRenderPopup = mp.forceRender || animatedVisible.value || mergedOpen.value
      if (!shouldRenderPopup) {
        return null
      }

      const eventHandlers = {
        onMouseEnter: mp.onMouseEnter,
        onMouseOver: mp.onMouseOver,
        onMouseLeave: mp.onMouseLeave,
        onClick: mp.onClick,
        onKeyDown: mp.onKeyDown,
        onKeyUp: mp.onKeyUp,
      }

      const popupNode = (
        <DrawerPopup
          {...mp}
          {...eventHandlers}
          ref={popupRef}
          mask={mp.mask !== false}
          maskClosable={mp.maskClosable !== false}
          placement={(mp.placement ?? 'right') as any}
          autoFocus={mp.autoFocus !== false}
          keyboard={mp.keyboard !== false}
          prefixCls={prefixCls.value}
          inline={mp.getContainer === false}
          open={mergedOpen.value}
          afterOpenChange={internalAfterOpenChange}
          v-slots={slots}
        />
      )

      if (mp.getContainer === false) {
        return popupNode
      }

      return (
        <Portal
          open={mergedOpen.value || mp.forceRender || animatedVisible.value}
          autoDestroy={false}
          getContainer={mp.getContainer}
          autoLock={mp.mask !== false && (mergedOpen.value || animatedVisible.value)}
        >
          {popupNode}
        </Portal>
      )
    }
  },
})

export default Drawer
