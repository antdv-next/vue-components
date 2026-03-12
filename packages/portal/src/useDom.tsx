import type { ComputedRef } from 'vue'
import type { QueueCreate } from './Context.tsx'
import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import { computed, nextTick, onUnmounted, shallowRef, watch } from 'vue'
import { useContextState } from './Context.tsx'

const EMPTY_LIST: VoidFunction[] = []

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 * @param debug
 */
export default function useDom(
  render: ComputedRef<boolean>,
  debug?: string,
): [HTMLDivElement | null, ComputedRef<QueueCreate>] {
  const eleFun = () => {
    if (!canUseDom())
      return null

    const defaultEle = document.createElement('div')

    if (process.env.NODE_ENV !== 'production' && debug)
      defaultEle.setAttribute('data-debug', debug)
    return defaultEle
  }
  const ele = eleFun()

  // ========================== Order ==========================
  const appendedRef = shallowRef(false)
  const queueCreate = useContextState()
  const queue = shallowRef<VoidFunction[]>([])

  const mergedQueueCreate = computed(() => queueCreate?.value || (appendedRef.value
    ? undefined
    : (appendFn: VoidFunction) => {
        queue.value = [appendFn, ...queue.value]
      }))

  // =========================== DOM ===========================
  function append() {
    if (!ele || !canUseDom())
      return

    if (!ele?.parentElement)
      document.body.appendChild(ele)
    appendedRef.value = true
  }

  function cleanup() {
    if (!ele || !canUseDom()) {
      appendedRef.value = false
      return
    }

    if (ele?.parentElement) {
      ele?.parentElement?.removeChild(ele)
    }
    else {
      if (appendedRef.value) {
        document.body?.removeChild?.(ele)
      }
    }

    appendedRef.value = false
  }

  watch(render, () => {
    if (render.value) {
      if (queueCreate?.value)
        queueCreate.value(append)
      else
        append()
    }
    else {
      nextTick(() => {
        cleanup()
      })
    }
  }, {
    immediate: true,
  })

  onUnmounted(cleanup)

  watch(queue, () => {
    if (queue.value.length) {
      queue.value.forEach(fn => fn())
      queue.value = [...EMPTY_LIST]
    }
  }, {
    flush: 'post',
    immediate: true,
  })
  return [ele, mergedQueueCreate as ComputedRef<QueueCreate>]
}
