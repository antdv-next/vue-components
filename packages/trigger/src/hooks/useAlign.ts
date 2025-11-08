import type { Ref } from 'vue'
import type { TriggerProps } from '../index.tsx'
import type {
  AlignPointLeftRight,
  AlignPointTopBottom,
  AlignType,
  OffsetType,
} from '../interface'
import { isDOM } from '@v-c/util/dist/Dom/findDOMNode'
import isVisible from '@v-c/util/dist/Dom/isVisible'
import { rafDebounce } from '@v-c/util/dist/raf'
import { computed, nextTick, ref, shallowRef, watch, watchEffect } from 'vue'
import { collectScroller, getVisibleArea, getWin, toNum } from '../util'

type Rect = Record<'x' | 'y' | 'width' | 'height', number>

type Points = [topBottom: AlignPointTopBottom, leftRight: AlignPointLeftRight]

function getUnitOffset(size: number, offset: OffsetType = 0) {
  const offsetStr = `${offset}`
  const cells = offsetStr.match(/^(.*)\%$/)
  if (cells) {
    return size * (parseFloat(cells[1]) / 100)
  }
  return parseFloat(offsetStr)
}

function getNumberOffset(
  rect: { width: number, height: number },
  offset?: OffsetType[],
) {
  const [offsetX, offsetY] = offset || []

  return [
    getUnitOffset(rect.width, offsetX),
    getUnitOffset(rect.height, offsetY),
  ]
}

function splitPoints(points: string = ''): Points {
  return [points[0] as any, points[1] as any]
}

function getAlignPoint(rect: Rect, points: Points) {
  const topBottom = points[0]
  const leftRight = points[1]

  let x: number
  let y: number

  // Top & Bottom
  if (topBottom === 't') {
    y = rect.y
  }
  else if (topBottom === 'b') {
    y = rect.y + rect.height
  }
  else {
    y = rect.y + rect.height / 2
  }

  // Left & Right
  if (leftRight === 'l') {
    x = rect.x
  }
  else if (leftRight === 'r') {
    x = rect.x + rect.width
  }
  else {
    x = rect.x + rect.width / 2
  }

  return { x, y }
}

function reversePoints(points: Points, index: number): string {
  const reverseMap = {
    t: 'b',
    b: 't',
    l: 'r',
    r: 'l',
  }

  return points
    .map((point, i) => {
      if (i === index) {
        return (reverseMap as any)[point] || 'c'
      }
      return point
    })
    .join('')
}

