import type { PortalProps } from '@v-c/portal'
import type { Ref } from 'vue'
import Portal from '@v-c/portal'
import { defineComponent } from 'vue'

export interface PlaceholderProps
  extends Pick<PortalProps, 'open' | 'autoLock' | 'getContainer'> {
  domRef: Ref<HTMLDivElement>
  fallbackDOM: () => HTMLElement | null
}

const Placeholder = defineComponent<PlaceholderProps>(
  (props, { expose, attrs }) => {
    expose({
      getDom: () => {
        return props?.domRef.value ?? props?.fallbackDOM?.()
      },
    })
    return () => {
      const { open, autoLock, getContainer } = props
      return (
        <Portal open={open} autoLock={autoLock} getContainer={getContainer}>
          <div ref={props.domRef} {...attrs} />
        </Portal>
      )
    }
  },
  {
    name: 'TourPlaceholder',
    inheritAttrs: false,
  },
)

export default Placeholder
