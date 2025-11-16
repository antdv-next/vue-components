import type { InternalNamePath, StoreValue } from './interface'

interface UpdateAction {
  type: 'updateValue'
  namePath: InternalNamePath
  value: StoreValue
}

interface ValidateAction {
  type: 'validateField'
  namePath: InternalNamePath
  triggerName: string
}

export type ReducerAction = UpdateAction | ValidateAction
