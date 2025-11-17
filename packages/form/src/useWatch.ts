import type {
  FormInstance,
  InternalFormInstance,
  NamePath,
  Store,
  WatchOptions,
} from './interface'
import warning from '@v-c/util/dist/warning'
import { onBeforeUnmount, ref, shallowRef, unref, watch } from 'vue'
import { HOOK_MARK, useFieldContext } from './FieldContext'
import { isFormInstance } from './utils/typeUtil'
import { getNamePath, getValue } from './utils/valueUtil'

export function stringify(value: any) {
  try {
    return JSON.stringify(value)
  }
  catch {
    return Math.random().toString()
  }
}

type WatchDeps = NamePath | ((values: Store) => any)

export default function useWatch(
  dependencies: WatchDeps,
  form?: FormInstance | WatchOptions<FormInstance>,
) {
  const options: WatchOptions<FormInstance> & { form?: FormInstance }
    = isFormInstance(form) ? { form } : (form || {})
  const fieldContext = useFieldContext()
  const formInstance = (options.form as InternalFormInstance) || fieldContext
  const isValidForm = formInstance && formInstance._init

  if (process.env.NODE_ENV !== 'production') {
    warning(
      // @ts-expect-error this is fine
      !form || isValidForm,
      'useWatch requires a form instance since it can not auto detect from context.',
    )
  }

  const mergedDeps = shallowRef(unref(dependencies))
  const valueRef = ref<any>(
    typeof mergedDeps.value === 'function' ? mergedDeps.value({} as Store) : undefined,
  )
  const valueStrRef = ref(stringify(valueRef.value))

  const triggerUpdate = (values?: Store, allValues?: Store) => {
    if (!isValidForm) {
      return
    }
    const { getFieldsValue } = formInstance
    const watchValue = options.preserve
      ? (allValues ?? getFieldsValue(true))
      : (values ?? getFieldsValue())

    const currentDeps = mergedDeps.value
    const nextValue
      = typeof currentDeps === 'function'
        ? currentDeps(watchValue)
        : getValue(watchValue, getNamePath(currentDeps))

    const nextStr = stringify(nextValue)
    if (nextStr !== valueStrRef.value) {
      valueStrRef.value = nextStr
      valueRef.value = nextValue
    }
  }

  if (isValidForm) {
    const { registerWatch } = formInstance.getInternalHooks(HOOK_MARK)!
    const cancelRegister = registerWatch((values, allValues) => {
      triggerUpdate(values, allValues)
    })

    onBeforeUnmount(() => {
      cancelRegister?.()
    })

    triggerUpdate()
  }

  watch(
    () => unref(dependencies),
    (nextDeps) => {
      mergedDeps.value = nextDeps
      triggerUpdate()
    },
    { deep: true },
  )

  return valueRef
}
