import type { Ref } from 'vue'
import type { ColumnType, Direction, Key } from '../interface'
import { getDOM } from '@v-c/util/dist/Dom/findDOMNode'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { getColumnsKey } from '../utils/valueUtil'

/** Pointer travel (px) before a press on the handle turns into a drag. */
export const RESIZE_DRAG_THRESHOLD = 3
/** Lower bound applied when the column has no `minWidth`. */
export const RESIZE_DEFAULT_MIN_WIDTH = 40

/**
 * A committed width for one leaf column. `base` snapshots the column's
 * configured `width` at commit time: the entry only applies while the source
 * width still equals it and is dropped once the source changes, so controlled
 * usage (`onResizeColumn` -> update `columns`) hands over to the new width and
 * a later return to the old one (e.g. a reset) is not overridden.
 */
export interface ResizedWidth {
  width: number
  base: ColumnType<any>['width']
  /**
   * A sibling width captured by a commit to keep the drop point exact in a
   * stretched table, as opposed to a width the user dragged. Pins only
   * describe the layout at the time of that drag, so they are released as
   * soon as column widths change from outside, the set of columns changes or
   * the table itself is resized.
   */
  pinned?: boolean
}

export type StartColumnResize = (
  event: MouseEvent,
  column: ColumnType<any>,
  columnKey: Key,
  headerCell: HTMLElement,
) => void

interface DragState {
  started: boolean
  headerCell: HTMLElement
  column: ColumnType<any>
  columnKey: Key
  startClientX: number
  startWidth: number
  pendingWidth: number
  minWidth: number
  rtl: boolean
}

interface BodyStyleSnapshot {
  cursor: string
  cursorPriority: string
  userSelect: string
  userSelectPriority: string
}

export interface ResizableColumnsOptions {
  direction: Ref<Direction>
  rootRef: Ref<HTMLElement | null>
  scrollBodyRef: Ref<any>
  /** Shared with `useColumns`, which applies the entries to the leaf columns. */
  resizedWidths: Ref<Map<Key, ResizedWidth>>
  /** Leaf columns with their configured (not resized) `width`. */
  sourceFlattenColumns: Ref<readonly ColumnType<any>[]>
  /** Leaf columns as rendered, with resized widths applied. */
  flattenColumns: Ref<readonly ColumnType<any>[]>
  /** Rendered leaf widths measured by the measure row, keyed like `getColumnsKey`. */
  measuredWidths: Ref<Map<Key, number>>
  /** Width the leaves are stretched to when they add up to less (container or `scroll.x`). */
  getFillWidth: () => number
  /** Rendered width of the table; a change releases pinned sibling widths. */
  containerWidth: Ref<number>
  onResizeColumn: () => ((width: number, column: ColumnType<any>, columnKey: Key) => void) | undefined
}

