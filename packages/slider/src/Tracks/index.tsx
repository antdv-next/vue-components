import type { CSSProperties, PropType } from 'vue'
import type { OnStartMove } from '../interface'
import { classNames as cls } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { useInjectSlider } from '../context'
import { getIndex } from '../util'
import Track from './Track'

export interface TrackProps {
  prefixCls: string
  style?: CSSProperties | CSSProperties[]
  values: number[]
  onStartMove?: OnStartMove
  startPoint?: number
}

const Tracks = defineComponent({
  name: 'Tracks',
  props: {
    prefixCls: { type: String, required: true },
    trackStyle: { type: [Object, Array] as PropType<CSSProperties | CSSProperties[]> },
    values: { type: Array as PropType<number[]>, required: true },
    onStartMove: { type: Function as PropType<OnStartMove> },
    startPoint: { type: Number },
  },
  setup(props) {
    const sliderContext = useInjectSlider()

    // =========================== List ===========================
    const trackList = computed(() => {
      const range = sliderContext.value.range
      const min = sliderContext.value.min
      if (!range) {
        // null value do not have track
        if (props.values.length === 0) {
          return []
        }

        const startValue = props.startPoint ?? min
        const endValue = props.values[0]

        return [{ start: Math.min(startValue, endValue), end: Math.max(startValue, endValue) }]
      }

      // Multiple
      const list: { start: number, end: number }[] = []

      for (let i = 0; i < props.values.length - 1; i += 1) {
        list.push({ start: props.values[i], end: props.values[i + 1] })
      }

      return list
    })

    return () => {
      const included = sliderContext.value.included
      if (!included) {
        return null
      }
      const { classNames, styles, isHandleDisabled } = sliderContext.value

      // rc-slider#1069: any disabled handle locks the whole track-drag path,
      // since dragging the track moves every handle in lock-step and we cannot
      // honour the disabled-anchor semantics there.
      const hasDisabledHandle = props.values.some((_, index) => isHandleDisabled(index))
      const trackOnStartMove = hasDisabledHandle ? undefined : props.onStartMove

      // ========================== Render ==========================
      const tracksNode
        = trackList.value?.length && (classNames.tracks || styles.tracks)
          ? (
              <Track
                index={0}
                prefixCls={props.prefixCls}
                start={trackList.value[0].start}
                end={trackList.value[trackList.value.length - 1].end}
                replaceCls={cls(classNames.tracks, `${props.prefixCls}-tracks`)}
                style={styles.tracks}
              />
            )
          : null
      return (
        <>
          {tracksNode}
          {trackList.value.map(({ start, end }, index) => (
            <Track
              index={index}
              prefixCls={props.prefixCls}
              style={{ ...getIndex(props.trackStyle, index), ...styles?.track }}
              start={start}
              end={end}
              key={index}
              onStartMove={trackOnStartMove}
            />
          ))}
        </>
      )
    }
  },
})

export default Tracks
