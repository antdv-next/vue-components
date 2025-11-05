import { classNames } from '@v-c/util'
import { getTransitionProps } from '@v-c/util/dist/utils/transition'
import { computed, defineComponent, ref, watch } from 'vue'
import { Transition } from 'vue'
import MenuContextProvider, { useMenuContext } from '../context/MenuContext'
import type { MenuMode } from '../interface'
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
    const context = useMenuContext()

    const sameMode = ref(context?.value?.mode === fixedMode)
    const destroy = ref(!sameMode.value)

    watch(
      () => context?.value?.mode,
      (mode) => {
        sameMode.value = mode === fixedMode
        if (sameMode.value) {
          destroy.value = false
        }
      },
      { immediate: true },
    )

    const mergedOpen = computed(() => (sameMode.value ? props.open : false))

    watch(
      () => mergedOpen.value,
      (open) => {
        if (!sameMode.value && !open) {
          destroy.value = true
        }
      },
      { immediate: true },
    )

    const menu = context?.value
    const prefixCls = computed(() => menu?.prefixCls ?? 'vc-menu')

    const transitionProps = computed(() => {
      const motion = getMotion(fixedMode, menu?.motion, menu?.defaultMotions) || {}
      const name = motion.name || `${prefixCls.value}-inline-collapse`
      const baseProps = getTransitionProps(name, motion as any)
      const originOnAfterLeave = baseProps.onAfterLeave
      baseProps.onAfterLeave = (el) => {
        if (Array.isArray(originOnAfterLeave)) {
          originOnAfterLeave.forEach(fn => fn?.(el))
        }
        else {
          originOnAfterLeave?.(el)
        }
        if (!sameMode.value) {
          destroy.value = true
        }
      }
      return baseProps
    })

    return () => {
      if (destroy.value) {
        return null
      }

      const hiddenCls = !mergedOpen.value ? `${prefixCls.value}-hidden` : ''
      const shouldRender = menu?.forceSubMenuRender || mergedOpen.value

      return (
        <MenuContextProvider mode={fixedMode} locked={!sameMode.value}>
          <Transition {...transitionProps.value}>
            {shouldRender
              ? (
                <SubMenuList
                  id={props.id}
                  class={classNames(hiddenCls)}
                  style={{
                    display: !mergedOpen.value && !menu?.forceSubMenuRender ? 'none' : undefined,
                  }}
                >
                  {slots.default?.()}
                </SubMenuList>
                )
              : null}
          </Transition>
        </MenuContextProvider>
      )
    }
  },
)

export default InlineSubMenuList
