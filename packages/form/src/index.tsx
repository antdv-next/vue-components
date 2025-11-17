import type { FormProps } from './Form'
import type { FormInstance, FormRef } from './interface'
import Field from './Field'
import { useFieldContext, useFieldContextProvider } from './FieldContext'
import Form from './Form'
import { FormProvider } from './FormContext'
import List from './List'
import { useListContext, useListContextProvider } from './ListContext'
import useForm from './useForm'
import useWatch from './useWatch'

const InternalForm = Form as typeof Form & {
  FormProvider: typeof FormProvider
  Field: typeof Field
  List: typeof List
  useForm: typeof useForm
  useWatch: typeof useWatch
}

InternalForm.FormProvider = FormProvider
InternalForm.Field = Field
InternalForm.List = List
InternalForm.useForm = useForm
InternalForm.useWatch = useWatch

export { Field, FormProvider, List, useFieldContext, useFieldContextProvider, useForm, useListContext, useListContextProvider, useWatch }

export type { FormInstance, FormProps, FormRef }

export default InternalForm
