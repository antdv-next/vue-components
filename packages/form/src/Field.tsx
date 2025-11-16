import type {
  EventArgs,
  InternalFormInstance,
  InternalNamePath,
  Meta,
  NamePath,
  NotifyInfo,
  Rule,
  Store,
  StoreValue,
} from './interface'
import { defineComponent, reactive, ref, shallowRef } from 'vue'

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
  /**
   * Set up `dependencies` field.
   * When dependencies field update and current field is touched,
   * will trigger validate rules and render.
   */
  dependencies?: NamePath[]

  getValueFromEvent?: (...args: EventArgs) => StoreValue
  name?: InternalNamePath
  normalize?: (value: StoreValue, prevValue: StoreValue, allValues: Store) => StoreValue
  rules?: Rule[]
  shouldUpdate?: ShouldUpdate<any>
  trigger?: string
  validateTrigger?: string | string[] | false
  /**
   * Trigger will after configured milliseconds.
   */
  validateDebounce?: number
  validateFirst?: boolean | 'parallel'
  valuePropName?: string
  getValueProps?: (value: StoreValue) => Record<string, unknown>
  messageVariables?: Record<string, string>
  initialValue?: any
  onReset?: () => void
  onMetaChange?: (meta: MetaEvent) => void
  preserve?: boolean

  /** @private Passed by Form.List props. Do not use since it will break by path check. */
  isListField?: boolean

  /** @private Passed by Form.List props. Do not use since it will break by path check. */
  isList?: boolean

  /**
   * @private Pass context as prop instead of context api
   *  since class component can not get context in constructor
   */
  fieldContext?: InternalFormInstance
}

export interface FieldProps extends Omit<InternalFieldProps, 'name' | 'fieldContext'> {
  name?: NamePath
}

export interface FieldState {
  resetCount: number
}

const Field = defineComponent<InternalFieldProps>(
  (props) => {
    const state = reactive({
      resetCount: 0,
    })
    const mounted = shallowRef(false)
    /**
     * Follow state should not management in State since it will async update by React.
     * This makes first render of form can not get correct state value.
     */
    const touched = shallowRef(false)

    /**
     * Mark when touched & validated. Currently only used for `dependencies`.
     * Note that we do not think field with `initialValue` is dirty
     * but this will be by `isFieldDirty` func.
     */

    const dirty = shallowRef(false)

    const validatePromise = ref<Promise<string> | null>()
    const errors = ref<string[]>(EMPTY_ERRORS)
    const warnings = ref<string[]>(EMPTY_WARNINGS)

    return () => {
      return null
    }
  },
  {
    name: 'FormField',
  },
)
