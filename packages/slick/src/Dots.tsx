import type { VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { cloneVNode, defineComponent, isVNode } from 'vue'
import defaultProps from './default-props'
import { clamp } from './utils/innerSliderUtils'

interface DotsProps {
  dotsClass: string
  slideCount: number
  slidesToShow: number
  currentSlide: number
  slidesToScroll: number
  clickHandler?: (options: any, e?: MouseEvent) => void
  customPaging?: (index: number) => VNodeChild
  infinite?: boolean
  appendDots?: (dots: VNodeChild[]) => VNodeChild
  onMouseEnter?: (e: MouseEvent) => void
  onMouseOver?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
}

function getDotCount(spec: {
  slideCount: number
  slidesToScroll: number
  slidesToShow: number
  infinite?: boolean
}) {
  if (spec.infinite) {
    return Math.ceil(spec.slideCount / spec.slidesToScroll)
  }
  return Math.ceil((spec.slideCount - spec.slidesToShow) / spec.slidesToScroll) + 1
}

const Dots = defineComponent<DotsProps>((props) => {
  const getCustomPaging = props.customPaging
    ?? defaultProps.customPaging
    ?? ((index: number) => <button type="button">{index + 1}</button>)
  const appendDots = props.appendDots
    ?? defaultProps.appendDots
    ?? ((dots: VNodeChild[]) => <ul style={{ display: 'block' }}>{dots}</ul>)

  const clickHandler = (options: any, e?: MouseEvent) => {
    e?.preventDefault()
    props.clickHandler?.(options, e)
  }

  return () => {
    const {
      onMouseEnter,
      onMouseOver,
      onMouseLeave,
      infinite,
      slidesToScroll,
      slidesToShow,
      slideCount,
      currentSlide,
    } = props
    const dotCount = getDotCount({
      slideCount,
      slidesToScroll,
      slidesToShow,
      infinite,
    })

    const dots: VNodeChild[] = []
    for (let i = 0; i < dotCount; i += 1) {
      const _rightBound = (i + 1) * slidesToScroll - 1
      const rightBound = infinite
        ? _rightBound
        : clamp(_rightBound, 0, slideCount - 1)
      const _leftBound = rightBound - (slidesToScroll - 1)
      const leftBound = infinite
        ? _leftBound
        : clamp(_leftBound, 0, slideCount - 1)

      const className = clsx({
        'slick-active': infinite
          ? currentSlide >= leftBound && currentSlide <= rightBound
          : currentSlide === leftBound,
      })

      const dotOptions = {
        message: 'dots',
        index: i,
        slidesToScroll,
        currentSlide,
      }
      const onClick = (e: MouseEvent) => clickHandler(dotOptions, e)
      const paging = getCustomPaging(i)
      const content = isVNode(paging)
        ? cloneVNode(paging, { onClick })
        : (
            <button type="button" onClick={onClick}>
              {i + 1}
            </button>
          )

      dots.push(
        <li key={i} class={className}>
          {content}
        </li>,
      )
    }

    const dotsNode = appendDots(dots)
    if (isVNode(dotsNode)) {
      return cloneVNode(dotsNode, {
        class: props.dotsClass,
        onMouseenter: onMouseEnter,
        onMouseover: onMouseOver,
        onMouseleave: onMouseLeave,
      })
    }

    return dotsNode
  }
})

export default Dots
