import type { VNode } from 'vue'
import type { MenuMode } from '../interface'

import { defineComponent, ref, Transition, watch } from 'vue'
import MenuContextProvider, { useInjectMenu } from '../context/MenuContext'
import { getMotion } from '../utils/motionUtil'
import SubMenuList from './SubMenuList'

export interface InlineSubMenuListProps {
  id?: string
  open: boolean
  keyPath: string[]
  children: VNode
}

export default defineComponent({
  name: 'InlineSubMenuList',
  inheritAttrs: false,
  props: {
    id: String,
    open: Boolean,
    keyPath: Array,
  },
  emits: ['mouseEnter', 'mouseLeave', 'keyDown', 'click', 'focus'],
  setup(props, { slots }) {
    const fixedMode = ref<MenuMode>('inline')

    const { prefixCls, forceSubMenuRender, motion, defaultMotions, mode } = useInjectMenu()

    // Always use latest mode check
    const sameModeRef = ref(false)
    sameModeRef.value = mode === fixedMode.value

    // We record `destroy` mark here since when mode change from `inline` to others.
    // The inline list should remove when motion end.
    const destroy = ref(!sameModeRef.value)

    // ================================= Effect =================================
    // Reset destroy state when mode change back
    watch(mode, () => {
      if (sameModeRef.value) {
        destroy.value = false
      }
    }, { flush: 'post' })

    return () => {
      const mergedOpen = sameModeRef.value ? open : false

      // ================================= Render =================================
      const mergedMotion = { ...getMotion(fixedMode.value, motion, defaultMotions) }

      // No need appear since nest inlineCollapse changed
      if (props.keyPath!.length > 1) {
        mergedMotion.motionAppear = false
      }

      // Hide inline list when mode changed and motion end
      const originOnVisibleChanged = mergedMotion.onVisibleChanged
      mergedMotion.onVisibleChanged = (newVisible: unknown) => {
        if (!sameModeRef.value && !newVisible) {
          destroy.value = true
        }

        return originOnVisibleChanged?.(newVisible)
      }

      if (destroy) {
        return null
      }
      return (
        <MenuContextProvider mode={fixedMode.value} locked={!sameModeRef.value}>
          <Transition
            {...mergedMotion}
          >
            <SubMenuList v-show={mergedOpen} id={props.id}>
              {slots.default?.()}
            </SubMenuList>
          </Transition>
        </MenuContextProvider>
      )
    }
  },
})
