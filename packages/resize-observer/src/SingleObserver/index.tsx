import type { ResizeObserverProps, SizeInfo } from '../index.tsx'
import findDOMNode from '@v-c/util/dist/Dom/findDOMNode'
import { defineComponent, inject, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { CollectionContext } from '../Collection'
import { observe, unobserve } from '../utils/observerUtil.ts'
import DomWrapper from './DomWrapper'

const SingleObserver = defineComponent<ResizeObserverProps>({
  name: 'SingleObserver',
  inheritAttrs: false,
  setup(props, { expose, slots }) {
    const elementRef = shallowRef<HTMLElement>()
    const wrapperRef = shallowRef()
    const onCollectionResize = inject(CollectionContext, () => {})
    const sizeRef = shallowRef<SizeInfo>({ width: -1, height: -1, offsetWidth: -1, offsetHeight: -1 })
    const getDom = () => {
      const dom = findDOMNode(elementRef as any)
        || (elementRef.value && typeof elementRef.value === 'object' ? findDOMNode((elementRef.value as any).nativeElement) : null)
        || findDOMNode(wrapperRef.value)
      // 判断当前的dom是不是一个text元素
      if (dom && dom.nodeType === 3 && dom.nextElementSibling)
        return dom.nextElementSibling as HTMLElement
      return dom
    }

    const onInternalResize = (target: HTMLElement) => {
      const { onResize, data } = props
      const { width, height } = target.getBoundingClientRect()
      const { offsetHeight, offsetWidth } = target
      /**
       * Resize observer trigger when content size changed.
       * In most case we just care about element size,
       * let's use `boundary` instead of `contentRect` here to avoid shaking.
       */
      const fixedWidth = Math.floor(width)
      const fixedHeight = Math.floor(height)
      if (
        sizeRef.value.width !== fixedWidth
        || sizeRef.value.height !== fixedHeight
        || sizeRef.value.offsetWidth !== offsetWidth
        || sizeRef.value.offsetHeight !== offsetHeight
      ) {
        const size = { width: fixedWidth, height: fixedHeight, offsetWidth, offsetHeight }
        sizeRef.value = size

        // IE is strange, right?
        const mergedOffsetWidth = offsetWidth === Math.round(width) ? width : offsetWidth
        const mergedOffsetHeight = offsetHeight === Math.round(height) ? height : offsetHeight

        const sizeInfo = {
          ...size,
          offsetWidth: mergedOffsetWidth,
          offsetHeight: mergedOffsetHeight,
        }

        // Let collection know what happened
        onCollectionResize?.(sizeInfo, target, data)

        if (onResize) {
          // defer the callback but not defer to next frame
          Promise.resolve().then(() => {
            onResize(sizeInfo, target)
          })
        }
      }
    }
    let currentElement: HTMLElement
    onMounted(() => {
      currentElement = getDom() as HTMLElement
      if (currentElement && !props.disabled)
        observe(currentElement, onInternalResize as any)
    })

    onBeforeUnmount(() => {
      if (currentElement)
        unobserve(currentElement, onInternalResize as any)
    })
    expose({
      getDom,
    })
    return () => {
      return (
        <DomWrapper ref={wrapperRef}>
          {slots.default?.()}
        </DomWrapper>
      )
    }
  },
})

export default SingleObserver
