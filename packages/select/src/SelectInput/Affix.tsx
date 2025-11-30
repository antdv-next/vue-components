import { defineComponent } from 'vue'

export interface AffixProps {
  className?: any
  style?: any
  onMouseDown?: (e: MouseEvent) => void
}

export default defineComponent<AffixProps>((props, { slots }) => {
  return () => {
    const { children } = slots
    if (!children || !children().length) {
      return null
    }
    return (
      <div class={props.className} style={props.style} onMousedown={props.onMouseDown}>
        {children?.()}
      </div>
    )
  }
})
