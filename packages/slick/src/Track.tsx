import type { TrackProps } from './interface'
import { clsx } from '@v-c/util'
import { cloneVNode, defineComponent, isVNode } from 'vue'
import {
  getPostClones,
  getPreClones,
  lazyEndIndex,
  lazyStartIndex,
} from './utils/innerSliderUtils'

function getSlideClasses(spec: TrackProps & { index: number }) {
  let slickActive = false
  let slickCenter = false
  let slickCloned = false
  let index = spec.index

  if (spec.rtl) {
    index = spec.slideCount - 1 - index
  }

  slickCloned = index < 0 || index >= spec.slideCount

  if (spec.centerMode) {
    const centerOffset = Math.floor(spec.slidesToShow / 2)
    slickCenter = (index - spec.currentSlide) % spec.slideCount === 0
    if (
      index > spec.currentSlide - centerOffset - 1
      && index <= spec.currentSlide + centerOffset
    ) {
      slickActive = true
    }
  }
  else {
    slickActive
      = spec.currentSlide <= index
        && index < spec.currentSlide + spec.slidesToShow
  }

  let focusedSlide = 0
  if (spec.targetSlide < 0) {
    focusedSlide = spec.targetSlide + spec.slideCount
  }
  else if (spec.targetSlide >= spec.slideCount) {
    focusedSlide = spec.targetSlide - spec.slideCount
  }
  else {
    focusedSlide = spec.targetSlide
  }
  const slickCurrent = index === focusedSlide
  return {
    'slick-slide': true,
    'slick-active': slickActive,
    'slick-center': slickCenter,
    'slick-cloned': slickCloned,
    'slick-current': slickCurrent,
  }
}

function getSlideStyle(spec: TrackProps & { index: number }) {
  const style: Record<string, any> = {}

  if (spec.variableWidth === undefined || spec.variableWidth === false) {
    style.width = spec.slideWidth
  }

  if (spec.fade) {
    style.position = 'relative'
    if (spec.vertical && spec.slideHeight) {
      style.top = -spec.index * parseInt(String(spec.slideHeight), 10)
    }
    else if (spec.slideWidth) {
      style.left = -spec.index * parseInt(String(spec.slideWidth), 10)
    }
    style.opacity = spec.currentSlide === spec.index ? 1 : 0
    style.zIndex = spec.currentSlide === spec.index ? 999 : 998
    if (spec.useCSS) {
      style.transition = `opacity ${spec.speed}ms ${spec.cssEase}, visibility ${spec.speed}ms ${spec.cssEase}`
    }
  }

  return style
}

function getKey(child: any, fallbackKey: number) {
  const childKey = child?.key ?? 'slick'
  return `${childKey}-${fallbackKey}`
}

function normalizeStyle(style: any) {
  if (!style) {
    return {}
  }
  if (Array.isArray(style)) {
    return Object.assign({}, ...style)
  }
  if (typeof style === 'object') {
    return style
  }
  return {}
}

function renderSlides(spec: TrackProps) {
  let key = 0
  const slides: any[] = []
  const preCloneSlides: any[] = []
  const postCloneSlides: any[] = []
  const childrenCount = Array.isArray(spec.children) ? spec.children.length : 0
  const startIndex = lazyStartIndex(spec)
  const endIndex = lazyEndIndex(spec)
  const children = Array.isArray(spec.children) ? spec.children : []

  children.forEach((elem, index) => {
    let child: any
    const childOnClickOptions = {
      message: 'children',
      index,
      slidesToScroll: spec.slidesToScroll,
      currentSlide: spec.currentSlide,
    }

    if (
      !spec.lazyLoad
      || (spec.lazyLoad && spec.lazyLoadedList.includes(index))
    ) {
      child = elem
    }
    else {
      child = <div />
    }
    const childStyle = getSlideStyle({ ...spec, index })
    const childProps = isVNode(child) ? child.props ?? {} : {}
    const slideClass = childProps?.class ?? ''
    const slideClasses = getSlideClasses({ ...spec, index })
    const clickHandler = (e: MouseEvent) => {
      childProps?.onClick?.(e)
      if (spec.focusOnSelect) {
        spec.focusOnSelect(childOnClickOptions)
      }
    }
    slides.push(
      cloneVNode(child, {
        'key': `original${getKey(child, index)}`,
        'data-index': index,
        'class': clsx(slideClasses, slideClass),
        'tabindex': -1,
        'aria-hidden': !slideClasses['slick-active'],
        'style': {
          outline: 'none',
          ...normalizeStyle(childProps?.style),
          ...childStyle,
        },
        'onClick': clickHandler,
      }),
    )

    if (
      spec.infinite
      && childrenCount > 1
      && spec.fade === false
      && !spec.unslick
    ) {
      const preCloneNo = childrenCount - index
      if (preCloneNo <= getPreClones(spec)) {
        key = -preCloneNo
        if (key >= startIndex) {
          child = elem
        }
        const preSlideClasses = getSlideClasses({ ...spec, index: key })
        preCloneSlides.push(
          cloneVNode(child, {
            'key': `precloned${getKey(child, key)}`,
            'data-index': key,
            'tabindex': -1,
            'class': clsx(preSlideClasses, slideClass),
            'aria-hidden': !preSlideClasses['slick-active'],
            'style': {
              ...normalizeStyle(childProps?.style),
              ...childStyle,
            },
            'onClick': clickHandler,
          }),
        )
      }
      if (index < getPostClones(spec)) {
        key = childrenCount + index
        if (key < endIndex) {
          child = elem
        }
        const postSlideClasses = getSlideClasses({ ...spec, index: key })
        postCloneSlides.push(
          cloneVNode(child, {
            'key': `postcloned${getKey(child, key)}`,
            'data-index': key,
            'tabindex': -1,
            'class': clsx(postSlideClasses, slideClass),
            'aria-hidden': !postSlideClasses['slick-active'],
            'style': {
              ...normalizeStyle(childProps?.style),
              ...childStyle,
            },
            'onClick': clickHandler,
          }),
        )
      }
    }
  })

  if (spec.rtl) {
    return preCloneSlides.concat(slides, postCloneSlides).reverse()
  }
  return preCloneSlides.concat(slides, postCloneSlides)
}

const Track = defineComponent<TrackProps>((props) => {
  const setRef = (el: any) => {
    if (props.nodeRef) {
      props.nodeRef.value = el
    }
  }

  return () => {
    const slides = renderSlides(props)
    return (
      <div
        ref={setRef}
        class="slick-track"
        style={props.trackStyle}
        onMouseenter={props.onMouseEnter}
        onMouseover={props.onMouseOver}
        onMouseleave={props.onMouseLeave}
      >
        {slides}
      </div>
    )
  }
})

export default Track
