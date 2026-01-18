import type { Ref } from 'vue'
import { computed, onMounted, shallowRef, watch } from 'vue'

function internalMacroTask(fn: VoidFunction) {
  const channel = new MessageChannel()
  channel.port1.onmessage = fn
  channel.port2.postMessage(null)
}

function macroTask(fn: VoidFunction, times = 1) {
  if (times <= 0) {
    fn()
    return
  }

  internalMacroTask(() => {
    macroTask(fn, times - 1)
  })
}

/**
 * Trigger by latest open call, if nextOpen is undefined, means toggle.
 * ignoreNext will skip next call in the macro task queue.
 */
export type TriggerOpenType = (
  nextOpen?: boolean,
  config?: {
    ignoreNext?: boolean
    lazy?: boolean
  },
) => void

/**
 * When `open` is controlled, follow the controlled value;
 * Otherwise use uncontrolled logic.
 * Setting `open` takes effect immediately,
 * but setting it to `false` is delayed via MessageChannel.
 *
 * SSR handling: During SSR, `open` is always false to avoid Portal issues.
 * On client-side hydration, it syncs with the actual open state.
 */
export default function useOpen(
  propOpen: Ref<boolean>,
  onOpen: (nextOpen: boolean) => void,
  postOpen: (nextOpen: boolean) => boolean,
) {
  // SSR not support Portal which means we need delay `open` for the first time render
  const rendered = shallowRef(propOpen.value ?? false)
  onMounted(() => {
    rendered.value = true
  })

  const stateOpen = shallowRef(propOpen.value ?? false)
  watch(propOpen, () => {
    stateOpen.value = propOpen.value
  })

  // During SSR, always return false for open state
  const ssrSafeOpen = computed(() => rendered.value ? stateOpen.value : false)
  const mergedOpen = computed(() => postOpen(ssrSafeOpen.value))

  const taskIdRef = shallowRef(0)
  const taskLockRef = shallowRef(false)

  const triggerEvent = (nextOpen: boolean) => {
    if (onOpen && mergedOpen.value !== nextOpen) {
      onOpen(nextOpen)
    }
    if (propOpen.value !== undefined) {
      return
    }
    stateOpen.value = nextOpen
  }

  const toggleOpen: TriggerOpenType = (nextOpen, config = {}) => {
    const { ignoreNext = false, lazy = false } = config
    taskIdRef.value += 1
    const id = taskIdRef.value

    const nextOpenVal = typeof nextOpen === 'boolean' ? nextOpen : !mergedOpen.value
    // Since `mergedOpen` is post-processed, we need to check if the value really changed
    if (nextOpenVal !== lazy) {
      if (!taskLockRef.value) {
        triggerEvent(nextOpenVal)

        // Lock if needed
        if (ignoreNext) {
          taskLockRef.value = ignoreNext

          macroTask(() => {
            taskLockRef.value = false
          }, 2)
        }
      }
      return
    }
    macroTask(() => {
      if (id === taskIdRef.value && !taskLockRef.value) {
        triggerEvent(nextOpenVal)
      }
    })
  }

  return [mergedOpen, toggleOpen] as const
}
