import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import type { TriggerOpenType } from './useOpen'

export function isInside(elements: (HTMLElement | SVGElement | undefined)[], target: HTMLElement) {
  return elements
    .filter(element => element)
    .some(element => element!.contains(target) || element === target)
}

export default function useSelectTriggerControl(
  elements: () => (HTMLElement | SVGElement | undefined)[],
  open: Ref<boolean>,
  triggerOpen: TriggerOpenType,
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

    if ((event as any)._ori_target) {
      target = (event as any)._ori_target
    }

    if (
      open.value
      // Marked by SelectInput mouseDown event
      && !isInside(elements(), target)
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
