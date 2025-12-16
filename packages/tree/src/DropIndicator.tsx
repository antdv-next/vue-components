import { defineComponent } from 'vue'

export interface DropIndicatorProps {
  dropPosition: -1 | 0 | 1
  dropLevelOffset: number
  indent: number
}

const DropIndicator = defineComponent<DropIndicatorProps>(
  (props) => {
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
        default:
          style.bottom = 0
          style.left = props.indent
          break
      }

      return <div style={style} />
    }
  },
  {
    name: 'DropIndicator',
    inheritAttrs: false,
  },
)

export default DropIndicator

