import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { useInfo, providePanelContext } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';
import { formatValue } from '../../utils/dateUtil';
import type { PanelMode } from '../../interface';

export default defineComponent({
  name: 'QuarterPanel',
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
  },
  setup(props) {
    const panelContext = computed(() => {
      const [info] = useInfo(props, 'quarter');
      return info;
    });

    providePanelContext(panelContext);

    return () => {
      const {
        prefixCls,
        locale,
        generateConfig,
        pickerValue,
        onPickerValueChange,
        onModeChange,
      } = props;
      const panelPrefixCls = `${prefixCls}-quarter-panel`;

      const baseDate = generateConfig.setMonth(pickerValue, 0);

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addMonth(date, offset * 3);
      };

      const getCellText = (date: any) => {
        return formatValue(date, {
          locale,
          format: locale.cellQuarterFormat,
          generateConfig,
        });
      };

      const getCellClassName = () => ({
        [`${prefixCls}-cell-in-view`]: true,
      });

      const yearNode = (
        <button
          type="button"
          key="year"
          aria-label={locale.yearSelect}
          onClick={() => {
            onModeChange('year');
          }}
          tabindex={-1}
          class={`${prefixCls}-year-btn`}
        >
          {formatValue(pickerValue, {
            locale,
            format: locale.yearFormat,
            generateConfig,
          })}
        </button>
      );

      return (
        <div class={panelPrefixCls}>
          <PanelHeader
            superOffset={(distance: number, date: any) => generateConfig.addYear(date, distance)}
            onChange={onPickerValueChange}
            getStart={(date: any) => generateConfig.setMonth(date, 0)}
            getEnd={(date: any) => generateConfig.setMonth(date, 11)}
          >
            {yearNode}
          </PanelHeader>

          <PanelBody
            {...props}
            titleFormat={locale.fieldQuarterFormat}
            colNum={4}
            rowNum={1}
            baseDate={baseDate}
            getCellDate={getCellDate}
            getCellText={getCellText}
            getCellClassName={getCellClassName}
          />
        </div>
      );
    };
  },
});
