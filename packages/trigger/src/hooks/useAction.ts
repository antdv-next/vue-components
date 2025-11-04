import type { Ref } from 'vue'
import type { ActionType } from '../interface'
import { shallowRef, watchEffect } from 'vue'

type InternalActionType = ActionType | 'touch'

type ActionTypes = InternalActionType | InternalActionType[]

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : []
}
export default function useAction(
  action: Ref<ActionTypes>,
  showAction?: Ref<ActionTypes | undefined>,
  hideAction?: Ref<ActionTypes | undefined>,
) {
  const _showAction = shallowRef<Set<InternalActionType>>(new Set())
  const _hideAction = shallowRef<Set<InternalActionType>>(new Set())
  watchEffect(() => {
    const mergedShowAction = toArray(showAction?.value ?? action.value)
    const mergedHideAction = toArray(hideAction?.value ?? action.value)

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
