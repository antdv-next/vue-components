import type { InjectionKey, ShallowRef } from 'vue'
import type { IDialogPropTypes } from './IDialogPropTypes.ts'
import { inject, provide, shallowRef } from 'vue'

export interface RefContextProps {
  panel: ShallowRef<HTMLDivElement | undefined>
  setPanel: (panel: HTMLDivElement) => void
}

const RefContext: InjectionKey<RefContextProps> = Symbol('RefContext')

export function useRefProvide(props: IDialogPropTypes) {
  const panel = shallowRef<HTMLDivElement>()
  const setPanelRef = (el: HTMLDivElement) => {
    if (typeof props.panelRef === 'function') {
      props.panelRef(el)
    }
    panel.value = el
  }
  provide(RefContext, {
    panel,
    setPanel(panel) {
      setPanelRef(panel)
    },
  })
  return {
    panel,
    setPanelRef,
  }
}

export function useGetRefContext() {
  return inject(RefContext, {} as RefContextProps)
}
