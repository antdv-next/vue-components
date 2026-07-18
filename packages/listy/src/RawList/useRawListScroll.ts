import type { Ref } from 'vue'
import type { ListyRef, ScrollAlign } from '../interface'
import { toTaggedKey } from '../util'

export default function useRawListScroll(
  ref: Ref,
  prefixCls: string,
  stickyGroup: boolean,
) {
  // =============================== Refs ===============================
  const holderRef = ref

  // ============================== Utils ===============================
  const getStickyHeaderHeight = (targetElement: HTMLElement) => {
    if (!stickyGroup) {
      return 0
    }

    const groupSection = targetElement.closest<HTMLElement>(
      `.${CSS.escape(`${prefixCls}-group-section`)}`,
    )
    const groupHeader = groupSection?.querySelector<HTMLElement>(
      `.${CSS.escape(`${prefixCls}-group-header`)}`,
    )

    if (!groupHeader) {
      return 0
    }

    const rect = groupHeader.getBoundingClientRect()
    const height
      = rect.height || rect.bottom - rect.top || groupHeader.offsetHeight

    return Number.isFinite(height) ? height : 0
  }

  const scrollTargetIntoView = (
    targetElement: HTMLElement,
    align: ScrollAlign,
    offset: number,
    isItem: boolean,
  ) => {
    const headerOffset
      = isItem && align !== 'bottom' ? getStickyHeaderHeight(targetElement) : 0

    const prevTop = targetElement.style.scrollMarginTop
    const prevBottom = targetElement.style.scrollMarginBottom

    targetElement.style.scrollMarginTop = `${headerOffset + offset}px`
    targetElement.style.scrollMarginBottom = `${offset}px`

    targetElement.scrollIntoView({
      block:
          align === 'bottom' ? 'end' : align === 'auto' ? 'nearest' : 'start',
      inline: 'nearest',
    })

    targetElement.style.scrollMarginTop = prevTop
    targetElement.style.scrollMarginBottom = prevBottom
  }

  // ============================== Scroll ==============================
  const scrollTo: ListyRef['scrollTo'] = (config: any) => {
    const holder = holderRef.value
    if (!holder || config == null) {
      return
    }

    if (typeof config === 'number') {
      holder.scrollTop = config
      return
    }

    if ('key' in config || 'groupKey' in config) {
      const { align = 'auto', offset = 0 } = config
      const isItem = 'key' in config
      const targetKey = isItem
        ? toTaggedKey(config.key, 'item')
        : toTaggedKey(config.groupKey, 'group')
      const targetElement = holder.querySelector(
        `[data-key="${CSS.escape(targetKey)}"]`,
      )

      if (targetElement) {
        scrollTargetIntoView(targetElement, align, offset, isItem)
      }
      return
    }

    const { left, top } = config
    if (left !== undefined) {
      holder.scrollLeft = left
    }
    if (top !== undefined) {
      holder.scrollTop = top
    }
  }

  // ============================ Imperative ============================
  // use expose

  // ============================== Return ==============================
  return scrollTo
}
