import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import useTimeInfo from '../../hooks/useTimeInfo';
import { fillTime } from '../../utils/dateUtil';
import DatePanel from '../DatePanel';
import TimePanel from '../TimePanel';
import type { PanelMode } from '../../interface';

export default defineComponent({
  name: 'DateTimePanel',
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
    const generateConfig = computed(() => props.generateConfig);
    const showTime = computed(() => (typeof props.showTime === 'object' ? props.showTime : {}));

    const [getValidTime] = useTimeInfo(generateConfig, showTime);

    return () => {
      const { prefixCls, generateConfig, onSelect, value, pickerValue, onHover } = props;
      const panelPrefixCls = `${prefixCls}-datetime-panel`;

      const mergeTime = (date: any) => {
        if (value) {
          return fillTime(generateConfig, date, value);
        }
        return fillTime(generateConfig, date, pickerValue);
      };

      const onDateHover = (date: any) => {
        onHover?.(date ? mergeTime(date) : date);
      };

      const onDateSelect = (date: any) => {
        const cloneDate = mergeTime(date);
        onSelect(getValidTime(cloneDate, cloneDate));
      };

      return (
        <div class={panelPrefixCls}>
          <DatePanel {...props} onSelect={onDateSelect} onHover={onDateHover} />
          <TimePanel {...props} />
        </div>
      );
    };
  },
});
