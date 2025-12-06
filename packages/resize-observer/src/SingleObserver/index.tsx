import type { ResizeObserverProps, SizeInfo } from '../index.tsx'
import findDOMNode from '@v-c/util/dist/Dom/findDOMNode'
import { filterEmpty } from '@v-c/util/dist/props-util'
import {
  computed,
  createVNode,
  defineComponent,
  inject,
  isVNode,
  shallowRef,
  watch,
} from 'vue'
import { CollectionContext } from '../Collection'
import { observe, unobserve } from '../utils/observerUtil.ts'
import DomWrapper from './DomWrapper'

const SingleObserver = defineComponent<ResizeObserverProps>({
  name: 'SingleObserver',
  inheritAttrs: false,
  setup(props, { expose, slots }) {
    const elementRef = shallowRef<HTMLElement>()
    const wrapperRef = shallowRef()
    const setWrapperRef = (el: any) => {
      if (el?.elementEl && typeof el.elementEl === 'object') {
        elementRef.value = el.elementEl
      }
      else if (el?.__$el && typeof el.__$el === 'object') {
        elementRef.value = el.__$el
      }
      else {
        wrapperRef.value = el
      }
    }
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
    const disabled = computed(() => props.disabled)
    // 记录上一个元素
    watch(
      [wrapperRef, disabled],
      (_n, _o, onCleanup) => {
        if (disabled.value) {
          return
        }
        const currentElement = getDom() as HTMLElement
        if (currentElement) {
          observe(currentElement, onInternalResize as any)
        }
        onCleanup(() => {
          if (currentElement)
            unobserve(currentElement, onInternalResize as any)
        })
      },
    )
    expose({
      getDom,
    })
    return () => {
      const children = filterEmpty(slots?.default?.())
      if (children.length === 1 && isVNode(children[0])) {
        return createVNode(children[0], {
          ref: setWrapperRef,
        })
      }
      return (
        <DomWrapper ref={wrapperRef}>
          {slots.default?.()}
        </DomWrapper>
      )
    }
  },
})

export default SingleObserver
