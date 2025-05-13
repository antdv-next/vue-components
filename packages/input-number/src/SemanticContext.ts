import type { InjectionKey } from 'vue'
import type { InputNumberProps } from './InputNumber'
import { inject, provide } from 'vue'

interface SemanticContextProps {
  classNames?: InputNumberProps['classNames']
  styles?: InputNumberProps['styles']
}

const SemanticContext: InjectionKey<SemanticContextProps> = Symbol('SemanticContext')

export function useProvideSemanticContext(props: SemanticContextProps) {
  provide(SemanticContext, props)
}
export function useInjectSemanticContext() {
  return inject(SemanticContext)
}
