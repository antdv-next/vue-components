import type { ActionType } from '../interface'

type ActionTypes = ActionType | ActionType[]

function toArray<T>(val?: T | T[]) {
  return val ? (Array.isArray(val) ? val : [val]) : []
}

export default function useAction(
  mobile: boolean,
  action: ActionTypes,
  showAction?: ActionTypes | undefined,
  hideAction?: ActionTypes | undefined,
): [showAction: Set<ActionType>, hideAction: Set<ActionType>] {
  const mergedShowAction = toArray(showAction ?? action)
  const mergedHideAction = toArray(hideAction ?? action)

  const showActionSet = new Set(mergedShowAction)
  const hideActionSet = new Set(mergedHideAction)

  if (mobile) {
    if (showActionSet.has('hover')) {
      showActionSet.delete('hover')
      showActionSet.add('click')
    }

    if (hideActionSet.has('hover')) {
      hideActionSet.delete('hover')
      hideActionSet.add('click')
    }
  }

  return [showActionSet, hideActionSet]
}
