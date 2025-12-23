import type { InnerSliderRef, SlickProps, SlickRef } from './interface'
import { toArray } from '@v-c/util/dist/Children/toArray'
import { filterEmpty } from '@v-c/util/dist/props-util'
import json2mq from 'json2mq'
import { cloneVNode, defineComponent, isVNode, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import defaultProps from './default-props'
import InnerSlider from './InnerSlider'
import { canUseDOM, filterSettings } from './utils/innerSliderUtils'

const Slider = defineComponent<SlickProps>((props, { slots, expose }) => {
  const breakpoint = shallowRef<number | null>(null)
  const innerSliderRef = shallowRef<InnerSliderRef | null>(null)
  const responsiveMediaHandlers: Array<{ mql: MediaQueryList, listener: (e: any) => void }> = []

  const media = (query: string, handler: () => void) => {
    if (!canUseDOM()) {
      return
    }
    const mql = window.matchMedia(query)
    const listener = (e: any) => {
      if (e.matches) {
        handler()
      }
    }
    if (mql.addEventListener) {
      mql.addEventListener('change', listener)
    }
    else {
      mql.addListener(listener)
    }
    responsiveMediaHandlers.push({ mql, listener })
  }

  onMounted(() => {
    if (props.responsive) {
      const breakpoints = props.responsive.map(breakpt => breakpt.breakpoint)
      breakpoints.sort((x, y) => x - y)

      breakpoints.forEach((value, index) => {
        let bQuery = ''
        if (index === 0) {
          bQuery = json2mq({ minWidth: 0, maxWidth: value })
        }
        else {
          bQuery = json2mq({
            minWidth: breakpoints[index - 1] + 1,
            maxWidth: value,
          })
        }
        canUseDOM() && media(bQuery, () => {
          breakpoint.value = value
        })
      })

      const query = json2mq({ minWidth: breakpoints.slice(-1)[0] })
      canUseDOM() && media(query, () => {
        breakpoint.value = null
      })
    }
  })

  onBeforeUnmount(() => {
    responsiveMediaHandlers.forEach((obj) => {
      if (obj.mql.removeEventListener) {
        obj.mql.removeEventListener('change', obj.listener)
      }
      else {
        obj.mql.removeListener(obj.listener)
      }
    })
  })

  const slickPrev = () => innerSliderRef.value?.slickPrev()
  const slickNext = () => innerSliderRef.value?.slickNext()
  const slickGoTo = (slide: number, dontAnimate = false) =>
    innerSliderRef.value?.slickGoTo(slide, dontAnimate)
  const slickPause = () => innerSliderRef.value?.pause('paused')
  const slickPlay = () => innerSliderRef.value?.autoPlay('play')

  expose<SlickRef>({
    innerSlider: innerSliderRef,
    slickPrev,
    slickNext,
    slickGoTo,
    slickPause,
    slickPlay,
  })

  return () => {
    let settings: any
    if (breakpoint.value && props.responsive) {
      const newProps = props.responsive.filter(
        resp => resp.breakpoint === breakpoint.value,
      )
      settings = newProps[0].settings === 'unslick'
        ? 'unslick'
        : { ...defaultProps, ...props, ...newProps[0].settings }
    }
    else {
      settings = { ...defaultProps, ...props }
    }

    if (settings.centerMode) {
      if (settings.slidesToScroll > 1 && process.env.NODE_ENV !== 'production') {
        console.warn(
          `slidesToScroll should be equal to 1 in centerMode, you are using ${settings.slidesToScroll}`,
        )
      }
      settings.slidesToScroll = 1
    }

    if (settings.fade) {
      if (settings.slidesToShow > 1 && process.env.NODE_ENV !== 'production') {
        console.warn(
          `slidesToShow should be equal to 1 when fade is true, you're using ${settings.slidesToShow}`,
        )
      }
      if (settings.slidesToScroll > 1 && process.env.NODE_ENV !== 'production') {
        console.warn(
          `slidesToScroll should be equal to 1 when fade is true, you're using ${settings.slidesToScroll}`,
        )
      }
      settings.slidesToShow = 1
      settings.slidesToScroll = 1
    }

    let children = filterEmpty(toArray(slots.default?.() ?? []))
    children = children.filter((child: any) => {
      if (typeof child === 'string') {
        return !!child.trim()
      }
      return !!child
    })

    if (settings.variableWidth && (settings.rows > 1 || settings.slidesPerRow > 1)) {
      console.warn(
        'variableWidth is not supported in case of rows > 1 or slidesPerRow > 1',
      )
      settings.variableWidth = false
    }

    const newChildren: any[] = []
    let currentWidth: any = null
    const rows = settings.rows || 1
    const slidesPerRow = settings.slidesPerRow || 1

    for (let i = 0; i < children.length; i += rows * slidesPerRow) {
      const newSlide: any[] = []
      for (let j = i; j < i + rows * slidesPerRow; j += slidesPerRow) {
        const row: any[] = []
        for (let k = j; k < j + slidesPerRow; k += 1) {
          if (k >= children.length) {
            break
          }
          const rawChild = children[k]
          const child = isVNode(rawChild) ? rawChild : <div>{rawChild}</div>
          if (settings.variableWidth && child.props?.style) {
            currentWidth = child.props.style.width
          }
          row.push(
            cloneVNode(child, {
              key: 100 * i + 10 * j + k,
              tabindex: -1,
              style: {
                width: `${100 / slidesPerRow}%`,
                display: 'inline-block',
              },
            }),
          )
        }
        newSlide.push(<div key={10 * i + j}>{row}</div>)
      }
      if (settings.variableWidth) {
        newChildren.push(
          <div key={i} style={{ width: currentWidth }}>
            {newSlide}
          </div>,
        )
      }
      else {
        newChildren.push(<div key={i}>{newSlide}</div>)
      }
    }

    if (settings === 'unslick') {
      const className = `regular slider ${props.className || ''}`
      return <div class={className}>{children}</div>
    }
    else if (newChildren.length <= settings.slidesToShow) {
      settings.unslick = true
    }

    return (
      <InnerSlider
        ref={innerSliderRef}
        style={props.style}
        {...filterSettings(settings)}
      >
        {newChildren}
      </InnerSlider>
    )
  }
})

export default Slider
