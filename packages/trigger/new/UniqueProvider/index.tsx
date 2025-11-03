import type { UniqueShowOptions } from '../context'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { computed, defineComponent, ref, shallowRef } from 'vue'
import useAlign from '../hooks/useAlign.ts'
import useDelay from '../hooks/useDelay.ts'
import useTargetState from './useTargetState.ts'

export interface UniqueProviderProps {
  // children: VueNode
  /** Additional handle options data to do the customize info */
  postTriggerProps?: (options: UniqueShowOptions) => UniqueShowOptions
}

const UniqueProvider = defineComponent(
  (props) => {
    const [trigger, open, options, onTargetVisibleChanged] = useTargetState()
    // ========================== Options ===========================
    const mergedOptions = computed(() => {
      if (!options.value || !props.postTriggerProps) {
        return options.value
      }
      return props.postTriggerProps(options.value)
    })

    // =========================== Popup ============================
    const popupEle = shallowRef<HTMLDivElement>()
    const popupSize = ref<{
      width: number
      height: number
    } | null>(null)
    // Used for forwardRef popup. Not use internal
    const externalPopupRef = shallowRef<HTMLDivElement>()
    const setPopupRef = (node: HTMLDivElement) => {
      externalPopupRef.value = node

      if (isDOM(node) && popupEle.value !== node) {
        popupEle.value = node
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
      computed(() => mergedOptions.value?.target),
      computed(() => mergedOptions.value?.popupPlacement),
      computed(() => mergedOptions.value?.builtinPlacements || {}),
      computed(() => mergedOptions.value?.popupAlign),
      undefined, // onPopupAlign
      ref(false), // isMobile
    )

    const alignedClassName = computed(() => {
      if (!mergedOptions.value) {
        return ''
      }
      return {}
    })
    return () => {
      return null
    }
  },
)
