import warning from '@v-c/util/dist/warning'
import isEqual from '@v-c/util/dist/isEqual'
import {
  cloneVNode,
  defineComponent,
  Fragment,
  isVNode,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from 'vue'
import type { VNode } from 'vue'
import type {
  EventArgs,
  FieldEntity,
  FormInstance,
  InternalFormInstance,
  InternalNamePath,
  InternalValidateOptions,
  Meta,
  NamePath,
  NotifyInfo,
  Rule,
  RuleError,
  RuleObject,
  Store,
  StoreValue,
} from './interface'
import { HOOK_MARK, useFieldContext } from './FieldContext'
import { useListContext } from './ListContext'
import { toArray } from './utils/typeUtil'
import { validateRules } from './utils/validateUtil'
import {
  containsNamePath,
  defaultGetValueFromEvent,
  getNamePath,
  getValue,
} from './utils/valueUtil'

const EMPTY_ERRORS: any[] = []
const EMPTY_WARNINGS: any[] = []

export type ShouldUpdate<Values = any>
  = | boolean
    | ((prevValues: Values, nextValues: Values, info: { source?: string }) => boolean)

function requireUpdate(
  shouldUpdate: ShouldUpdate,
  prev: StoreValue,
  next: StoreValue,
  prevValue: StoreValue,
  nextValue: StoreValue,
  info: NotifyInfo,
): boolean {
  if (typeof shouldUpdate === 'function') {
    return shouldUpdate(prev, next, 'source' in info ? { source: info.source } : {})
  }
  return prevValue !== nextValue
}

interface ChildProps {
  [name: string]: any
}

export type MetaEvent = Meta & { destroy?: boolean }

export interface InternalFieldProps {
  dependencies?: NamePath[]
  getValueFromEvent?: (...args: EventArgs) => StoreValue
  name?: InternalNamePath
  normalize?: (value: StoreValue, prevValue: StoreValue, allValues: Store) => StoreValue
  rules?: Rule[]
  shouldUpdate?: ShouldUpdate<any>
  trigger?: string
  validateTrigger?: string | string[] | false
  validateDebounce?: number
  validateFirst?: boolean | 'parallel'
  valuePropName?: string
  getValueProps?: (value: StoreValue) => Record<string, unknown>
  messageVariables?: Record<string, string>
  initialValue?: any
  onReset?: () => void
  onMetaChange?: (meta: MetaEvent) => void
  preserve?: boolean
  isListField?: boolean
  isList?: boolean
  fieldContext?: InternalFormInstance
}

export interface FieldProps extends Omit<InternalFieldProps, 'name' | 'fieldContext'> {
  name?: NamePath
}

const InternalField = defineComponent<InternalFieldProps>(
  (props, { slots }) => {
    const mergedFieldContext = props.fieldContext || useFieldContext()
    const state = reactive({
      resetCount: 0,
    })
    const updateMark = ref(0)
    const mounted = shallowRef(false)
    const touched = shallowRef(false)
    const dirty = shallowRef(false)
    const validatePromise = shallowRef<Promise<RuleError[]> | null>(null)
    const errors = shallowRef<string[]>(EMPTY_ERRORS)
    const warnings = shallowRef<string[]>(EMPTY_WARNINGS)
    let prevValidating = false
    let metaCache: MetaEvent = null

    const triggerMetaEvent = (destroy?: boolean) => {
      const { onMetaChange } = props

      if (onMetaChange) {
        const meta = { ...getMeta(), destroy }

        if (!isEqual(metaCache, meta)) {
          onMetaChange(meta)
        }

        metaCache = meta
      }
      else {
        metaCache = null
      }
    }

    const reRender = () => {
      updateMark.value += 1
    }

    const refresh = () => {
      state.resetCount += 1
    }

    const getNamePath = (): InternalNamePath => {
      const { name } = props
      const prefixName = mergedFieldContext?.prefixName || []
      return name !== undefined ? [...prefixName, ...name] : []
    }

    const getRules = (): RuleObject[] => {
      const { rules = [] } = props
      return (rules || []).map((rule: Rule): RuleObject => {
        if (typeof rule === 'function') {
          return rule(mergedFieldContext as FormInstance)
        }
        return rule
      })
    }

    const getValueFromStore = (store?: Store) => {
      const { getFieldsValue } = mergedFieldContext as FormInstance
      const namePath = getNamePath()
      return getValue(store || getFieldsValue(true), namePath)
    }

    const isFieldValidating = () => !!validatePromise.value

    const isFieldTouched = () => touched.value

    const isFieldDirty = () => {
      if (dirty.value || props.initialValue !== undefined) {
        return true
      }

      const { fieldContext } = props
      const { getInitialValue } = fieldContext.getInternalHooks(HOOK_MARK)
      if (getInitialValue(getNamePath()) !== undefined) {
        return true
      }

      return false
    }

    const getMeta = (): Meta => {
      const validating = isFieldValidating()
      prevValidating = validating
      return {
        touched: isFieldTouched(),
        validating,
        errors: errors.value,
        warnings: warnings.value,
        name: getNamePath(),
        validated: validatePromise.value === null,
      }
    }

    const getControlled = (childProps: ChildProps = {}) => {
      const {
        name,
        trigger = 'onChange',
        validateTrigger,
        getValueFromEvent,
        normalize,
        valuePropName = 'value',
        getValueProps,
      } = props

      const mergedValidateTrigger
        = validateTrigger !== undefined ? validateTrigger : mergedFieldContext.validateTrigger

      const namePath = getNamePath()
      const { getInternalHooks, getFieldsValue } = mergedFieldContext
      const { dispatch } = getInternalHooks(HOOK_MARK)
      const value = getValueFromStore()
      const mergedGetValueProps
        = getValueProps || ((val: StoreValue) => ({ [valuePropName]: val }))

      const originTriggerFunc = childProps[trigger]
      const valueProps = name !== undefined ? mergedGetValueProps(value) : {}

      if (process.env.NODE_ENV !== 'production' && valueProps) {
        Object.keys(valueProps).forEach((key) => {
          warning(
            typeof valueProps[key] !== 'function',
            `It's not recommended to generate dynamic function prop by \`getValueProps\`. Please pass it to child component directly (prop: ${key})`,
          )
        })
      }

      const control: ChildProps = {
        ...childProps,
        ...valueProps,
      }

      control[trigger] = (...args: EventArgs) => {
        touched.value = true
        dirty.value = true
        triggerMetaEvent()

        let newValue: StoreValue
        if (getValueFromEvent) {
          newValue = getValueFromEvent(...args)
        }
        else {
          newValue = defaultGetValueFromEvent(valuePropName, ...args)
        }

        if (normalize) {
          newValue = normalize(newValue, value, getFieldsValue(true))
        }
        if (newValue !== value) {
          dispatch({
            type: 'updateValue',
            namePath,
            value: newValue,
          })
        }
        if (originTriggerFunc) {
          originTriggerFunc(...args)
        }
      }

      const validateTriggerList: string[] = toArray(mergedValidateTrigger || [])

      validateTriggerList.forEach((triggerName: string) => {
        const originTrigger = control[triggerName]
        control[triggerName] = (...args: EventArgs) => {
          if (originTrigger) {
            originTrigger(...args)
          }

          const { rules } = props
          if (rules && rules.length) {
            dispatch({
              type: 'validateField',
              namePath,
              triggerName,
            })
          }
        }
      })

      return control
    }

    const onStoreChange: FieldEntity['onStoreChange'] = (prevStore, namePathList, info) => {
      const { shouldUpdate, dependencies = [], onReset } = props
      const { store } = info
      const namePath = getNamePath()
      const prevValue = getValueFromStore(prevStore)
      const curValue = getValueFromStore(store)

      const namePathMatch = namePathList && containsNamePath(namePathList, namePath)

      if (
        info.type === 'valueUpdate'
        && info.source === 'external'
        && !isEqual(prevValue, curValue)
      ) {
        touched.value = true
        dirty.value = true
        validatePromise.value = null
        errors.value = EMPTY_ERRORS
        warnings.value = EMPTY_WARNINGS
        triggerMetaEvent()
      }

      switch (info.type) {
        case 'reset':
          if (!namePathList || namePathMatch) {
            touched.value = false
            dirty.value = false
            validatePromise.value = null
            errors.value = EMPTY_ERRORS
            warnings.value = EMPTY_WARNINGS
            triggerMetaEvent()
            onReset?.()
            refresh()
            return
          }
          break
        case 'remove':
          if (
            shouldUpdate
            && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)
          ) {
            reRender()
            return
          }
          break
        case 'setField': {
          const { data } = info
          if (namePathMatch) {
            if ('touched' in data) {
              touched.value = data.touched
            }
            if ('validating' in data && !('originRCField' in data)) {
              validatePromise.value = data.validating ? Promise.resolve([]) : null
            }
            if ('errors' in data) {
              errors.value = data.errors || EMPTY_ERRORS
            }
            if ('warnings' in data) {
              warnings.value = data.warnings || EMPTY_WARNINGS
            }
            dirty.value = true

            triggerMetaEvent()
            reRender()
            return
          }
          else if ('value' in data && containsNamePath(namePathList, namePath, true)) {
            reRender()
            return
          }

          if (
            shouldUpdate
            && !namePath.length
            && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)
          ) {
            reRender()
            return
          }
          break
        }
        case 'dependenciesUpdate': {
          const dependencyList = dependencies.map(getNamePath)
          if (dependencyList.some(dependency => containsNamePath(info.relatedFields, dependency))) {
            reRender()
            return
          }
          break
        }
        default:
          if (
            namePathMatch
            || ((!dependencies.length || namePath.length || shouldUpdate)
              && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info))
          ) {
            reRender()
            return
          }
          break
      }

      if (shouldUpdate === true) {
        reRender()
      }
    }

    const validateFieldRules: FieldEntity['validateRules'] = (options?: InternalValidateOptions) => {
      const namePath = getNamePath()
      const currentValue = getValueFromStore()
      const { triggerName, validateOnly = false } = options || {}

      const rootPromise = Promise.resolve().then(async (): Promise<RuleError[]> => {
        if (!mounted.value) {
          return []
        }

        const { validateFirst = false, messageVariables, validateDebounce } = props

        let filteredRules = getRules()
        if (triggerName) {
          filteredRules = filteredRules
            .filter(rule => rule)
            .filter((rule: RuleObject) => {
              const { validateTrigger } = rule
              if (!validateTrigger) {
                return true
              }
              const triggerList = toArray(validateTrigger)
              return triggerList.includes(triggerName)
            })
        }

        if (validateDebounce && triggerName) {
          await new Promise(resolve => setTimeout(resolve, validateDebounce))
          if (validatePromise.value !== rootPromise) {
            return []
          }
        }

        const promise = validateRules(
          namePath,
          currentValue,
          filteredRules,
          options,
          validateFirst,
          messageVariables,
        )

        promise
          .catch(e => e)
          .then((ruleErrors: RuleError[] = EMPTY_ERRORS) => {
            if (validatePromise.value === rootPromise) {
              validatePromise.value = null

              const nextErrors: string[] = []
              const nextWarnings: string[] = []
              ruleErrors.forEach?.(({ rule: { warningOnly }, errors: ruleErrs = EMPTY_ERRORS }) => {
                if (warningOnly) {
                  nextWarnings.push(...ruleErrs)
                }
                else {
                  nextErrors.push(...ruleErrs)
                }
              })

              errors.value = nextErrors
              warnings.value = nextWarnings
              triggerMetaEvent()
              reRender()
            }
          })

        return promise
      })

      if (validateOnly) {
        return rootPromise
      }

      validatePromise.value = rootPromise
      dirty.value = true
      errors.value = EMPTY_ERRORS
      warnings.value = EMPTY_WARNINGS
      triggerMetaEvent()
      reRender()

      return rootPromise
    }

    const fieldEntity: FieldEntity = {
      onStoreChange,
      isFieldTouched,
      isFieldDirty,
      isFieldValidating,
      isListField: () => !!props.isListField,
      isList: () => !!props.isList,
      isPreserve: () => props.preserve,
      validateRules: validateFieldRules,
      getMeta,
      getNamePath,
      getErrors: () => errors.value,
      getWarnings: () => warnings.value,
      props,
    }

    if (mergedFieldContext) {
      const { getInternalHooks } = mergedFieldContext
      const { initEntityValue } = getInternalHooks(HOOK_MARK)
      initEntityValue(fieldEntity)
    }

    let cancelRegisterFunc: ((
      isListField?: boolean,
      preserve?: boolean,
      subNamePath?: InternalNamePath,
    ) => void) | null = null

    const cancelRegister = () => {
      const { preserve, isListField } = props
      if (cancelRegisterFunc) {
        cancelRegisterFunc(isListField, preserve, getNamePath())
      }
      cancelRegisterFunc = null
    }

    onMounted(() => {
      mounted.value = true
      if (mergedFieldContext) {
        const { registerField } = mergedFieldContext.getInternalHooks(HOOK_MARK)
        cancelRegisterFunc = registerField(fieldEntity)
      }

      if (props.shouldUpdate === true) {
        reRender()
      }
    })

    onBeforeUnmount(() => {
      cancelRegister()
      triggerMetaEvent(true)
      mounted.value = false
    })

    const renderChildren = () => {
      const slot = slots.default
      if (!slot) {
        return null
      }

      const control = getControlled()
      const meta = getMeta()
      const slotProps = { ...control, meta, form: mergedFieldContext }

      const children = slot(slotProps) as VNode[] | VNode | undefined
      if (slot.length) {
        return children
      }

      const childList = toArray(children || [])
      if (childList.length !== 1 || !isVNode(childList[0])) {
        if (process.env.NODE_ENV !== 'production') {
          warning(!childList.length, '`children` of Field is not valid VNode.')
        }
        return childList
      }

      return cloneVNode(childList[0], getControlled((childList[0] as any).props))
    }

    return () => {
      void updateMark.value
      return (
        <Fragment key={state.resetCount}>
          {renderChildren()}
        </Fragment>
      )
    }
  },
  {
    name: 'FormField',
  },
)

const Field = defineComponent<FieldProps>(
  (props, { slots }) => {
    const fieldContext = useFieldContext()
    const listContext = useListContext()
    const namePath = props.name !== undefined ? getNamePath(props.name as NamePath) : undefined
    const isMergedListField = props.isListField ?? !!listContext

    let key = 'keep'
    if (!isMergedListField) {
      key = `_${(namePath || []).join('_')}`
    }

    if (
      process.env.NODE_ENV !== 'production'
      && props.preserve === false
      && isMergedListField
      && (namePath?.length || 0) <= 1
    ) {
      warning(false, '`preserve` should not apply on Form.List fields.')
    }

    return (
      <InternalField
        key={key}
        {...props}
        name={namePath as InternalNamePath}
        isListField={isMergedListField}
        fieldContext={fieldContext}
        v-slots={slots}
      />
    )
  },
  {
    name: 'Field',
  },
)

export default Field
