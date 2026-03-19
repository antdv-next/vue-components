import type { InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface FocusBoundaryContextProps {
  registerAllowedElement: (element: HTMLElement) => VoidFunction
}

const FocusBoundaryContextKey: InjectionKey<FocusBoundaryContextProps | null> = Symbol('FocusBoundaryContext')

export function useFocusBoundaryProvider(props: FocusBoundaryContextProps) {
  provide(FocusBoundaryContextKey, props)
}

export function useFocusBoundary() {
  return inject(FocusBoundaryContextKey, null)
}
