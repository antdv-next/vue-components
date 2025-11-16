import warning from '@v-c/util/dist/warning'
import { defineComponent, reactive } from 'vue'
import type {
  InternalFormInstance,
  InternalNamePath,
  Meta,
  NamePath,
  StoreValue,
  ValidatorRule,
} from './interface'
import { useFieldContext } from './FieldContext'
import Field from './Field'
import { getNamePath, move } from './utils/valueUtil'
import type { ListContextProps } from './ListContext'
import { useListContext, useListContextProvider } from './ListContext'
import { useFieldContextProvider } from './FieldContext'

export interface ListField {
  name: number
  key: number
  isListField: boolean
}

export interface ListOperations {
  add: (defaultValue?: StoreValue, index?: number) => void
  remove: (index: number | number[]) => void
  move: (from: number, to: number) => void
}

export interface ListProps<Values = any> {
  name: NamePath<Values>
  rules?: ValidatorRule[]
  validateTrigger?: string | string[] | false
  initialValue?: any[]
  isListField?: boolean
}

export default defineComponent<ListProps>(
  (props, { slots }) => {
    const context = useFieldContext()
    const wrapperListContext = useListContext()
    const keyManager = reactive<{ keys: number[], id: number }>({ keys: [], id: 0 })

    const prefixName = getNamePath(context.prefixName) || []
    const listName = getNamePath(props.name)
    const mergedPrefixName: InternalNamePath = [...prefixName, ...listName]

    const fieldContext: InternalFormInstance = {
      ...context,
      prefixName: mergedPrefixName,
    }

    const listContext: ListContextProps = {
      getKey: (namePath: InternalNamePath) => {
        const len = mergedPrefixName.length
        const pathName = namePath[len]
        return [keyManager.keys[pathName], namePath.slice(len + 1)]
      },
    }

    const slot = slots.default
    if (!slot) {
      warning(false, 'Form.List requires a scoped slot as its child.')
      return () => null
    }

    const shouldUpdate = (prevValue: StoreValue, nextValue: StoreValue, { source }) => {
      if (source === 'internal') {
        return false
      }
      return prevValue !== nextValue
    }

    useListContextProvider(listContext)
    useFieldContextProvider(fieldContext)

    return () => (
      <Field
        name={[]}
        shouldUpdate={shouldUpdate}
        rules={props.rules}
        validateTrigger={props.validateTrigger}
        initialValue={props.initialValue}
        isList
        isListField={props.isListField ?? !!wrapperListContext}
        v-slots={{
          default: ({ value = [], onChange }, meta: Meta) => {
            const listValue = Array.isArray(value) ? value : []

            if (!Array.isArray(value) && process.env.NODE_ENV !== 'production') {
              warning(false, `Current value of '${mergedPrefixName.join(' > ')}' is not an array type.`)
            }

            const getNewValue = () => {
              const values = context.getFieldValue(mergedPrefixName || []) as StoreValue[]
              return values || []
            }

            const operations: ListOperations = {
              add: (defaultValue, index?: number) => {
                const newValue = getNewValue()

                if (index !== undefined && index >= 0 && index <= newValue.length) {
                  keyManager.keys = [
                    ...keyManager.keys.slice(0, index),
                    keyManager.id,
                    ...keyManager.keys.slice(index),
                  ]
                  onChange([...newValue.slice(0, index), defaultValue, ...newValue.slice(index)])
                }
                else {
                  if (
                    process.env.NODE_ENV !== 'production'
                    && index !== undefined
                    && (index < 0 || index > newValue.length)
                  ) {
                    warning(
                      false,
                      'The second parameter of the add function should be a valid positive number.',
                    )
                  }
                  keyManager.keys = [...keyManager.keys, keyManager.id]
                  onChange([...newValue, defaultValue])
                }
                keyManager.id += 1
              },
              remove: (index: number | number[]) => {
                const newValue = getNewValue()
                const indexSet = new Set(Array.isArray(index) ? index : [index])

                if (indexSet.size <= 0) {
                  return
                }
                keyManager.keys = keyManager.keys.filter((_, keysIndex) => !indexSet.has(keysIndex))
                onChange(newValue.filter((_, valueIndex) => !indexSet.has(valueIndex)))
              },
              move: (from: number, to: number) => {
                if (from === to) {
                  return
                }
                const newValue = getNewValue()

                if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
                  return
                }

                keyManager.keys = move(keyManager.keys, from, to)
                onChange(move(newValue, from, to))
              },
            }

            const fields = (listValue as StoreValue[]).map((__, index): ListField => {
              let key = keyManager.keys[index]
              if (key === undefined) {
                keyManager.keys[index] = keyManager.id
                key = keyManager.keys[index]
                keyManager.id += 1
              }

              return {
                name: index,
                key,
                isListField: true,
              }
            })

            return slot({ fields, operations, meta })
          },
        }}
      />
    )
  },
  {
    name: 'FormList',
  },
)
