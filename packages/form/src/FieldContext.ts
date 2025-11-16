import type { InjectionKey } from 'vue'
import type { InternalFormInstance } from './interface.ts'
import warning from '@v-c/util/dist/warning'
import { inject, provide } from 'vue'

export const HOOK_MARK = 'RC_FORM_INTERNAL_HOOKS'

const warningFunc: any = () => {
  warning(false, 'Can not find FormContext. Please make sure you wrap Field under Form.')
}

const FieldContextKey: InjectionKey<InternalFormInstance> = Symbol('FieldContext')

export function useFieldContextProvider(context: InternalFormInstance) {
  provide(FieldContextKey, context)
}
const defaults: InternalFormInstance = {
  getFieldValue: warningFunc,
  getFieldsValue: warningFunc,
  getFieldError: warningFunc,
  getFieldWarning: warningFunc,
  getFieldsError: warningFunc,
  isFieldsTouched: warningFunc,
  isFieldTouched: warningFunc,
  isFieldValidating: warningFunc,
  isFieldsValidating: warningFunc,
  resetFields: warningFunc,
  setFields: warningFunc,
  setFieldValue: warningFunc,
  setFieldsValue: warningFunc,
  validateFields: warningFunc,
  submit: warningFunc,
  getInternalHooks: () => {
    warningFunc()

    return {
      dispatch: warningFunc,
      initEntityValue: warningFunc,
      registerField: warningFunc,
      useSubscribe: warningFunc,
      setInitialValues: warningFunc,
      destroyForm: warningFunc,
      setCallbacks: warningFunc,
      registerWatch: warningFunc,
      getFields: warningFunc,
      setValidateMessages: warningFunc,
      setPreserve: warningFunc,
      getInitialValue: warningFunc,
      setBatchUpdate: warningFunc,
    }
  },
}

export function useFieldContext(): InternalFormInstance {
  return inject(FieldContextKey, defaults)
}
