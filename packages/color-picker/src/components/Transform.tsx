import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Transform',
  inheritAttrs: false,
  props: {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  setup(props, { slots, expose }) {
    const transformDomRef = ref()

    expose({
      transformDomRef,
    })

    return () => {
      const { x, y } = props
      return (
        <div
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            zIndex: 1,
            transform: 'translate(-50%, -50%)',
          }}
          ref={transformDomRef}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
})
