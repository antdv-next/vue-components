import Field from './Field'
import List from './List'
import useForm from './useForm'
import type { FormProps } from './Form'
import Form from './Form'
import { FormProvider } from './FormContext'
import { useFieldContext, useFieldContextProvider } from './FieldContext'
import { useListContext, useListContextProvider } from './ListContext'
import useWatch from './useWatch'
import type { FormInstance, FormRef } from './interface'

interface FormType extends typeof Form {
  FormProvider: typeof FormProvider
  Field: typeof Field
  List: typeof List
  useForm: typeof useForm
  useWatch: typeof useWatch
}

const InternalForm = Form as FormType
InternalForm.FormProvider = FormProvider
InternalForm.Field = Field
InternalForm.List = List
InternalForm.useForm = useForm
InternalForm.useWatch = useWatch

export { Field, List, useForm, FormProvider, useFieldContext, useFieldContextProvider, useListContext, useListContextProvider, useWatch }

export type { FormProps, FormInstance, FormRef }

export default InternalForm