export default function useResizableColumns(options: ResizableColumnsOptions) {
  const { resizedWidths } = options
  const proxyRef = shallowRef<HTMLDivElement | null>(null)
  /**
   * Rendered widths of the columns without a `width`, captured by the last
   * commit. In a fixed layout such a column only gets what the others leave
   * of the table width, so widening a sibling would squeeze it down to
   * nothing; these floors make the table grow (and scroll) instead.
   */
  const autoFloors = shallowRef(new Map<Key, number>())

  let dragState: DragState | undefined
  /** Lets the controlled echo of a commit be told apart from an outside change. */
  let lastCommit: { key: Key, width: number } | undefined
  let bodyStyleSnapshot: BodyStyleSnapshot | undefined
  let clickSuppression: { headerCell: HTMLElement, listener: (event: MouseEvent) => void, timer: ReturnType<typeof setTimeout> } | undefined

  function lockBodyStyles() {
    const { style } = document.body
    bodyStyleSnapshot = {
      cursor: style.cursor,
      cursorPriority: style.getPropertyPriority('cursor'),
      userSelect: style.userSelect,
      userSelectPriority: style.getPropertyPriority('user-select'),
    }
    style.setProperty('cursor', 'col-resize', 'important')
    style.setProperty('user-select', 'none', 'important')
  }

  function unlockBodyStyles() {
    if (!bodyStyleSnapshot) {
      return
    }
    const { style } = document.body
    style.setProperty('cursor', bodyStyleSnapshot.cursor, bodyStyleSnapshot.cursorPriority)
    style.setProperty('user-select', bodyStyleSnapshot.userSelect, bodyStyleSnapshot.userSelectPriority)
    bodyStyleSnapshot = undefined
  }

  function clearClickSuppression() {
    if (!clickSuppression) {
      return
    }
    clearTimeout(clickSuppression.timer)
    clickSuppression.headerCell.removeEventListener('click', clickSuppression.listener, true)
    clickSuppression = undefined
  }

  /**
   * A drag that ends inside the same header cell still produces a `click` on it
   * (mousedown and mouseup share that ancestor), which would trigger header
   * behaviors such as sorting. Swallow exactly that one click; drop the guard
   * on the next macrotask if no click follows.
   */
  function suppressNextClick(headerCell: HTMLElement) {
    clearClickSuppression()
    const listener = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      clearClickSuppression()
    }
    headerCell.addEventListener('click', listener, true)
    clickSuppression = {
      headerCell,
      listener,
      timer: setTimeout(clearClickSuppression, 0),
    }
  }

  function moveProxy(state: DragState) {
    const proxy = proxyRef.value
    if (!proxy) {
      return
    }
    const offset = (state.pendingWidth - state.startWidth) * (state.rtl ? -1 : 1)
    proxy.style.transform = `translateX(${offset}px)`
  }

  function activateDrag(state: DragState) {
    const root = options.rootRef.value
    const proxy = proxyRef.value
    if (!root || !proxy) {
      return false
    }

    const cellRect = state.headerCell.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()

    // `clientHeight` excludes a native horizontal scrollbar; fall back to the
    // header cell when the body element is not available (e.g. no data).
    const bodyElement = getDOM(options.scrollBodyRef.value) as HTMLElement | null
    const bodyBottom = bodyElement instanceof HTMLElement
      ? bodyElement.getBoundingClientRect().top + bodyElement.clientHeight
      : cellRect.bottom
    const edge = (state.rtl ? cellRect.left : cellRect.right) - rootRect.left

    proxy.style.left = `${Math.min(Math.max(edge, 0), rootRect.width)}px`
    proxy.style.top = `${cellRect.top - rootRect.top}px`
    proxy.style.height = `${Math.max(bodyBottom, cellRect.bottom) - cellRect.top}px`
    proxy.style.display = 'block'

    state.started = true
    moveProxy(state)
    lockBodyStyles()
    return true
  }

  function cleanupDrag() {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('blur', cancelDrag)
    unlockBodyStyles()

    const proxy = proxyRef.value
    if (proxy) {
      proxy.style.display = 'none'
      proxy.style.transform = ''
    }
    dragState = undefined
  }

  function onMouseMove(event: MouseEvent) {
    const state = dragState
    if (!state) {
      return
    }

    const delta = event.clientX - state.startClientX
    if (!state.started && (Math.abs(delta) < RESIZE_DRAG_THRESHOLD || !activateDrag(state))) {
      return
    }

    event.preventDefault()
    state.pendingWidth = Math.max(
      Math.round(state.startWidth + (state.rtl ? -delta : delta)),
      state.minWidth,
    )
    moveProxy(state)
  }

  function onMouseUp() {
    const state = dragState
    if (!state) {
      return
    }

    const { started, headerCell, column, columnKey, pendingWidth, startWidth } = state
    cleanupDrag()

    if (!started) {
      return
    }

    suppressNextClick(headerCell)

    if (pendingWidth === startWidth) {
      return
    }

    resizedWidths.value = commitWidths(columnKey, column, pendingWidth)
    lastCommit = { key: columnKey, width: pendingWidth }
    options.onResizeColumn()?.(pendingWidth, column, columnKey)
  }

  /**
   * Entries to store for a drag that ends at `pendingWidth`.
   *
   * When every leaf has a numeric width and they add up to less than the fill
   * width, fixed table layout (or `useWidthColumns` for virtual tables)
   * stretches all of them proportionally, the dragged one included, so it
   * would not end where it was dropped. In that case the siblings are pinned
   * to their rendered width, and room freed below the fill width is handed to
   * them rather than to the dragged column. A column without a numeric width
   * absorbs any slack by itself, so nothing is pinned then; its current width
   * becomes a floor instead (see `autoFloors`).
   */
  function commitWidths(columnKey: Key, column: ColumnType<any>, pendingWidth: number) {
    const current = resizedWidths.value
    const next = new Map(current)
    next.set(columnKey, { width: pendingWidth, base: column.width })

    const sourceColumns = options.sourceFlattenColumns.value
    const keys = getColumnsKey(sourceColumns)
    const measured = options.measuredWidths.value
    const siblings: { key: Key, effective: number, entry: ResizedWidth }[] = []
    const floors = new Map<Key, number>()
    let flexible = false
    let siblingsWidth = 0

    for (let index = 0; index < sourceColumns.length; index += 1) {
      const key = keys[index]!
      if (key === columnKey) {
        continue
      }
      const base = sourceColumns[index]!.width
      const active = current.get(key)
      const dragged = !!active && active.base === base && !active.pinned
      const effective = active && active.base === base ? active.width : base
      const rendered = measured.get(key)
      if (typeof effective !== 'number' || !rendered) {
        flexible = true
        if (effective == null && rendered) {
          floors.set(key, Math.max(rendered, sourceColumns[index]!.minWidth ?? 0))
        }
        continue
      }
      siblings.push({ key, effective, entry: { width: rendered, base, pinned: !dragged } })
      siblingsWidth += rendered
    }

    autoFloors.value = floors
    if (flexible) {
      return next
    }

    const room = options.getFillWidth() - pendingWidth - siblingsWidth
    const stretched = siblings.some(({ entry, effective }) => Math.abs(entry.width - effective) >= 0.5)
    if (!siblings.length || (room <= 0 && !stretched)) {
      return next
    }

    const scale = room > 0 ? (siblingsWidth + room) / siblingsWidth : 1
    siblings.forEach(({ key, entry }) => {
      // Round down so the sum never passes the fill width and overflows by a pixel.
      next.set(key, scale === 1 ? entry : { ...entry, width: Math.floor(entry.width * scale * 100) / 100 })
    })
    return next
  }

  /**
   * Minimum table width that keeps every column without a `width` at its
   * floor, or `undefined` when there is nothing to hold (no floors, or widths
   * that do not add up in pixels).
   */
  const minTableWidth = computed(() => {
    const floors = autoFloors.value
    if (!floors.size) {
      return undefined
    }
    const columns = options.flattenColumns.value
    const keys = getColumnsKey(columns)
    let total = 0
    for (let index = 0; index < columns.length; index += 1) {
      const { width } = columns[index]!
      if (typeof width === 'number') {
        total += width
      }
      else if (width == null) {
        total += floors.get(keys[index]!) ?? 0
      }
      else {
        return undefined
      }
    }
    return total
  })

  const sourceWidths = computed(() => {
    const columns = options.sourceFlattenColumns.value
    const keys = getColumnsKey(columns)
    return new Map(keys.map((key, index) => [key, columns[index]!.width] as const))
  })

  function releasePins() {
    const current = resizedWidths.value
    const next = new Map(current)
    current.forEach((entry, key) => {
      if (entry.pinned) {
        next.delete(key)
      }
    })
    if (next.size !== current.size) {
      resizedWidths.value = next
    }
  }

  // Once a source width changes, drop entries committed against the old one,
  // and release every pin unless the change is the controlled echo of the
  // last commit. Adding, removing or re-keying columns also releases pins.
  watch(sourceWidths, (nextWidths, prevWidths) => {
    const keysChanged = nextWidths.size !== prevWidths.size
      || [...nextWidths.keys()].some(key => !prevWidths.has(key))
    // Floors are keyed like widths, and position-based keys shift onto other
    // columns when columns are added or removed.
    if (keysChanged && autoFloors.value.size) {
      autoFloors.value = new Map()
    }

    const current = resizedWidths.value
    if (!current.size) {
      return
    }

    let changed = false
    let external = keysChanged
    nextWidths.forEach((width, key) => {
      if (prevWidths.has(key) && prevWidths.get(key) !== width) {
        changed = true
        external ||= lastCommit?.key !== key || lastCommit.width !== width
      }
    })
    if (!changed && !external) {
      return
    }

    const next = new Map(current)
    current.forEach((entry, key) => {
      if ((external && entry.pinned) || (nextWidths.has(key) && nextWidths.get(key) !== entry.base)) {
        next.delete(key)
      }
    })
    if (next.size !== current.size) {
      resizedWidths.value = next
    }
  })

  // Pinned widths were fitted to the fill width at commit time; once the table
  // is resized they would either leave a gap or force a horizontal scrollbar.
  watch(options.containerWidth, (width, prevWidth) => {
    if (width !== prevWidth) {
      releasePins()
    }
  })

  function cancelDrag() {
    if (dragState) {
      cleanupDrag()
    }
  }

  const startResize: StartColumnResize = (event, column, columnKey, headerCell) => {
    if (dragState || event.button !== 0) {
      return
    }

    // Stop the press from selecting text or reaching header listeners
    // (e.g. a sortable header) while still letting `click` decide later.
    event.preventDefault()
    event.stopPropagation()

    // Committed widths are whole pixels; rounding the start as well keeps a drag
    // that returns to where it began from committing a sub-pixel difference.
    const startWidth = Math.round(headerCell.getBoundingClientRect().width)
    dragState = {
      started: false,
      headerCell,
      column,
      columnKey,
      startClientX: event.clientX,
      startWidth,
      pendingWidth: startWidth,
      minWidth: column.minWidth ?? RESIZE_DEFAULT_MIN_WIDTH,
      rtl: options.direction.value === 'rtl',
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    window.addEventListener('blur', cancelDrag)
  }

  onBeforeUnmount(() => {
    clearClickSuppression()
    cancelDrag()
  })

  return {
    proxyRef,
    startResize,
    minTableWidth,
  }
}
