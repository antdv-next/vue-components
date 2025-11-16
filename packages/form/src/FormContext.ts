import type { InjectionKey } from 'vue'
import { defineComponent, inject, provide, reactive, shallowRef, watchEffect } from 'vue'
import type { FieldData, FormInstance, Store, ValidateMessages } from './interface'

export type Forms = Record<string, FormInstance>

export interface FormChangeInfo {
  changedFields: FieldData[]
  forms: Forms
}

export interface FormFinishInfo {
  values: Store
  forms: Forms
}

export interface FormProviderProps {
  validateMessages?: ValidateMessages
  onFormChange?: (name: string, info: FormChangeInfo) => void
  onFormFinish?: (name: string, info: FormFinishInfo) => void
}

export interface FormContextProps extends FormProviderProps {
  triggerFormChange: (name: string, changedFields: FieldData[]) => void
  triggerFormFinish: (name: string, values: Store) => void
  registerForm: (name: string, form: FormInstance) => void
  unregisterForm: (name: string) => void
  validateMessages?: ValidateMessages
}

const FormContextKey: InjectionKey<FormContextProps> = Symbol('FormContext')

const defaultContext: FormContextProps = {
  triggerFormChange: () => {},
  triggerFormFinish: () => {},
  registerForm: () => {},
  unregisterForm: () => {},
  validateMessages: undefined,
}

export function useFormContext(): FormContextProps {
  return inject(FormContextKey, defaultContext)
}

const FormProvider = defineComponent<FormProviderProps>(
  (props, { slots }) => {
    const parentContext = useFormContext()
    const formsRef = shallowRef<Forms>({})

    const context = reactive<FormContextProps>({
      ...parentContext,
      validateMessages: {
        ...parentContext.validateMessages,
        ...props.validateMessages,
      },
      triggerFormChange: (name, changedFields) => {
        props.onFormChange?.(name, {
          changedFields,
          forms: formsRef.value,
        })
        parentContext.triggerFormChange(name, changedFields)
      },
      triggerFormFinish: (name, values) => {
        props.onFormFinish?.(name, {
          values,
          forms: formsRef.value,
        })
        parentContext.triggerFormFinish(name, values)
      },
      registerForm: (name, form) => {
        if (name) {
          formsRef.value = {
            ...formsRef.value,
            [name]: form,
          }
        }
        parentContext.registerForm(name, form)
      },
      unregisterForm: (name) => {
        if (name) {
          const nextForms = { ...formsRef.value }
          delete nextForms[name]
          formsRef.value = nextForms
        }
        parentContext.unregisterForm(name)
      },
    })

    watchEffect(() => {
      context.validateMessages = {
        ...parentContext.validateMessages,
        ...props.validateMessages,
      }
    })

    provide(FormContextKey, context)

    return () => slots.default?.()
  },
  {
    name: 'FormProvider',
  },
)

export { FormProvider }

export default FormContextKey
