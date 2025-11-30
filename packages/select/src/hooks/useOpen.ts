import type { ComputedRef } from 'vue'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import { computed, onMounted, ref } from 'vue'

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

export type TriggerOpenType = (
  nextOpen?: boolean,
  config?: {
    ignoreNext?: boolean
    lazy?: boolean
  },
) => void

interface TriggerConfig {
  ignoreNext?: boolean
  lazy?: boolean
}

export default function useOpen(
  propOpen: () => boolean | undefined,
  onOpen: (nextOpen: boolean) => void,
  postOpen: (nextOpen: boolean) => boolean,
): [ComputedRef<boolean>, TriggerOpenType] {
  const rendered = ref(false)
  onMounted(() => {
    rendered.value = true
  })

  const [stateOpen, setStateOpen] = useMergedState(false, {
    value: computed(() => propOpen?.()) as any,
  })

  const mergedOpen = computed<boolean>(() => {
    const ssrSafe = rendered.value ? stateOpen.value : false
    return postOpen(ssrSafe)
  })

  const taskIdRef = ref(0)
  const taskLockRef = ref(false)

  const triggerEvent = useEvent((nextOpen: boolean) => {
    if (onOpen && mergedOpen.value !== nextOpen) {
      onOpen(nextOpen)
    }
    setStateOpen(nextOpen)
  })

  const toggleOpen = useEvent<TriggerOpenType>((nextOpen, config: TriggerConfig = {}) => {
    const { ignoreNext = false, lazy = false } = config
    taskIdRef.value += 1
    const id = taskIdRef.value

    const nextOpenVal = typeof nextOpen === 'boolean' ? nextOpen : !mergedOpen.value

    if (nextOpenVal || !lazy) {
      if (!taskLockRef.value) {
        triggerEvent(nextOpenVal)
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
  })

  return [mergedOpen, toggleOpen]
}
