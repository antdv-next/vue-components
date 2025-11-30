import type { MaybeRefOrGetter } from 'vue'
import { onBeforeUnmount, onMounted, toValue } from 'vue'

export default function useSelectTriggerControl(
  elements: () => (HTMLElement | SVGElement | undefined)[],
  open: () => boolean,
  triggerOpen: (open: boolean) => void,
  customizedTrigger: MaybeRefOrGetter<boolean>,
) {
  const onGlobalMouseDown = (event: MouseEvent) => {
    if (toValue(customizedTrigger)) {
      return
    }

    let target = event.target as HTMLElement

    if ((target as any)?.shadowRoot && (event as any).composed) {
      target = ((event as any).composedPath?.()[0] || target) as HTMLElement
    }

    if (
      open()
      && elements()
        .filter(element => element)
        .every(element => !element!.contains(target) && element !== target)
    ) {
      triggerOpen(false)
    }
  }

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown as any)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onGlobalMouseDown as any)
  })
}
