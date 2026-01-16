import type { Ref } from 'vue'
import type { EscCallback } from './Portal.tsx'
import { useId, watch } from 'vue'

let stack: { id: string, onEsc?: EscCallback }[] = []

const IME_LOCK_DURATION = 200
let lastCompositionEndTime = 0

// Export for testing
export const _test = process.env.NODE_ENV === 'test'
  ? () => ({
      stack,
      reset: () => {
        // Not reset stack to ensure effect will clean up correctly
        lastCompositionEndTime = 0
      },
    })
  : null

// Global event handlers
function onGlobalKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !event.isComposing) {
    const now = Date.now()
    if (now - lastCompositionEndTime < IME_LOCK_DURATION) {
      return
    }

    const len = stack.length
    for (let i = len - 1; i >= 0; i -= 1) {
      stack?.[i]?.onEsc?.({
        top: i === len - 1,
        event,
      })
    }
  }
}

function onGlobalCompositionEnd() {
  lastCompositionEndTime = Date.now()
}

function attachGlobalEventListeners() {
  window.addEventListener('keydown', onGlobalKeyDown)
  window.addEventListener('compositionend', onGlobalCompositionEnd)
}

function detachGlobalEventListeners() {
  if (stack.length === 0) {
    window.removeEventListener('keydown', onGlobalKeyDown)
    window.removeEventListener('compositionend', onGlobalCompositionEnd)
  }
}

export default function useEscKeyDown(open: Ref<boolean>, onEsc: EscCallback = () => {}) {
  const id = useId()
  const onEventEsc = onEsc
  const ensure = () => {
    if (!stack.find(item => item.id === id)) {
      stack.push({ id, onEsc: onEventEsc })
    }
  }

  const clear = () => {
    stack = stack.filter(item => item.id !== id)
  }

  watch(
    open,
    (_, _o, onCleanup) => {
      if (open.value) {
        ensure()
        // Attach global event listeners
        attachGlobalEventListeners()
        onCleanup(() => {
          clear()
          detachGlobalEventListeners()
        })
      }
      else if (!open.value) {
        clear()
      }
    },
    {
      immediate: true,
    },
  )
}
