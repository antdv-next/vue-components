import type { TriggerContextProps, UniqueShowOptions } from '../context'
import Portal from '@v-c/portal'
import { classNames } from '@v-c/util'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode'
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
    const popupEle = shallowRef<HTMLDivElement>()
    const popupSize = ref<{
      width: number
      height: number
    } | null>(null)
    // Used for forwardRef popup. Not use internal
    const externalPopupRef = shallowRef<HTMLDivElement>()
    const setPopupRef = (node: any) => {
      externalPopupRef.value = node

      if (isDOM(node) && popupEle.value !== node) {
        popupEle.value = node as HTMLDivElement
      }
    }

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

    // Callback after animation completes
    const onVisibleChanged = (visible: boolean) => {
      // Call useTargetState callback to handle animation state
      onTargetVisibleChanged(visible)
    }

    // =========================== Align ============================
    const [
      ready,
      offsetX,
      offsetY,
      offsetR,
      offsetB,
      arrowX,
      arrowY, // scaleX - not used in UniqueProvider
      ,
      ,
      // scaleY - not used in UniqueProvider
      alignInfo,
      onAlign,
    ] = useAlign(
      open,
      popupEle as any,
      computed(() => mergedOptions.value!.target!),
      computed(() => mergedOptions.value!.popupPlacement!),
      computed(() => mergedOptions.value!.builtinPlacements || {}),
      computed(() => mergedOptions.value!.popupAlign),
      undefined, // onPopupAlign
      ref(false), // isMobile
    )

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
    watch(
      () => mergedOptions.value?.target,
      () => {
        onAlign()
      },
      {
        immediate: true,
      },
    )

    // =========================== Motion ===========================
    const onPrepare = () => {
      onAlign()
      return Promise.resolve()
    }

    // ======================== Trigger Context =====================
    const subPopupElements = ref<Record<string, HTMLElement>>({})
    const parentContext = useTriggerContext()
    const triggerContextValue = computed<TriggerContextProps>(() => {
      return {
        registerSubPopup: (id, subPopupEle) => {
          subPopupElements.value[id] = subPopupEle
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
                onAlign={onAlign}
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
