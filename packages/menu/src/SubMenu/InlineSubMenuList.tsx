import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { MenuMode } from '../interface'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, shallowRef, Transition, watch, watchEffect } from 'vue'
import InheritableContextProvider, { useMenuContext } from '../context/MenuContext'
import { getMotion } from '../utils/motionUtil'
import SubMenuList from './SubMenuList'

export interface InlineSubMenuListProps {
  id?: string
  open: boolean
  keyPath: string[]
}

const InlineSubMenuList = defineComponent<InlineSubMenuListProps>(
  (props, { slots }) => {
    const fixedMode: MenuMode = 'inline'

    const menuContext = useMenuContext()
    // Always use latest mode check
    const sameModeRef = shallowRef(false)
    watchEffect(() => {
      sameModeRef.value = menuContext?.value?.mode === fixedMode
    })

    // We record `destroy` mark here since when mode change from `inline` to others.
    // The inline list should remove when motion end.
    const destroy = shallowRef(!sameModeRef.value)

    // ================================= Effect =================================
    // Reset destroy state when mode change back
    watch(
      () => menuContext?.value?.mode,
      () => {
        if (sameModeRef.value) {
          destroy.value = false
        }
      },
      {
        immediate: true,
      },
    )
    const mergedOpen = computed(() => sameModeRef.value ? props?.open : false)

    const mergedMotion = computed(() => {
      const { motion, defaultMotions } = menuContext?.value ?? {}

      const motionData = { ...getMotion(fixedMode, motion, defaultMotions) } as CSSMotionProps
      if (props.keyPath && props.keyPath.length > 1) {
        motionData.appear = false
      }
      // Hide inline list when mode changed and motion end
      const _onAfterLeave: any = motionData.onAfterLeave
      ;(motionData as any).onAfterLeave = (el: HTMLElement) => {
        if (!sameModeRef.value) {
          destroy.value = true
        }
        return _onAfterLeave?.(el)
      }
      return motionData
    })

    return () => {
      if (destroy.value) {
        return null
      }
      return (
        <InheritableContextProvider
          mode={fixedMode}
          locked={!sameModeRef.value}
        >
          <Transition
            {...getTransitionProps(mergedMotion.value?.name, mergedMotion.value)}
          >
            {mergedOpen.value && (
              <SubMenuList id={props.id}>
                {slots?.default?.()}
              </SubMenuList>
            )}
          </Transition>
        </InheritableContextProvider>
      )
    }
  },
  {
    name: 'InlineSubMenuList',
    inheritAttrs: false,
  },
)

export default InlineSubMenuList
