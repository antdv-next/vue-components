import type { VNodeChild } from 'vue'
import { clsx } from '@v-c/util'
import { cloneVNode, defineComponent, isVNode } from 'vue'
import { canGoNext } from './utils/innerSliderUtils'

interface ArrowProps {
  infinite?: boolean
  centerMode?: boolean
  currentSlide: number
  slideCount: number
  slidesToShow: number
  prevArrow?: VNodeChild
  nextArrow?: VNodeChild
  clickHandler?: (options: any, e?: MouseEvent) => void
}

const PrevArrow = defineComponent<ArrowProps>((props) => {
  const clickHandler = (options: any, e?: MouseEvent) => {
    e?.preventDefault()
    props.clickHandler?.(options, e)
  }

  return () => {
    const prevClasses: Record<string, boolean> = {
      'slick-arrow': true,
      'slick-prev': true,
    }
    let prevHandler: ((e: MouseEvent) => void) | undefined = (e) => {
      clickHandler({ message: 'previous' }, e)
    }

    if (
      !props.infinite
      && (props.currentSlide === 0 || props.slideCount <= props.slidesToShow)
    ) {
      prevClasses['slick-disabled'] = true
      prevHandler = undefined
    }

    const prevArrowProps = {
      'key': '0',
      'data-role': 'none',
      'class': clsx(prevClasses),
      'style': { display: 'block' },
      'onClick': prevHandler,
    }
    const customProps = {
      currentSlide: props.currentSlide,
      slideCount: props.slideCount,
    }

    if (props.prevArrow && isVNode(props.prevArrow)) {
      return cloneVNode(props.prevArrow, {
        ...prevArrowProps,
        ...customProps,
      })
    }

    return (
      <button type="button" {...prevArrowProps}>
        Previous
      </button>
    )
  }
})

const NextArrow = defineComponent<ArrowProps>((props) => {
  const clickHandler = (options: any, e?: MouseEvent) => {
    e?.preventDefault()
    props.clickHandler?.(options, e)
  }

  return () => {
    const nextClasses: Record<string, boolean> = {
      'slick-arrow': true,
      'slick-next': true,
    }
    let nextHandler: ((e: MouseEvent) => void) | undefined = (e) => {
      clickHandler({ message: 'next' }, e)
    }

    if (!canGoNext(props)) {
      nextClasses['slick-disabled'] = true
      nextHandler = undefined
    }

    const nextArrowProps = {
      'key': '1',
      'data-role': 'none',
      'class': clsx(nextClasses),
      'style': { display: 'block' },
      'onClick': nextHandler,
    }
    const customProps = {
      currentSlide: props.currentSlide,
      slideCount: props.slideCount,
    }

    if (props.nextArrow && isVNode(props.nextArrow)) {
      return cloneVNode(props.nextArrow, {
        ...nextArrowProps,
        ...customProps,
      })
    }

    return (
      <button type="button" {...nextArrowProps}>
        Next
      </button>
    )
  }
})

export { NextArrow, PrevArrow }
