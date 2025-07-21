import type { InjectionKey } from 'vue'
import type { OnGroupPreview, RegisterImage } from './interface'
import { inject, provide } from 'vue'

export interface PreviewGroupContextProps {
  register: RegisterImage
  onPreview: OnGroupPreview
}

export const PreviewGroupInjectionKey: InjectionKey<PreviewGroupContextProps | null> = Symbol('PreviewGroupInjectionKey')

function PreviewGroupContext() {
  return provide(PreviewGroupInjectionKey, null)
}

function usePreviewGroupContext(data?: PreviewGroupContextProps) {
  return inject(PreviewGroupInjectionKey, data)
}
export { PreviewGroupContext, usePreviewGroupContext }
