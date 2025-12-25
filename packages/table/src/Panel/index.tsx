import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TablePanel',
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    return () => (
      <div class={attrs.class as string} style={attrs.style as any}>
        {slots.default?.()}
      </div>
    )
  },
})
