import type { DefaultPanelProps } from './DefaultPanel.tsx'
import { defineComponent } from 'vue'
import DefaultPanel from './DefaultPanel.tsx'

const TourStep = defineComponent<DefaultPanelProps>(
  (props, { attrs }) => {
    return () => {
      const { current, renderPanel } = props
      return (
        <>
          {
            typeof renderPanel === 'function'
              ? (renderPanel({ ...props, ...attrs }, current!))
              : (<DefaultPanel {...props} />)
          }
        </>
      )
    }
  },
  {
    name: 'TourStep',
    inheritAttrs: false,
  },
)

export default TourStep
