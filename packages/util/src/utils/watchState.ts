export function watchState() {
  let states: any = []
  return (fn: any, args: any[]) => {
    states = JSON.stringify(args)
    return fn(args, states)
  }
}

export function renderFirstTrigger() {
  // 只触发一次后不再出发
  let triggered = false
  return (fn: any, args: any[]) => {
    if (!triggered) {
      triggered = true
      return fn(args)
    }
  }
}
