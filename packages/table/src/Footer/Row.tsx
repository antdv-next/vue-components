import type { CSSProperties } from 'vue'
import { defineComponent } from 'vue'

export interface FooterRowProps {
  className?: string
  style?: CSSProperties
  onClick?: (event: MouseEvent) => void
}

const FooterRow = defineComponent<FooterRowProps>({
  name: 'TableFooterRow',
  props: ['className', 'style', 'onClick'] as any,
  setup(props, { slots }) {
    return () => (
      <tr class={props.className} style={props.style} onClick={props.onClick}>
        {slots.default?.()}
      </tr>
    )
  },
})

export default FooterRow
