import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import classNames from 'classnames';
import { useInfo, providePanelContext } from '../context';
import PanelHeader from '../PanelHeader';
import TimePanelBody from './TimePanelBody';
import { formatValue } from '../../utils/dateUtil';
import type { PanelMode } from '../../interface';

export default defineComponent({
  name: 'TimePanel',
  inheritAttrs: false,
  props: {
    prefixCls: String,
    locale: Object as PropType<any>,
    generateConfig: Object as PropType<any>,
    pickerValue: Object as PropType<any>,
    onPickerValueChange: Function as PropType<(date: any) => void>,
    onModeChange: Function as PropType<(mode: PanelMode, date?: any) => void>,
    disabledDate: Function as PropType<any>,
    onSelect: Function as PropType<(date: any) => void>,
    onHover: Function as PropType<(date: any) => void>,
    minDate: Object as PropType<any>,
    maxDate: Object as PropType<any>,
    cellRender: Function as PropType<any>,
    hoverRangeValue: Array as PropType<any>,
    hoverValue: Array as PropType<any>,
    values: Array as PropType<any>,
    showTime: [Boolean, Object] as PropType<any>,
    prevIcon: Object as PropType<any>,
    nextIcon: Object as PropType<any>,
    superPrevIcon: Object as PropType<any>,
    superNextIcon: Object as PropType<any>,
    value: Object as PropType<any>,
  },
  setup(props) {
    const panelContext = computed(() => {
      const [info] = useInfo(props, 'time');
      return info;
    });

    providePanelContext(panelContext);

    return () => {
      const { prefixCls, value, locale, generateConfig, showTime } = props;
      const format = typeof showTime === 'object' ? showTime.format : undefined;
      const panelPrefixCls = `${prefixCls}-time-panel`;

      return (
        <div class={classNames(panelPrefixCls)}>
          <PanelHeader>
            {value ? formatValue(value, { locale, format, generateConfig }) : '\u00A0'}
          </PanelHeader>
          <TimePanelBody {...(typeof showTime === 'object' ? showTime : {})} />
        </div>
      );
    };
  },
});
