import type { Ref } from 'vue'
import { computed, unref } from 'vue'
import canUseDom from '@v-c/util/dist/Dom/canUseDom'
import type { TableSticky } from '../interface'

const defaultContainer = canUseDom() ? window : null

export default function useSticky(
  sticky: Ref<boolean | TableSticky | undefined> | boolean | TableSticky | undefined,
  prefixCls: Ref<string> | string,
) {
  return computed(() => {
    const mergedSticky = unref(sticky)
    const mergedPrefixCls = unref(prefixCls)
    const {
      offsetHeader = 0,
      offsetSummary = 0,
      offsetScroll = 0,
      getContainer = () => defaultContainer,
    } = typeof mergedSticky === 'object' ? mergedSticky : {}

    const container = getContainer?.() || defaultContainer
    const isSticky = !!mergedSticky
    return {
      isSticky,
      stickyClassName: isSticky ? `${mergedPrefixCls}-sticky-holder` : '',
      offsetHeader,
      offsetSummary,
      offsetScroll,
      container,
    }
  })
}
