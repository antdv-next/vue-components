import type { ComputedRef } from 'vue'
import type {
  AutoPlayType,
  InnerSliderRef,
  InnerSliderState,
  PauseType,
  SlickProps,
} from './interface'
import { clsx } from '@v-c/util'
import { toArray } from '@v-c/util/dist/Children/toArray'
import { filterEmpty, getStylePxValue } from '@v-c/util/dist/props-util'
import { debounce } from 'es-toolkit'
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  reactive,
  shallowRef,
  watch,
} from 'vue'
import { NextArrow, PrevArrow } from './Arrows'
import defaultProps from './default-props'
import Dots from './Dots'
import initialState from './initial-state'
import Track from './Track'
import {
  canGoNext,
  changeSlide as changeSlideUtil,
  extractObject,
  getHeight,
  getOnDemandLazySlides,
  getPostClones,
  getPreClones,
  getTrackCSS,
  getTrackLeft,
  initializedState,
  keyHandler as keyHandlerUtil,
  slideHandler as slideHandlerUtil,
  swipeEnd as swipeEndUtil,
  swipeMove as swipeMoveUtil,
  swipeStart as swipeStartUtil,
} from './utils/innerSliderUtils'

const InnerSlider = defineComponent<SlickProps>(
  (props = defaultProps, { slots, expose }) => {
    const mergedProps = computed(() => ({ ...props })) as ComputedRef<Required<SlickProps>>
    const listRef = shallowRef<HTMLDivElement | null>(null)
    const trackRef = shallowRef<HTMLDivElement | null>(null)
    const callbackTimers: Array<ReturnType<typeof setTimeout>> = []
    let autoplayTimer: ReturnType<typeof setInterval> | null = null
    let lazyLoadTimer: ReturnType<typeof setInterval> | null = null
    let animationEndCallback: ReturnType<typeof setTimeout> | null = null
    let debouncedResize: any = null
    let ro: ResizeObserver | null = null
    let asNavForIndex: number | null = null
    let clickable = true

    let latestChildren: any[] = []
    let latestChildrenCount = 0
    let lastChildrenCount = 0

    const resolveChildren = () => {
      const rawChildren = slots?.default?.() || []
      const flattened = filterEmpty(toArray(rawChildren))
      return flattened.filter(child => child !== false)
    }

    const state = reactive<InnerSliderState>({
      ...initialState,
      currentSlide: mergedProps.value.initialSlide ?? 0,
      targetSlide: mergedProps.value.initialSlide ?? 0,
      slideCount: 0,
    })

    const setState = (nextState: Partial<InnerSliderState>, callback?: () => void) => {
      Object.assign(state, nextState)
      if (callback) {
        nextTick(callback)
      }
    }

    const getSpec = (extra?: Record<string, any>) => ({
      ...mergedProps.value,
      ...state,
      listRef: listRef.value,
      trackRef: trackRef.value,
      slideCount: latestChildrenCount,
      children: latestChildren,
      ...extra,
    })

    const adaptHeight = () => {
      if (!mergedProps.value.adaptiveHeight || !listRef.value) {
        return
      }
      const elem = listRef.value.querySelector(
        `[data-index="${state.currentSlide}"]`,
      ) as HTMLElement | null
      if (elem) {
        listRef.value.style.height = `${getHeight(elem)}px`
      }
    }

    const updateState = (
      spec: Record<string, any>,
      setTrackStyle: boolean,
      callback?: () => void,
    ) => {
      const updatedState = initializedState(spec) as Partial<InnerSliderState>
      const mergedSpec = { ...spec, ...updatedState, slideIndex: updatedState.currentSlide }
      const targetLeft = getTrackLeft(mergedSpec)
      const trackStyle = getTrackCSS({ ...mergedSpec, left: targetLeft })
      if (setTrackStyle) {
        updatedState.trackStyle = trackStyle
      }
      setState(updatedState, callback)
    }

    const ssrInit = () => {
      if (latestChildrenCount === 0) {
        return {}
      }
      if (mergedProps.value.variableWidth) {
        let trackWidth = 0
        let trackLeft = 0
        const childrenWidths: number[] = []
        const slideCount = latestChildrenCount
        const preClones = getPreClones({
          ...mergedProps.value,
          ...state,
          slideCount,
        })
        const postClones = getPostClones({
          ...mergedProps.value,
          ...state,
          slideCount,
        })

        latestChildren.forEach((child: any) => {
          const width = child?.props?.style?.width
          const widthValue = typeof width === 'number'
            ? width
            : Number.parseFloat(String(width)) || 0
          childrenWidths.push(widthValue)
          trackWidth += widthValue
        })

        for (let i = 0; i < preClones; i += 1) {
          trackLeft += childrenWidths[childrenWidths.length - 1 - i]
          trackWidth += childrenWidths[childrenWidths.length - 1 - i]
        }
        for (let i = 0; i < postClones; i += 1) {
          trackWidth += childrenWidths[i]
        }
        for (let i = 0; i < state.currentSlide; i += 1) {
          trackLeft += childrenWidths[i]
        }
        const trackStyle: Record<string, any> = {
          width: `${trackWidth}px`,
          left: `${-trackLeft}px`,
        }
        if (mergedProps.value.centerMode) {
          const currentWidth = `${childrenWidths[state.currentSlide]}px`
          trackStyle.left = `calc(${trackStyle.left} + (100% - ${currentWidth}) / 2 )`
        }
        return { trackStyle }
      }

      const slideCount = latestChildrenCount
      const spec = { ...mergedProps.value, ...state, slideCount }
      const totalSlideCount = getPreClones(spec) + getPostClones(spec) + slideCount
      const trackWidth = (100 / mergedProps.value.slidesToShow) * totalSlideCount
      const slideWidth = 100 / totalSlideCount
      let trackLeft = (-slideWidth * (getPreClones(spec) + state.currentSlide) * trackWidth) / 100
      if (mergedProps.value.centerMode) {
        trackLeft += (100 - (slideWidth * trackWidth) / 100) / 2
      }
      const trackStyle = {
        width: `${trackWidth}%`,
        left: `${trackLeft}%`,
      }
      return {
        slideWidth: `${slideWidth}%`,
        trackStyle,
      }
    }

    Object.assign(state, ssrInit())

    const checkImagesLoad = () => {
      const listNode = listRef.value
      if (!listNode || typeof document === 'undefined') {
        return
      }
      const images = listNode.querySelectorAll('.slick-slide img') || []
      const imagesCount = images.length
      let loadedCount = 0
      Array.prototype.forEach.call(images, (image: HTMLImageElement) => {
        const handler = () => {
          loadedCount += 1
          if (loadedCount >= imagesCount) {
            onWindowResized()
          }
        }
        if (!image.onclick) {
          image.onclick = () => image.parentElement?.focus()
        }
        else {
          const prevClickHandler = image.onclick
          image.onclick = (e) => {
          // @ts-expect-error this error
            prevClickHandler(e)
            image.parentElement?.focus()
          }
        }
        if (!image.onload) {
          if (mergedProps.value.lazyLoad) {
            image.onload = () => {
              adaptHeight()
              callbackTimers.push(
                setTimeout(onWindowResized, mergedProps.value.speed),
              )
            }
          }
          else {
            image.onload = handler
            image.onerror = () => {
              handler()
              mergedProps.value.onLazyLoadError?.()
            }
          }
        }
      })
    }

    const progressiveLazyLoad = () => {
      const slidesToLoad: number[] = []
      const spec = getSpec()
      for (
        let index = state.currentSlide;
        index < state.slideCount + getPostClones(spec);
        index += 1
      ) {
        if (!state.lazyLoadedList.includes(index)) {
          slidesToLoad.push(index)
          break
        }
      }
      for (
        let index = state.currentSlide - 1;
        index >= -getPreClones(spec);
        index -= 1
      ) {
        if (!state.lazyLoadedList.includes(index)) {
          slidesToLoad.push(index)
          break
        }
      }
      if (slidesToLoad.length > 0) {
        setState({
          lazyLoadedList: state.lazyLoadedList.concat(slidesToLoad),
        })
        mergedProps.value.onLazyLoad?.(slidesToLoad)
      }
      else if (lazyLoadTimer) {
        clearInterval(lazyLoadTimer)
        lazyLoadTimer = null
      }
    }

    const resolveInnerSlider = (nav: any): InnerSliderRef | null => {
      if (!nav) {
        return null
      }
      if (typeof nav.slideHandler === 'function') {
        return nav as InnerSliderRef
      }
      if (nav.innerSlider) {
        const inner = nav.innerSlider
        if (inner && typeof inner === 'object' && 'value' in inner) {
          return inner.value ?? null
        }
        return inner as InnerSliderRef
      }
      return null
    }

    const slideHandler = (index: number, dontAnimate = false) => {
      const { asNavFor, beforeChange, onLazyLoad, speed, afterChange } = mergedProps.value
      const currentSlide = state.currentSlide
      const { state: newState, nextState } = slideHandlerUtil({
        index,
        ...mergedProps.value,
        ...state,
        trackRef: trackRef.value,
        useCSS: mergedProps.value.useCSS && !dontAnimate,
      })
      if (!newState) {
        return
      }
      beforeChange?.(currentSlide, (newState as any).currentSlide)
      const slidesToLoad = (newState as any).lazyLoadedList?.filter(
        (value: number) => !state.lazyLoadedList.includes(value),
      ) ?? []
      if (onLazyLoad && slidesToLoad.length > 0) {
        onLazyLoad(slidesToLoad)
      }
      if (!mergedProps.value.waitForAnimate && animationEndCallback) {
        clearTimeout(animationEndCallback)
        animationEndCallback = null
        afterChange?.(currentSlide)
      }
      setState(newState as Partial<InnerSliderState>, () => {
        const navTarget = resolveInnerSlider(asNavFor)
        if (navTarget && asNavForIndex !== index) {
          asNavForIndex = index
          navTarget.slideHandler(index)
        }
        if (!nextState) {
          return
        }
        animationEndCallback = setTimeout(() => {
          const { animating, ...firstBatch } = nextState as Record<string, any>
          setState(firstBatch, () => {
            callbackTimers.push(setTimeout(() => setState({ animating }), 10))
            afterChange?.((newState as any).currentSlide)
            animationEndCallback = null
          })
        }, speed)
      })
    }

    const changeSlide = (options: any, dontAnimate = false) => {
      const targetSlide = changeSlideUtil(getSpec(), options)
      if (targetSlide !== 0 && !targetSlide) {
        return
      }
      if (dontAnimate === true) {
        slideHandler(targetSlide, dontAnimate)
      }
      else {
        slideHandler(targetSlide)
      }
      if (mergedProps.value.autoplay) {
        autoPlay('update')
      }
      if (mergedProps.value.focusOnSelect && listRef.value) {
        const nodes = listRef.value.querySelectorAll('.slick-current')
        const target = nodes?.[0] as HTMLElement | undefined
        target?.focus()
      }
    }

    const clickHandler = (e: MouseEvent) => {
      if (clickable === false) {
        e.stopPropagation()
        e.preventDefault()
      }
      clickable = true
    }

    const keyHandler = (e: KeyboardEvent) => {
      const dir = keyHandlerUtil(e, mergedProps.value.accessibility, mergedProps.value.rtl)
      if (dir !== '') {
        changeSlide({ message: dir })
      }
    }

    const selectHandler = (options: any) => {
      changeSlide(options)
    }

    const disableBodyScroll = () => {
      if (typeof window === 'undefined') {
        return
      }
      const preventDefault = (event: Event) => {
        event.preventDefault()
      }
      window.ontouchmove = preventDefault
    }

    const enableBodyScroll = () => {
      if (typeof window === 'undefined') {
        return
      }
      window.ontouchmove = null
    }

    const swipeStart = (e: MouseEvent | TouchEvent) => {
      if (mergedProps.value.verticalSwiping) {
        disableBodyScroll()
      }
      const swipeState = swipeStartUtil(
        e,
        mergedProps.value.swipe,
        mergedProps.value.draggable,
      )
      if (swipeState !== '') {
        setState(swipeState)
      }
    }

    const swipeMove = (e: MouseEvent | TouchEvent) => {
      const swipeState = swipeMoveUtil(e, {
        ...mergedProps.value,
        ...state,
        trackRef: trackRef.value,
        listRef: listRef.value,
        slideIndex: state.currentSlide,
      })
      if (!swipeState) {
        return
      }
      if (swipeState.swiping) {
        clickable = false
      }
      setState(swipeState)
    }

    const swipeEnd = (e: MouseEvent | TouchEvent) => {
      const swipeState = swipeEndUtil(e, {
        ...mergedProps.value,
        ...state,
        trackRef: trackRef.value,
        listRef: listRef.value,
        slideIndex: state.currentSlide,
      })
      if (!swipeState) {
        return
      }
      const triggerSlideHandler = (swipeState as any).triggerSlideHandler
      delete (swipeState as any).triggerSlideHandler
      setState(swipeState)
      if (triggerSlideHandler === undefined) {
        return
      }
      slideHandler(triggerSlideHandler)
      if (mergedProps.value.verticalSwiping) {
        enableBodyScroll()
      }
    }

    const touchEnd = (e: TouchEvent) => {
      swipeEnd(e)
      clickable = true
    }

    const slickPrev = () => {
      callbackTimers.push(setTimeout(() => changeSlide({ message: 'previous' }), 0))
    }

    const slickNext = () => {
      callbackTimers.push(setTimeout(() => changeSlide({ message: 'next' }), 0))
    }

    const slickGoTo = (slide: number, dontAnimate = false) => {
      const target = Number(slide)
      if (Number.isNaN(target)) {
        return
      }
      callbackTimers.push(
        setTimeout(
          () => changeSlide(
            {
              message: 'index',
              index: target,
              currentSlide: state.currentSlide,
            },
            dontAnimate,
          ),
          0,
        ),
      )
    }

    const play = () => {
      let nextIndex = 0
      if (mergedProps.value.rtl) {
        nextIndex = state.currentSlide - mergedProps.value.slidesToScroll
      }
      else if (canGoNext({ ...mergedProps.value, ...state })) {
        nextIndex = state.currentSlide + mergedProps.value.slidesToScroll
      }
      else {
        return false
      }
      slideHandler(nextIndex)
      return true
    }

    function autoPlay(playType: AutoPlayType) {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
      }
      const autoplaying = state.autoplaying
      if (playType === 'update') {
        if (
          autoplaying === 'hovered'
          || autoplaying === 'focused'
          || autoplaying === 'paused'
        ) {
          return
        }
      }
      else if (playType === 'leave') {
        if (autoplaying === 'paused' || autoplaying === 'focused') {
          return
        }
      }
      else if (playType === 'blur') {
        if (autoplaying === 'paused' || autoplaying === 'hovered') {
          return
        }
      }
      autoplayTimer = setInterval(play, mergedProps.value.autoplaySpeed + 50)
      setState({ autoplaying: 'playing' })
    }

    const pause = (pauseType: PauseType) => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
      }
      const autoplaying = state.autoplaying
      if (pauseType === 'paused') {
        setState({ autoplaying: 'paused' })
      }
      else if (pauseType === 'focused') {
        if (autoplaying === 'hovered' || autoplaying === 'playing') {
          setState({ autoplaying: 'focused' })
        }
      }
      else if (autoplaying === 'playing') {
        setState({ autoplaying: 'hovered' })
      }
    }

    const onDotsOver = () => mergedProps.value.autoplay && pause('hovered')
    const onDotsLeave = () => mergedProps.value.autoplay
      && state.autoplaying === 'hovered'
      && autoPlay('leave')
    const onTrackOver = () => mergedProps.value.autoplay && pause('hovered')
    const onTrackLeave = () => mergedProps.value.autoplay
      && state.autoplaying === 'hovered'
      && autoPlay('leave')
    const onSlideFocus = () => mergedProps.value.autoplay && pause('focused')
    const onSlideBlur = () => mergedProps.value.autoplay
      && state.autoplaying === 'focused'
      && autoPlay('blur')

    function onWindowResized(setTrackStyle?: boolean) {
      if (debouncedResize?.cancel) {
        debouncedResize.cancel()
      }
      debouncedResize = debounce(() => resizeWindow(setTrackStyle), 50)
      debouncedResize()
    }

    function resizeWindow(setTrackStyle = true) {
      const isTrackMounted = Boolean(trackRef.value)
      if (!isTrackMounted) {
        return
      }
      const spec = getSpec()
      updateState(spec, setTrackStyle, () => {
        if (mergedProps.value.autoplay) {
          autoPlay('update')
        }
        else {
          pause('paused')
        }
      })
      setState({ animating: false })
      if (animationEndCallback) {
        clearTimeout(animationEndCallback)
        animationEndCallback = null
      }
    }

    const didPropsChange = (
      prevProps: SlickProps,
      nextProps: SlickProps,
      prevChildren: number,
      nextChildren: number,
    ) => {
      let setTrackStyle = false
      for (const key of Object.keys(nextProps)) {
        if (!Object.prototype.hasOwnProperty.call(prevProps, key)) {
          setTrackStyle = true
          break
        }
        const prevValue = (prevProps as any)[key]
        if (
          typeof prevValue === 'object'
          || typeof prevValue === 'function'
          || Number.isNaN(prevValue)
        ) {
          continue
        }
        if (prevValue !== (nextProps as any)[key]) {
          setTrackStyle = true
          break
        }
      }
      return setTrackStyle || prevChildren !== nextChildren
    }

    onMounted(() => {
      lastChildrenCount = latestChildrenCount
      mergedProps.value.onInit?.()
      if (mergedProps.value.lazyLoad) {
        const slidesToLoad = getOnDemandLazySlides(getSpec())
        if (slidesToLoad.length > 0) {
          setState({
            lazyLoadedList: state.lazyLoadedList.concat(slidesToLoad),
          })
          mergedProps.value.onLazyLoad?.(slidesToLoad)
        }
      }
      updateState(getSpec(), true, () => {
        adaptHeight()
        if (mergedProps.value.autoplay) {
          autoPlay('playing')
        }
      })
      if (mergedProps.value.lazyLoad === 'progressive') {
        lazyLoadTimer = setInterval(progressiveLazyLoad, 1000)
      }
      if (typeof ResizeObserver !== 'undefined' && listRef.value) {
        ro = new ResizeObserver(() => {
          if (state.animating) {
            onWindowResized(false)
            callbackTimers.push(
              setTimeout(() => onWindowResized(), mergedProps.value.speed),
            )
          }
          else {
            onWindowResized()
          }
        })
        ro.observe(listRef.value)
      }
      if (typeof document !== 'undefined') {
        const slides = document.querySelectorAll('.slick-slide')
        Array.prototype.forEach.call(slides, (slide: HTMLElement) => {
          slide.onfocus = mergedProps.value.pauseOnFocus ? onSlideFocus : null
          slide.onblur = mergedProps.value.pauseOnFocus ? onSlideBlur : null
        })
      }
      if (typeof window !== 'undefined') {
        if (window.addEventListener) {
          window.addEventListener('resize', onWindowResized as any)
        }
        else if ((window as any).attachEvent) {
          (window as any).attachEvent('onresize', onWindowResized)
        }
      }
    })

    const handlePropsOrChildrenChange = (
      prevProps: SlickProps,
      nextProps: SlickProps,
      prevCount: number,
      nextCount: number,
    ) => {
      if (!prevProps) {
        return
      }
      checkImagesLoad()
      mergedProps.value.onReInit?.()
      if (mergedProps.value.lazyLoad) {
        const slidesToLoad = getOnDemandLazySlides(getSpec())
        if (slidesToLoad.length > 0) {
          setState({
            lazyLoadedList: state.lazyLoadedList.concat(slidesToLoad),
          })
          mergedProps.value.onLazyLoad?.(slidesToLoad)
        }
      }
      adaptHeight()
      const setTrackStyle = didPropsChange(
        prevProps as SlickProps,
        nextProps as SlickProps,
        prevCount as number,
        nextCount as number,
      )
      if (setTrackStyle) {
        updateState(getSpec(), setTrackStyle, () => {
          if (state.currentSlide >= latestChildrenCount) {
            changeSlide({
              message: 'index',
              index: latestChildrenCount - mergedProps.value.slidesToShow,
              currentSlide: state.currentSlide,
            })
          }
          if (
            (prevProps as SlickProps).autoplay !== mergedProps.value.autoplay
            || (prevProps as SlickProps).autoplaySpeed !== mergedProps.value.autoplaySpeed
          ) {
            if (!(prevProps as SlickProps).autoplay && mergedProps.value.autoplay) {
              autoPlay('playing')
            }
            else if (mergedProps.value.autoplay) {
              autoPlay('update')
            }
            else {
              pause('paused')
            }
          }
        })
      }
    }

    watch(mergedProps, (nextProps, prevProps) => {
      if (prevProps) {
        handlePropsOrChildrenChange(
          prevProps as SlickProps,
          nextProps as SlickProps,
          lastChildrenCount,
          latestChildrenCount,
        )
        lastChildrenCount = latestChildrenCount
      }
    }, { flush: 'post' })

    onUpdated(() => {
      if (latestChildrenCount !== lastChildrenCount) {
        handlePropsOrChildrenChange(
          mergedProps.value,
          mergedProps.value,
          lastChildrenCount,
          latestChildrenCount,
        )
        lastChildrenCount = latestChildrenCount
      }
    })

    onBeforeUnmount(() => {
      if (animationEndCallback) {
        clearTimeout(animationEndCallback)
      }
      if (lazyLoadTimer) {
        clearInterval(lazyLoadTimer)
      }
      if (callbackTimers.length) {
        callbackTimers.forEach(timer => clearTimeout(timer))
        callbackTimers.length = 0
      }
      if (typeof window !== 'undefined') {
        if (window.removeEventListener) {
          window.removeEventListener('resize', onWindowResized as any)
        }
        else if ((window as any).detachEvent) {
          (window as any).detachEvent('onresize', onWindowResized)
        }
      }
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
      }
      ro?.disconnect()
    })

    expose<InnerSliderRef>({
      slickPrev,
      slickNext,
      slickGoTo,
      autoPlay,
      pause,
      play,
      slideHandler,
      changeSlide,
    })

    return () => {
      const renderChildren = resolveChildren()
      latestChildren = renderChildren
      latestChildrenCount = renderChildren.length
      const className = clsx('slick-slider', mergedProps.value.className, {
        'slick-vertical': mergedProps.value.vertical,
        'slick-initialized': true,
      })
      const spec = {
        ...mergedProps.value,
        ...state,
        slideCount: latestChildrenCount,
        children: renderChildren,
      }
      let trackProps = extractObject(spec, [
        'fade',
        'cssEase',
        'speed',
        'infinite',
        'centerMode',
        'focusOnSelect',
        'currentSlide',
        'lazyLoad',
        'lazyLoadedList',
        'rtl',
        'slideWidth',
        'slideHeight',
        'listHeight',
        'vertical',
        'slidesToShow',
        'slidesToScroll',
        'slideCount',
        'trackStyle',
        'variableWidth',
        'unslick',
        'centerPadding',
        'targetSlide',
        'useCSS',
      ]) as Record<string, any>
      const { pauseOnHover } = mergedProps.value
      trackProps = {
        ...trackProps,
        onMouseEnter: pauseOnHover ? onTrackOver : undefined,
        onMouseLeave: pauseOnHover ? onTrackLeave : undefined,
        onMouseOver: pauseOnHover ? onTrackOver : undefined,
        focusOnSelect: mergedProps.value.focusOnSelect && clickable
          ? selectHandler
          : undefined,
        children: renderChildren,
        nodeRef: trackRef,
      }

      let dots: any
      if (mergedProps.value.dots === true && latestChildrenCount >= mergedProps.value.slidesToShow) {
        let dotProps = extractObject(spec, [
          'dotsClass',
          'slideCount',
          'slidesToShow',
          'currentSlide',
          'slidesToScroll',
          'customPaging',
          'infinite',
          'appendDots',
        ]) as Record<string, any>
        const { pauseOnDotsHover } = mergedProps.value
        dotProps = {
          ...dotProps,
          clickHandler: changeSlide,
          onMouseEnter: pauseOnDotsHover ? onDotsLeave : undefined,
          onMouseOver: pauseOnDotsHover ? onDotsOver : undefined,
          onMouseLeave: pauseOnDotsHover ? onDotsLeave : undefined,
        }
        dots = <Dots {...dotProps as any} />
      }

      let prevArrow: any
      let nextArrow: any
      const arrowProps = extractObject(spec, [
        'infinite',
        'centerMode',
        'currentSlide',
        'slideCount',
        'slidesToShow',
        'prevArrow',
        'nextArrow',
      ]) as Record<string, any>
      arrowProps.clickHandler = changeSlide
      if (mergedProps.value.arrows) {
        prevArrow = <PrevArrow {...arrowProps as any} />
        nextArrow = <NextArrow {...arrowProps as any} />
      }

      let verticalHeightStyle: Record<string, any> | null = null
      if (mergedProps.value.vertical) {
        verticalHeightStyle = { height: getStylePxValue(state.listHeight) }
      }

      let centerPaddingStyle: Record<string, any> | null = null
      if (mergedProps.value.vertical === false) {
        if (mergedProps.value.centerMode === true) {
          centerPaddingStyle = {
            padding: `0px ${mergedProps.value.centerPadding}`,
          }
        }
      }
      else if (mergedProps.value.centerMode === true) {
        centerPaddingStyle = {
          padding: `${mergedProps.value.centerPadding} 0px`,
        }
      }

      const listStyle = {
        ...verticalHeightStyle,
        ...centerPaddingStyle,
      }
      const touchMove = mergedProps.value.touchMove
      let listProps: Record<string, any> = {
        class: 'slick-list',
        style: listStyle,
        onClick: clickHandler,
        onMousedown: touchMove ? swipeStart : undefined,
        onMousemove: state.dragging && touchMove ? swipeMove : undefined,
        onMouseup: touchMove ? swipeEnd : undefined,
        onMouseleave: state.dragging && touchMove ? swipeEnd : undefined,
        onTouchstart: touchMove ? swipeStart : undefined,
        onTouchmove: state.dragging && touchMove ? swipeMove : undefined,
        onTouchend: touchMove ? touchEnd : undefined,
        onTouchcancel: state.dragging && touchMove ? swipeEnd : undefined,
        onKeydown: mergedProps.value.accessibility ? keyHandler : undefined,
      }

      let innerSliderProps: Record<string, any> = {
        class: className,
        dir: 'ltr',
        style: mergedProps.value.style,
      }

      if (mergedProps.value.unslick) {
        listProps = { class: 'slick-list' }
        innerSliderProps = { class: className, style: mergedProps.value.style }
      }

      return (
        <div {...innerSliderProps}>
          {!mergedProps.value.unslick ? prevArrow : ''}
          <div ref={listRef} {...listProps}>
            <Track {...trackProps as any} />
          </div>
          {!mergedProps.value.unslick ? nextArrow : ''}
          {!mergedProps.value.unslick ? dots : ''}
        </div>
      )
    }
  },
)

export default InnerSlider
