import type { SharedPanelProps } from '../../interface'
import { omit } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import useTimeInfo from '../../hooks/useTimeInfo'
import { fillTime } from '../../utils/dateUtil'
import DatePanel from '../DatePanel'
import TimePanel from '../TimePanel'

const DateTimePanel = defineComponent<SharedPanelProps>(
  (props) => {
    const generateConfig = computed(() => props.generateConfig!)
    const showTime = computed(() => (typeof props.showTime === 'object' ? props.showTime : {}))

    const [getValidTime] = useTimeInfo(generateConfig as any, showTime)

    return () => {
      const { prefixCls, generateConfig, onSelect, value, pickerValue, onHover } = props
      const panelPrefixCls = `${prefixCls}-datetime-panel`

      const mergeTime = (date: any) => {
        if (value) {
          return fillTime(generateConfig as any, date, value)
        }
        return fillTime(generateConfig as any, date, pickerValue)
      }

      const onDateHover = (date: any) => {
        onHover?.(date ? mergeTime(date) : date)
      }

      const onDateSelect = (date: any) => {
        const cloneDate = mergeTime(date)
        onSelect?.(getValidTime(cloneDate, cloneDate))
      }

      const datePanelProps = {
        ...omit(props, ['onSelect', 'onHover']),
        onSelect: onDateSelect,
        onHover: onDateHover,
      }
      return (
        <div class={panelPrefixCls}>
          <DatePanel {...datePanelProps} />
          <TimePanel {...props} />
        </div>
      )
    }
  },
  {
    name: 'DateTimePanel',
    inheritAttrs: false,
  },
)

export default DateTimePanel
