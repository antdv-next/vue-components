import type { SharedPanelProps } from '../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { formatValue } from '../../utils/dateUtil'
import { providePanelContext, useInfo } from '../context'
import PanelHeader from '../PanelHeader'
import TimePanelBody from './TimePanelBody'

const TimePanel = defineComponent<SharedPanelProps<any>>(
  (props) => {
    const panelContext = computed(() => {
      const [info] = useInfo(props as any, 'time')
      return info
    })

    providePanelContext(panelContext)

    return () => {
      const { prefixCls, value, locale, generateConfig, showTime } = props

      const format = typeof showTime === 'object' && showTime.format
        ? showTime.format
        : (locale?.fieldTimeFormat || 'HH:mm:ss')
      const panelPrefixCls = `${prefixCls}-time-panel`

      return (
        <div class={clsx(panelPrefixCls)}>
          <PanelHeader>
            {value ? formatValue(value, { locale: locale!, format, generateConfig: generateConfig! }) : '\u00A0'}
          </PanelHeader>
          <TimePanelBody {...(typeof showTime === 'object' ? showTime : {})} />
        </div>
      )
    }
  },
  {
    name: 'TimePanel',
    inheritAttrs: false,
  },
)

export default TimePanel
