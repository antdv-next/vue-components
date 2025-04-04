// =============================== Motion ===============================
export function getMotionName(prefixCls: string, transitionName?: string, animationName?: string) {
  let motionName = transitionName
  if (!motionName && animationName) {
    motionName = `${prefixCls}-${animationName}`
  }
  return motionName
}

// =============================== Offset ===============================
function getScroll(w: Window, top?: boolean): number {
  let ret = w[`page${top ? 'Y' : 'X'}Offset`]
  const method = `scroll${top ? 'Top' : 'Left'}`
  if (typeof ret !== 'number') {
    const d = w.document as any
    ret = d.documentElement[method]
    if (typeof ret !== 'number') {
      ret = d.body[method]
    }
  }
  return ret
}

type CompatibleDocument = {
  parentWindow?: Window
} & Document

export function offset(el: Element) {
  const rect = el.getBoundingClientRect()
  const pos = {
    left: rect.left,
    top: rect.top,
  }
  const doc = el.ownerDocument as CompatibleDocument
  const w = doc.defaultView || doc.parentWindow
  if (w) {
    pos.left += getScroll(w)
    pos.top += getScroll(w, true)
  }

  return pos
}
