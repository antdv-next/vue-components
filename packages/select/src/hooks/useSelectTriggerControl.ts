import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

export default function useSelectTriggerControl(
  elements: () => (HTMLElement | SVGElement | undefined)[],
  open: Ref<boolean>,
  triggerOpen: (open: boolean) => void,
  customizedTrigger: Ref<boolean>,
) {
  const onGlobalMouseDown = (event: MouseEvent) => {
    // If trigger is customized, Trigger will take control of popupVisible
    if (customizedTrigger.value) {
      return
    }
    let target = event.target as HTMLElement
    if (target.shadowRoot && event.composed) {
      target = (event.composedPath()[0] || target) as HTMLElement
    }

    if (
      open.value
      && elements()
        .filter(element => element)
        .every(element => !element!.contains(target) && element !== target)
    ) {
      // Should trigger close
      triggerOpen(false)
    }
  }

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown)
    onUnmounted(() => {
      window.removeEventListener('mousedown', onGlobalMouseDown)
    })
  })
}
