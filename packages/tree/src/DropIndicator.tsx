import { defineComponent } from 'vue'

export interface DropIndicatorProps {
  dropPosition: -1 | 0 | 1
  dropLevelOffset: number
  indent: number
}

export default defineComponent<DropIndicatorProps>({
  name: 'DropIndicator',
  setup(props) {
    return () => {
      const style: any = {
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        backgroundColor: 'red',
        height: 2,
      }

      switch (props.dropPosition) {
        case -1:
          style.top = 0
          style.left = -props.dropLevelOffset * props.indent
          break
        case 1:
          style.bottom = 0
          style.left = -props.dropLevelOffset * props.indent
          break
        case 0:
          style.bottom = 0
          style.left = props.indent
          break
      }

      return <div style={style} />
    }
  },
})
