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
  visible: true,
  keyboard: true,
  focusTriggerAfterClose: true,
  closable: true,
  mask: true,
  maskClosable: true,
  forceRender: false,
} as IDialogPropTypes
const DialogWrap = defineComponent<IDialogPropTypes>(
  (props = defaults, { slots }) => {
    const animatedVisible = shallowRef(false)
    const { setPanelRef } = useRefProvide()

    watch(
      () => props.panelRef,
      () => {
        setPanelRef(props.panelRef)
      },
      {
        immediate: true,
      },
    )

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
        destroyOnClose = false,
        afterClose,
      } = props

      // Destroy on close will remove wrapped div
      if (!forceRender && destroyOnClose && !animatedVisible) {
        return null
      }
      return (
        <Portal
          open={!!(visible || forceRender || animatedVisible)}
          autoDestroy={false}
          getContainer={getContainer}
          autoLock={!!(visible || animatedVisible)}
        >
          <Dialog
            {...props}
            v-slots={slots}
            destroyOnClose={destroyOnClose}
            afterClose={() => {
              afterClose?.()
              console.log('Sd')
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
