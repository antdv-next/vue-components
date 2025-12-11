import type { InjectionKey, Ref, ShallowRef } from 'vue'
import { inject, provide, ref, shallowRef } from 'vue'

export interface DrawerContextProps {
  pushDistance?: number | string
  push: VoidFunction
  pull: VoidFunction
}

export interface RefContextProps {
  panel: ShallowRef<HTMLDivElement | undefined>
  setPanel: (panel: HTMLDivElement) => void
}

const RefContext: InjectionKey<RefContextProps> = Symbol('RefContext')

export function useRefProvide(context: RefContextProps) {
  provide(RefContext, context)
}

export function useRefContext() {
  return inject(RefContext, {
    panel: shallowRef(),
    setPanel: () => {},
  })!
}

const DrawerContext: InjectionKey<Ref<DrawerContextProps>> = Symbol('DrawerContext')

export function useDrawerContext() {
  return inject(DrawerContext, ref())
}

export function useDrawerProvide(props: Ref<DrawerContextProps>) {
  return inject(DrawerContext, props)
}
