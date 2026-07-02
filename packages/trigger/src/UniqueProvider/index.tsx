import type { TriggerContextProps, UniqueShowOptions } from '../context'
import Portal from '@v-c/portal'
import { classNames } from '@v-c/util'
import { createElementRef } from '@v-c/util/dist/vnode'
import { computed, defineComponent, ref, shallowRef, watch } from 'vue'
import { TriggerContextProvider, UniqueContextProvider, useTriggerContext } from '../context'
import useAlign from '../hooks/useAlign.ts'
import useDelay from '../hooks/useDelay.ts'
import Popup from '../Popup'
import { getAlignPopupClassName } from '../util.ts'
import UniqueContainer from './UniqueContainer.tsx'
import useTargetState from './useTargetState.ts'

export interface UniqueProviderProps {
  // children: VueNode
  /** Additional handle options data to do the customize info */
  postTriggerProps?: (options: UniqueShowOptions) => UniqueShowOptions
}

const UniqueProvider = defineComponent<UniqueProviderProps>(
  (props, { slots }) => {
    const [trigger, open, options, onTargetVisibleChanged] = useTargetState()
    // ========================== Options ===========================
    const mergedOptions = computed<UniqueShowOptions>(() => {
      if (!options.value || !props.postTriggerProps) {
        return options.value as UniqueShowOptions
      }
      return props.postTriggerProps(options.value) as UniqueShowOptions
    })

    // =========================== Popup ============================
    const popupEle = shallowRef<HTMLDivElement | null>(null)
    const popupSize = ref<{
      width: number
      height: number
    } | null>(null)
    // Used for forwardRef popup. Not use internal
    const externalPopupRef = shallowRef<HTMLDivElement | null>(null)
    const setPopupRef = createElementRef<HTMLDivElement>((element) => {
      if (!element) {
        return
      }
      externalPopupRef.value = element

      if (popupEle.value !== element) {
        popupEle.value = element
      }
    })

    // ========================== Register ==========================
    // Store the isOpen function from the latest show call
    const isOpenRef = shallowRef<(() => boolean) | null>()
    const delayInvoke = useDelay()
    const show = (showOptions: UniqueShowOptions, isOpen: () => boolean) => {
      // Store the isOpen function for later use in hide
      isOpenRef.value = isOpen

      delayInvoke(() => {
        trigger(showOptions)
      }, showOptions.delay)
    }

    const hide = (delay: number) => {
      delayInvoke(() => {
        // Check if we should still hide by calling the isOpen function
        // If isOpen returns true, it means another trigger wants to keep it open
        if (isOpenRef.value?.()) {
          return // Don't hide if something else wants it open
        }

        trigger(false)
        // Don't clear target, currentNode, options immediately, wait until animation completes
      }, delay)
    }

    // =========================== Align ============================
    const [
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      arrowX,
      arrowY,,, // scaleX - not used in UniqueProvider
      // scaleY - not used in UniqueProvider
      alignInfo,
      onAlign,
    ] = useAlign(
      open,
      popupEle as any,
      computed(() => mergedOptions.value?.target),
      computed(() => mergedOptions.value?.popupPlacement) as any,
      computed(() => mergedOptions.value?.builtinPlacements || {}) as any,
      computed(() => mergedOptions.value?.popupAlign) as any,
      undefined, // onPopupAlign
      ref(false), // isMobile
    )

    // ========================== Motion ============================
    // Track animation state to prevent ResizeObserver from triggering align during animation
    const inMotion = shallowRef(false)

    // Watch open state to set inMotion when opening
    watch(open, () => {
      if (open.value) {
        inMotion.value = true
      }
    })

    // triggerAlign is used by ResizeObserver - respects inMotion state
    const triggerAlign = () => {
      if (!inMotion.value) {
        onAlign()
      }
    }

    // Callback after animation completes
    const onVisibleChanged = (visible: boolean) => {
      // Call useTargetState callback to handle animation state
      onTargetVisibleChanged(visible)
      // When animation completes, mark inMotion as false and trigger align
      inMotion.value = false
      onAlign()
    }

    const alignedClassName = computed(() => {
      if (!mergedOptions.value) {
        return ''
      }

      const baseClassName = getAlignPopupClassName(
        mergedOptions.value?.builtinPlacements || {},
        mergedOptions.value.prefixCls || '',
        alignInfo.value,
        false,
      )
      return classNames(
        baseClassName,
        mergedOptions.value?.getPopupClassNameFromAlign?.(alignInfo.value),
      )
    })

    const contextValue = {
      show,
      hide,
    }
    // =========================== Align ============================
    // When target changes, align immediately - don't check inMotion
    // This ensures popup moves to new position immediately when switching targets
    watch(
      () => mergedOptions.value?.target,
      () => {
        onAlign()
      },
    )

    // =========================== Motion ===========================
    const onPrepare = (element?: Element) => {
      // Same as Trigger's onPrepare: on the first open the appear hook fires
      // before `setPopupRef` can resolve Popup's exposed element, so seed
      // `popupEle` from the transition element to keep the prepare-time
      // align working (https://github.com/antdv-next/antdv-next/issues/623).
      if (element && !popupEle.value) {
        popupEle.value = element as HTMLDivElement
      }
      onAlign()
      return Promise.resolve()
    }

    // ======================== Trigger Context =====================
    const subPopupElements = ref<Record<string, HTMLElement | null>>({})
    const parentContext = useTriggerContext()
    const triggerContextValue = computed<TriggerContextProps>(() => {
      return {
        registerSubPopup: (id, subPopupEle) => {
          if (subPopupEle) {
            subPopupElements.value[id] = subPopupEle
          }
          else {
            delete subPopupElements.value[id]
          }
          parentContext?.value?.registerSubPopup(id, subPopupEle)
        },
      }
    })
    return () => {
      // =========================== Render ===========================
      const prefixCls = mergedOptions?.value?.prefixCls
      return (
        <UniqueContextProvider {...contextValue}>
          {slots?.default?.()}
          {!!mergedOptions.value && (
            <TriggerContextProvider {...triggerContextValue.value}>
              <Popup
                ref={setPopupRef}
                portal={Portal}
                prefixCls={prefixCls!}
                popup={mergedOptions.value?.popup}
                onEsc={mergedOptions.value?.onEsc}
                className={classNames(
                  mergedOptions.value?.popupClassName,
                  alignedClassName.value,
                  `${prefixCls}-unique-controlled`,
                )}
                style={mergedOptions.value?.popupStyle}
                target={mergedOptions.value?.target}
                open={open.value}
                keepDom={true}
                fresh={true}
                autoDestroy={false}
                onVisibleChanged={onVisibleChanged}
                ready={ready.value}
                offsetX={offsetX.value}
                offsetY={offsetY.value}
                offsetR={offsetR.value}
                offsetB={offsetB.value}
                onAlign={triggerAlign}
                onPrepare={onPrepare}
                onResize={(size) => {
                  popupSize.value = {
                    width: size.offsetWidth,
                    height: size.offsetHeight,
                  }
                }}
                arrowPos={{
                  x: arrowX.value,
                  y: arrowY.value,
                }}
                align={alignInfo.value}
                zIndex={mergedOptions.value?.zIndex}
                mask={mergedOptions.value?.mask}
                arrow={mergedOptions.value?.arrow}
                motion={mergedOptions.value?.popupMotion}
                maskMotion={mergedOptions.value?.maskMotion}
                getPopupContainer={mergedOptions.value.getPopupContainer}
              >
                <UniqueContainer
                  prefixCls={prefixCls!}
                  isMobile={false}
                  ready={ready.value}
                  open={open.value}
                  align={alignInfo.value}
                  offsetX={offsetX.value}
                  offsetY={offsetY.value}
                  offsetR={offsetR.value}
                  offsetB={offsetB.value}
                  arrowPos={{
                    x: arrowX.value,
                    y: arrowY.value,
                  }}
                  popupSize={popupSize.value!}
                  motion={mergedOptions.value?.popupMotion}
                  uniqueContainerClassName={classNames(
                    mergedOptions.value?.uniqueContainerClassName,
                    alignedClassName.value,
                  )}
                  uniqueContainerStyle={mergedOptions?.value?.uniqueContainerStyle}
                />
              </Popup>
            </TriggerContextProvider>
          )}
        </UniqueContextProvider>
      )
    }
  },
)

export default UniqueProvider
