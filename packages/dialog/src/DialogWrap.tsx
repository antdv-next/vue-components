import type { PortalProps } from '@v-c/portal'
import type { IDialogPropTypes } from './IDialogPropTypes'
import Portal from '@v-c/portal'
import { defineComponent, shallowRef, watch } from 'vue'
import { useRefProvide } from './context'
import Dialog from './Dialog'

// fix issue #10656
/*
 * getContainer remarks
 * Custom container should not be return, because in the Portal component, it will remove the
 * return container element here, if the custom container is the only child of it's component,
 * like issue #10656, It will has a conflict with removeChild method in react-dom.
 * So here should add a child (div element) to custom container.
 * */

const defaults = {
  getContainer: undefined,
  closeIcon: undefined,
  prefixCls: 'vc-dialog',
  // visible: true,
  keyboard: true,
  focusTriggerAfterClose: true,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnHidden: false,
  forceRender: false,
} as IDialogPropTypes
const DialogWrap = defineComponent<IDialogPropTypes>(
  (props = defaults, { slots }) => {
    const animatedVisible = shallowRef(false)
    useRefProvide(props)
    const onEsc: PortalProps['onEsc'] = ({ top, event }) => {
      const { keyboard = true } = props
      if (top && keyboard) {
        event.stopPropagation()
        props?.onClose?.(event)
      }
    }
    watch(
      () => props.visible,
      () => {
        if (props.visible) {
          animatedVisible.value = true
        }
      },
      {
        immediate: true,
      },
    )
    return () => {
      const {
        visible,
        getContainer,
        forceRender,
        destroyOnHidden = false,
        afterClose,
      } = props

      // Destroy on close will remove wrapped div
      if (!forceRender && destroyOnHidden && !animatedVisible.value) {
        return null
      }
      return (
        <Portal
          open={(visible || forceRender || animatedVisible.value)}
          autoDestroy={false}
          onEsc={onEsc}
          getContainer={getContainer}
          autoLock={(visible || animatedVisible.value)}
        >
          <Dialog
            {...props}
            v-slots={slots}
            destroyOnHidden={destroyOnHidden}
            afterClose={() => {
              afterClose?.()
              animatedVisible.value = false
            }}
          />
        </Portal>
      )
    }
  },
  {
    name: 'Dialog',
  },
)

export default DialogWrap
