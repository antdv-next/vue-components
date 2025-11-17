import type { Component, FormHTMLAttributes } from 'vue'
import type { BatchTask, BatchUpdateRef } from './BatchUpdate'
import type {
  Callbacks,
  FieldData,
  FormInstance,
  InternalFormInstance,
  Store,
  ValidateMessages,
} from './interface'
import { computed, defineComponent, Fragment, h, onBeforeUnmount, reactive, ref, shallowRef, watch, watchEffect } from 'vue'
import BatchUpdate from './BatchUpdate'
import { HOOK_MARK, useFieldContextProvider } from './FieldContext'
import { useFormContext } from './FormContext'
import { useListContextProvider } from './ListContext'
import useForm from './useForm'
import { isSimilar } from './utils/valueUtil'

export type BaseFormProps = Omit<FormHTMLAttributes, 'onSubmit' | 'onReset'>

export interface FormProps<Values = any> {
  initialValues?: Store
  form?: FormInstance<Values>
  component?: false | string | Component
  fields?: FieldData[]
  name?: string
  validateMessages?: ValidateMessages
  onValuesChange?: Callbacks<Values>['onValuesChange']
  onFieldsChange?: Callbacks<Values>['onFieldsChange']
  onFinish?: Callbacks<Values>['onFinish']
  onFinishFailed?: Callbacks<Values>['onFinishFailed']
  validateTrigger?: string | string[] | false
  preserve?: boolean
  clearOnDestroy?: boolean
}

export default defineComponent<FormProps>(
  {
    name: 'Form',
    inheritAttrs: false,
    setup(props, { slots, attrs, expose }) {
      const nativeElementRef = ref<HTMLFormElement | null>(null)
      const formContext = useFormContext()
      const [formInstance] = useForm(computed(() => props.form))
      const {
        useSubscribe,
        setInitialValues,
        setCallbacks,
        setValidateMessages,
        setPreserve,
        destroyForm,
        setBatchUpdate,
      } = (formInstance.value as InternalFormInstance).getInternalHooks(HOOK_MARK) ?? {}
      const exposed = reactive({
        nativeElement: nativeElementRef,
      })

      watchEffect(() => {
        Object.assign(exposed, formInstance.value ?? {})
      })

      expose(exposed)

      watch(
        () => props.name,
        (name, prevName) => {
          if (prevName) {
            formContext.unregisterForm(prevName)
          }
          if (name) {
            formContext.registerForm(name, formInstance)
          }
        },
        { immediate: true },
      )

      watchEffect(() => {
        setValidateMessages?.({
          ...formContext.validateMessages,
          ...props.validateMessages,
        })
      })

      watchEffect(() => {
        setCallbacks?.({
          onValuesChange: props.onValuesChange,
          onFieldsChange: (changedFields: FieldData[], ...rest) => {
            formContext.triggerFormChange(props.name!, changedFields)
            props.onFieldsChange?.(changedFields, ...rest)
          },
          onFinish: (values: Store) => {
            formContext.triggerFormFinish(props.name!, values)
            props.onFinish?.(values)
          },
          onFinishFailed: props.onFinishFailed,
        })
      })

      watchEffect(() => {
        setPreserve?.(props.preserve)
      })

      const mountRef = ref(false)
      watch(
        () => props.initialValues,
        (val) => {
          setInitialValues?.(val!, !mountRef.value)
          if (!mountRef.value) {
            mountRef.value = true
          }
        },
        { immediate: true, deep: true },
      )

      const batchUpdateRef = shallowRef<BatchUpdateRef | null>(null)
      const batchUpdateTasks = shallowRef<[string, VoidFunction][]>([])

      const tryFlushBatch = () => {
        if (batchUpdateRef.value) {
          batchUpdateTasks.value.forEach(([key, fn]) => {
            batchUpdateRef.value?.batch(key, fn)
          })
          batchUpdateTasks.value = []
        }
      }

      const setBatchUpdateRef = (instance: BatchUpdateRef | null) => {
        batchUpdateRef.value = instance
        tryFlushBatch()
      }

      const batchUpdate: BatchTask = (key, callback) => {
        batchUpdateTasks.value = [...batchUpdateTasks.value, [key, callback]]
        tryFlushBatch()
      }

      setBatchUpdate?.(batchUpdate)

      onBeforeUnmount(() => {
        if (props.name) {
          formContext.unregisterForm(props.name)
        }
        destroyForm?.(props.clearOnDestroy)
      })

      const prevFields = shallowRef<FieldData[] | undefined>()
      watch(
        () => props.fields,
        (fields) => {
          if (!isSimilar(prevFields.value || [], fields || [])) {
            formInstance.value?.setFields?.(fields || [])
          }
          prevFields.value = fields
        },
        { deep: true },
      )

      const formContextValue = reactive<InternalFormInstance>({
        ...(formInstance.value as InternalFormInstance),
        validateTrigger: props.validateTrigger ?? 'onChange',
      })

      watchEffect(() => {
        Object.assign(formContextValue, formInstance.value ?? {})
      })

      watch(
        () => props.validateTrigger,
        (trigger) => {
          formContextValue.validateTrigger = trigger === undefined ? 'onChange' : trigger
        },
        { immediate: true },
      )

      useListContextProvider(null)
      useFieldContextProvider(formContextValue)

      const handleSubmit = (event: Event) => {
        event.preventDefault()
        event.stopPropagation()
        formInstance?.value?.submit?.()
      }

      const handleReset = (event: Event) => {
        event.preventDefault()
        formInstance?.value?.resetFields?.()
        const onReset = attrs.onReset as ((e: Event) => void) | undefined
        onReset?.(event)
      }

      return () => {
        const slot = slots.default
        const isRenderProps = !!slot && slot.length > 0
        useSubscribe?.(!isRenderProps)
        const childrenNode = slot
          ? (isRenderProps
              ? slot({ values: formInstance?.value?.getFieldsValue?.(true), form: formInstance })
              : slot())
          : null

        const content = (
          <Fragment>
            {childrenNode}
            <BatchUpdate ref={(el: any) => setBatchUpdateRef(el)} />
          </Fragment>
        )

        if (props.component === false) {
          return content
        }

        const ComponentTag = props.component || 'form'

        return h(
          ComponentTag as any,
          {
            ...attrs,
            ref: nativeElementRef,
            onSubmit: handleSubmit,
            onReset: handleReset,
          },
          () => content,
        )
      }
    },
  },
)
