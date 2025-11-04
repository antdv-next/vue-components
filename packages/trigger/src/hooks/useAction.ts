import type { Ref } from 'vue'
import type { ActionType } from '../interface'
import { shallowRef, watchEffect } from 'vue'

type InternalActionType = 'hover' | 'focus' | 'click' | 'contextmenu' | 'touch'

type ExternalActionType = InternalActionType | Uppercase<InternalActionType> | 'contextMenu'

type ActionTypes = ExternalActionType | ExternalActionType[]

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : []
}

function normalizeAction(action: ExternalActionType): InternalActionType {
  if (typeof action === 'string') {
    return action.toLowerCase() as InternalActionType
  }
  return action
}
export default function useAction(
  action: Ref<ActionTypes>,
  showAction?: Ref<ActionTypes | undefined>,
  hideAction?: Ref<ActionTypes | undefined>,
) {
  const _showAction = shallowRef<Set<InternalActionType>>(new Set())
  const _hideAction = shallowRef<Set<InternalActionType>>(new Set())
  watchEffect(() => {
    const mergedShowAction = toArray(showAction?.value ?? action.value).map(normalizeAction)
    const mergedHideAction = toArray(hideAction?.value ?? action.value).map(normalizeAction)

    const showActionSet = new Set(mergedShowAction)
    const hideActionSet = new Set(mergedHideAction)

    if (showActionSet.has('hover') && !showActionSet.has('click')) {
      showActionSet.add('touch')
    }

    if (hideActionSet.has('hover') && !hideActionSet.has('click')) {
      hideActionSet.add('touch')
    }
    _showAction.value = showActionSet
    _hideAction.value = hideActionSet
  })
  return [_showAction, _hideAction] as const
}