export default function useAlign(
  open: Ref<boolean>,
  popupEle: Ref<HTMLElement>,
  target: Ref<HTMLElement | [x: number, y: number]>,
  placement: Ref<string>,
  builtinPlacements: Ref<any>,
  popupAlign?: Ref<AlignType | undefined>,
  onPopupAlign?: TriggerProps['onPopupAlign'],
  mobile?: Ref<boolean | undefined>,
) {
  const offsetInfo = ref({
    ready: false,
    offsetX: 0,
    offsetY: 0,
    offsetR: 0,
    offsetB: 0,
    arrowX: 0,
    arrowY: 0,
    scaleX: 1,
    scaleY: 1,
    align: builtinPlacements.value[placement.value] || {},
  })

  const alignCountRef = shallowRef(0)
  const scrollerList = computed(() => {
    if (!popupEle.value || mobile?.value) {
      return []
    }
    return collectScroller(popupEle.value)
  })

  // ========================= Flip ==========================
  // We will memo flip info.
  // If size change to make flip, it will memo the flip info and use it in next align.
  const prevFlipRef = ref<{
    tb?: boolean
    bt?: boolean
    lr?: boolean
    rl?: boolean
  }>({})

  const resetFlipCache = () => {
    prevFlipRef.value = {}
  }

  // ========================= Align =========================
  const _onAlign = () => {
    if (popupEle.value && target.value && open.value && !mobile?.value) {
      const popupElement = popupEle.value

      const doc = popupElement.ownerDocument
      const win = getWin(popupElement)

      const { position: popupPosition } = win!.getComputedStyle(popupElement)

      const originLeft = popupElement.style.left
      const originTop = popupElement.style.top
      const originRight = popupElement.style.right
      const originBottom = popupElement.style.bottom
      const originOverflow = popupElement.style.overflow
      // Placement
      const placementInfo: AlignType = {
        ...builtinPlacements.value[placement.value],
        ...popupAlign?.value,
      }

      // placeholder element
      const placeholderElement = doc.createElement('div')
      popupElement.parentElement?.appendChild(placeholderElement)
      placeholderElement.style.left = `${popupElement.offsetLeft}px`
      placeholderElement.style.top = `${popupElement.offsetTop}px`
      placeholderElement.style.position = popupPosition
      placeholderElement.style.height = `${popupElement.offsetHeight}px`
      placeholderElement.style.width = `${popupElement.offsetWidth}px`

      // Reset first
      popupElement.style.left = '0'
      popupElement.style.top = '0'
      popupElement.style.right = 'auto'
      popupElement.style.bottom = 'auto'
      popupElement.style.overflow = 'hidden'

      // Calculate align style, we should consider `transform` case
      let targetRect: Rect
      if (Array.isArray(target.value)) {
        targetRect = {
          x: target.value[0],
          y: target.value[1],
          width: 0,
          height: 0,
        }
      }
      else {
        const rect = target.value.getBoundingClientRect()
        rect.x = rect.x ?? rect.left
        rect.y = rect.y ?? rect.top
        targetRect = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        }
      }
      const popupRect = popupElement.getBoundingClientRect()
      const { height, width } = win!.getComputedStyle(popupElement)
      popupRect.x = popupRect.x ?? popupRect.left
      popupRect.y = popupRect.y ?? popupRect.top
      const {
        clientWidth,
        clientHeight,
        scrollWidth,
        scrollHeight,
        scrollTop,
        scrollLeft,
      } = doc.documentElement

      const popupHeight = popupRect.height
      const popupWidth = popupRect.width

      const targetHeight = targetRect.height
      const targetWidth = targetRect.width

      // Get bounding of visible area
      const visibleRegion = {
        left: 0,
        top: 0,
        right: clientWidth,
        bottom: clientHeight,
      }

      const scrollRegion = {
        left: -scrollLeft,
        top: -scrollTop,
        right: scrollWidth - scrollLeft,
        bottom: scrollHeight - scrollTop,
      }

      let { htmlRegion } = placementInfo
      const VISIBLE = 'visible' as const
      const VISIBLE_FIRST = 'visibleFirst' as const
      if (htmlRegion !== 'scroll' && htmlRegion !== VISIBLE_FIRST) {
        htmlRegion = VISIBLE
      }
      const isVisibleFirst = htmlRegion === VISIBLE_FIRST

      const scrollRegionArea = getVisibleArea(scrollRegion, scrollerList.value)
      const visibleRegionArea = getVisibleArea(visibleRegion, scrollerList.value)

      const visibleArea = htmlRegion === VISIBLE ? visibleRegionArea : scrollRegionArea

      // When set to `visibleFirst`,
      // the check `adjust` logic will use `visibleRegion` for check first.
      const adjustCheckVisibleArea = isVisibleFirst
        ? visibleRegionArea
        : visibleArea

      // Record right & bottom align data
      popupElement.style.left = 'auto'
      popupElement.style.top = 'auto'
      popupElement.style.right = '0'
      popupElement.style.bottom = '0'

      const popupMirrorRect = popupElement.getBoundingClientRect()

      // Reset back
      popupElement.style.left = originLeft
      popupElement.style.top = originTop
      popupElement.style.right = originRight
      popupElement.style.bottom = originBottom
      popupElement.style.overflow = originOverflow

      popupElement.parentElement?.removeChild(placeholderElement)

      // Calculate scale
      const scaleX = toNum(
        Math.round((popupWidth / parseFloat(width)) * 1000) / 1000,
      )
      const scaleY = toNum(
        Math.round((popupHeight / parseFloat(height)) * 1000) / 1000,
      )

      // No need to align since it's not visible in view
      if (
        scaleX === 0
        || scaleY === 0
        || (isDOM(target) && !isVisible(target))
      ) {
        return
      }

      // Offset
      const { offset, targetOffset } = placementInfo
      let [popupOffsetX, popupOffsetY] = getNumberOffset(popupRect, offset)
      const [targetOffsetX, targetOffsetY] = getNumberOffset(
        targetRect,
        targetOffset,
      )

      targetRect.x -= targetOffsetX
      targetRect.y -= targetOffsetY

      // Points
      const [popupPoint, targetPoint] = placementInfo.points || []
      const targetPoints = splitPoints(targetPoint)
      const popupPoints = splitPoints(popupPoint)

      const targetAlignPoint = getAlignPoint(targetRect, targetPoints)
      const popupAlignPoint = getAlignPoint(popupRect, popupPoints)
      // Real align info may not same as origin one
      const nextAlignInfo = {
        ...placementInfo,
      }

      // Next Offset
      let nextOffsetX = targetAlignPoint.x - popupAlignPoint.x + popupOffsetX
      let nextOffsetY = targetAlignPoint.y - popupAlignPoint.y + popupOffsetY

      // ============== Intersection ===============
      // Get area by position. Used for check if flip area is better
      function getIntersectionVisibleArea(
        offsetX: number,
        offsetY: number,
        area = visibleArea,
      ) {
        const l = popupRect.x + offsetX
        const t = popupRect.y + offsetY

        const r = l + popupWidth
        const b = t + popupHeight

        const visibleL = Math.max(l, area.left)
        const visibleT = Math.max(t, area.top)
        const visibleR = Math.min(r, area.right)
        const visibleB = Math.min(b, area.bottom)

        return Math.max(0, (visibleR - visibleL) * (visibleB - visibleT))
      }

      const originIntersectionVisibleArea = getIntersectionVisibleArea(
        nextOffsetX,
        nextOffsetY,
      )

      // As `visibleFirst`, we prepare this for check
      const originIntersectionRecommendArea = getIntersectionVisibleArea(
        nextOffsetX,
        nextOffsetY,
        visibleRegionArea,
      )

      const shouldUseNewPosition = (
        newArea: number,
        newRecommendArea: number,
      ) => {
        if (newArea > originIntersectionVisibleArea) {
          return true
        }

        if (
          isVisibleFirst
          && newArea === originIntersectionVisibleArea
          && newRecommendArea >= originIntersectionRecommendArea
        ) {
          return true
        }

        return false
      }

      // ========================== Overflow ===========================
      const targetAlignPointTL = getAlignPoint(targetRect, ['t', 'l'])
      const popupAlignPointTL = getAlignPoint(popupRect, ['t', 'l'])
      const targetAlignPointBR = getAlignPoint(targetRect, ['b', 'r'])
      const popupAlignPointBR = getAlignPoint(popupRect, ['b', 'r'])

      const overflow = placementInfo.overflow || {}
      const { adjustX, adjustY, shiftX, shiftY } = overflow

      const supportAdjust = (val: boolean | number) => {
        if (typeof val === 'boolean') {
          return val
        }
        return val >= 0
      }

      // Prepare position
      let nextPopupY: number
      let nextPopupBottom: number
      let nextPopupX: number
      let nextPopupRight: number

      function syncNextPopupPosition() {
        nextPopupY = popupRect.y + nextOffsetY
        nextPopupBottom = nextPopupY + popupHeight
        nextPopupX = popupRect.x + nextOffsetX
        nextPopupRight = nextPopupX + popupWidth
      }
      syncNextPopupPosition()

      // >>>>>>>>>> Top & Bottom
      const needAdjustY = supportAdjust(adjustY!)

      const sameTB = popupPoints[0] === targetPoints[0]

      // Bottom to Top
      if (
        needAdjustY
        && popupPoints[0] === 't'
        && (nextPopupBottom! > adjustCheckVisibleArea.bottom
          || prevFlipRef.value.bt)
      ) {
        let tmpNextOffsetY: number = nextOffsetY

        if (sameTB) {
          tmpNextOffsetY -= popupHeight - targetHeight
        }
        else {
          tmpNextOffsetY = targetAlignPointTL.y - popupAlignPointBR.y - popupOffsetY
        }

        const newVisibleArea = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY,
        )
        const newVisibleRecommendArea = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY,
          visibleRegionArea,
        )

        if (shouldUseNewPosition(newVisibleArea, newVisibleRecommendArea)) {
          prevFlipRef.value.bt = true
          nextOffsetY = tmpNextOffsetY
          popupOffsetY = -popupOffsetY

          nextAlignInfo.points = [
            reversePoints(popupPoints, 0),
            reversePoints(targetPoints, 0),
          ]
        }
        else {
          prevFlipRef.value.bt = false
        }
      }

      // Top to Bottom
      if (
        needAdjustY
        && popupPoints[0] === 'b'
        && (nextPopupY! < adjustCheckVisibleArea.top || prevFlipRef.value.tb)
      ) {
        let tmpNextOffsetY: number = nextOffsetY

        if (sameTB) {
          tmpNextOffsetY += popupHeight - targetHeight
        }
        else {
          tmpNextOffsetY = targetAlignPointBR.y - popupAlignPointTL.y - popupOffsetY
        }

        const newVisibleArea = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY,
        )
        const newVisibleRecommendArea = getIntersectionVisibleArea(
          nextOffsetX,
          tmpNextOffsetY,
          visibleRegionArea,
        )

        if (shouldUseNewPosition(newVisibleArea, newVisibleRecommendArea)) {
          prevFlipRef.value.tb = true
          nextOffsetY = tmpNextOffsetY
          popupOffsetY = -popupOffsetY

          nextAlignInfo.points = [
            reversePoints(popupPoints, 0),
            reversePoints(targetPoints, 0),
          ]
        }
        else {
          prevFlipRef.value.tb = false
        }
      }

      // >>>>>>>>>> Left & Right
      const needAdjustX = supportAdjust(adjustX!)

      // >>>>> Flip
      const sameLR = popupPoints[1] === targetPoints[1]

      // Right to Left
      if (
        needAdjustX
        && popupPoints[1] === 'l'
        && (nextPopupRight! > adjustCheckVisibleArea.right
          || prevFlipRef.value.rl)
      ) {
        let tmpNextOffsetX: number = nextOffsetX

        if (sameLR) {
          tmpNextOffsetX -= popupWidth - targetWidth
        }
        else {
          tmpNextOffsetX = targetAlignPointTL.x - popupAlignPointBR.x - popupOffsetX
        }

        const newVisibleArea = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY,
        )
        const newVisibleRecommendArea = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY,
          visibleRegionArea,
        )

        if (shouldUseNewPosition(newVisibleArea, newVisibleRecommendArea)) {
          prevFlipRef.value.rl = true
          nextOffsetX = tmpNextOffsetX
          popupOffsetX = -popupOffsetX

          nextAlignInfo.points = [
            reversePoints(popupPoints, 1),
            reversePoints(targetPoints, 1),
          ]
        }
        else {
          prevFlipRef.value.rl = false
        }
      }

      // Left to Right
      if (
        needAdjustX
        && popupPoints[1] === 'r'
        && (nextPopupX! < adjustCheckVisibleArea.left || prevFlipRef.value.lr)
      ) {
        let tmpNextOffsetX: number = nextOffsetX

        if (sameLR) {
          tmpNextOffsetX += popupWidth - targetWidth
        }
        else {
          tmpNextOffsetX = targetAlignPointBR.x - popupAlignPointTL.x - popupOffsetX
        }

        const newVisibleArea = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY,
        )
        const newVisibleRecommendArea = getIntersectionVisibleArea(
          tmpNextOffsetX,
          nextOffsetY,
          visibleRegionArea,
        )

        if (shouldUseNewPosition(newVisibleArea, newVisibleRecommendArea)) {
          prevFlipRef.value.lr = true
          nextOffsetX = tmpNextOffsetX
          popupOffsetX = -popupOffsetX

          nextAlignInfo.points = [
            reversePoints(popupPoints, 1),
            reversePoints(targetPoints, 1),
          ]
        }
        else {
          prevFlipRef.value.lr = false
        }
      }

      // ============================ Shift ============================
      syncNextPopupPosition()

      const numShiftX = shiftX === true ? 0 : shiftX
      if (typeof numShiftX === 'number') {
        // Left
        if (nextPopupX! < visibleRegionArea.left) {
          nextOffsetX -= nextPopupX! - visibleRegionArea.left - popupOffsetX

          if (targetRect.x + targetWidth < visibleRegionArea.left + numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.left + targetWidth - numShiftX
          }
        }

        // Right
        if (nextPopupRight! > visibleRegionArea.right) {
          nextOffsetX -= nextPopupRight! - visibleRegionArea.right - popupOffsetX

          if (targetRect.x > visibleRegionArea.right - numShiftX) {
            nextOffsetX += targetRect.x - visibleRegionArea.right + numShiftX
          }
        }
      }

      const numShiftY = shiftY === true ? 0 : shiftY
      if (typeof numShiftY === 'number') {
        // Top
        if (nextPopupY! < visibleRegionArea.top) {
          nextOffsetY -= nextPopupY! - visibleRegionArea.top - popupOffsetY

          // When target if far away from visible area
          // Stop shift
          if (targetRect.y + targetHeight < visibleRegionArea.top + numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.top + targetHeight - numShiftY
          }
        }

        // Bottom
        if (nextPopupBottom! > visibleRegionArea.bottom) {
          nextOffsetY -= nextPopupBottom! - visibleRegionArea.bottom - popupOffsetY

          if (targetRect.y > visibleRegionArea.bottom - numShiftY) {
            nextOffsetY += targetRect.y - visibleRegionArea.bottom + numShiftY
          }
        }
      }

      // ============================ Arrow ============================
      // Arrow center align
      const popupLeft = popupRect.x + nextOffsetX
      const popupRight = popupLeft + popupWidth
      const popupTop = popupRect.y + nextOffsetY
      const popupBottom = popupTop + popupHeight

      const targetLeft = targetRect.x
      const targetRight = targetLeft + targetWidth
      const targetTop = targetRect.y
      const targetBottom = targetTop + targetHeight

      /** Max left of the popup and target element */
      const maxLeft = Math.max(popupLeft, targetLeft)
      /** Min right of the popup and target element */
      const minRight = Math.min(popupRight, targetRight)

      /** The center X of popup & target cross area */
      const xCenter = (maxLeft + minRight) / 2
      /** Arrow X of popup offset */
      const nextArrowX = xCenter - popupLeft

      const maxTop = Math.max(popupTop, targetTop)
      const minBottom = Math.min(popupBottom, targetBottom)

      const yCenter = (maxTop + minBottom) / 2
      const nextArrowY = yCenter - popupTop
      onPopupAlign?.(popupEle.value, nextAlignInfo)

      // Additional calculate right & bottom position
      let offsetX4Right = popupMirrorRect.right - popupRect.x - (nextOffsetX + popupRect.width)
      let offsetY4Bottom = popupMirrorRect.bottom - popupRect.y - (nextOffsetY + popupRect.height)

      if (scaleX === 1) {
        nextOffsetX = Math.round(nextOffsetX)
        offsetX4Right = Math.round(offsetX4Right)
      }

      if (scaleY === 1) {
        nextOffsetY = Math.round(nextOffsetY)
        offsetY4Bottom = Math.round(offsetY4Bottom)
      }

      const nextOffsetInfo = {
        ready: true,
        offsetX: nextOffsetX / scaleX,
        offsetY: nextOffsetY / scaleY,
        offsetR: offsetX4Right / scaleX,
        offsetB: offsetY4Bottom / scaleY,
        arrowX: nextArrowX / scaleX,
        arrowY: nextArrowY / scaleY,
        scaleX,
        scaleY,
        align: nextAlignInfo,
      }
      offsetInfo.value = nextOffsetInfo
    }
  }
  // 给onAlign添加一个requestAnimationFrame的效果，合并多次调用
  const onAlign = rafDebounce(_onAlign)

  const triggerAlign = () => {
    alignCountRef.value += 1
    const id = alignCountRef.value

    // Merge all align requirement into one frame
    Promise.resolve().then(() => {
      if (alignCountRef.value === id) {
        onAlign()
      }
    })
  }

  watch(
    popupEle,
    async (ele) => {
      if (ele && open.value && !mobile?.value) {
        await nextTick()
        triggerAlign()
      }
    },
  )

  // Reset ready status when placement & open changed
  const resetReady = () => {
    offsetInfo.value.ready = false
  }
  watch(placement, async () => {
    await nextTick()
    resetReady()
  })

  watchEffect(async () => {
    await nextTick()
    if (!open.value) {
      resetFlipCache()
      resetReady()
    }
  })

  return [
    computed(() => offsetInfo.value?.ready),
    computed(() => offsetInfo.value?.offsetX),
    computed(() => offsetInfo.value?.offsetY),
    computed(() => offsetInfo.value?.offsetR),
    computed(() => offsetInfo.value?.offsetB),
    computed(() => offsetInfo.value?.arrowX),
    computed(() => offsetInfo.value?.arrowY),
    computed(() => offsetInfo.value?.scaleX),
    computed(() => offsetInfo.value?.scaleY),
    computed(() => offsetInfo.value?.align),
    triggerAlign,
  ] as const
}
