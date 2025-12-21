import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { useInfo, providePanelContext } from '../context';
import PanelBody from '../PanelBody';
import PanelHeader from '../PanelHeader';
import { formatValue, isInRange, isSameDecade } from '../../utils/dateUtil';
import type { DisabledDate, PanelMode } from '../../interface';

export default defineComponent({
  name: 'DecadePanel',
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
      const [info] = useInfo(props, 'decade');
      return info;
    });

    providePanelContext(panelContext);

    return () => {
      const {
        prefixCls,
        locale,
        generateConfig,
        pickerValue,
        disabledDate,
        onPickerValueChange,
      } = props;
      const panelPrefixCls = `${prefixCls}-decade-panel`;

      const getStartYear = (date: any) => {
        const startYear = Math.floor(generateConfig.getYear(date) / 100) * 100;
        return generateConfig.setYear(date, startYear);
      };
      const getEndYear = (date: any) => {
        const startYear = getStartYear(date);
        return generateConfig.addYear(startYear, 99);
      };

      const startYearDate = getStartYear(pickerValue);
      const endYearDate = getEndYear(pickerValue);

      const baseDate = generateConfig.addYear(startYearDate, -10);

      const getCellDate = (date: any, offset: number) => {
        return generateConfig.addYear(date, offset * 10);
      };

      const getCellText = (date: any) => {
        const cellYearFormat = locale.cellYearFormat;
        const startYearStr = formatValue(date, {
          locale,
          format: cellYearFormat,
          generateConfig,
        });
        const endYearStr = formatValue(generateConfig.addYear(date, 9), {
          locale,
          format: cellYearFormat,
          generateConfig,
        });
        return `${startYearStr}-${endYearStr}`;
      };

      const getCellClassName = (date: any) => {
        return {
          [`${prefixCls}-cell-in-view`]:
            isSameDecade(generateConfig, date, startYearDate) ||
            isSameDecade(generateConfig, date, endYearDate) ||
            isInRange(generateConfig, startYearDate, endYearDate, date),
        };
      };

      const mergedDisabledDate: DisabledDate<any> | undefined = disabledDate
        ? (currentDate, disabledInfo) => {
            const baseStartDate = generateConfig.setDate(currentDate, 1);
            const baseStartMonth = generateConfig.setMonth(baseStartDate, 0);
            const baseStartYear = generateConfig.setYear(
              baseStartMonth,
              Math.floor(generateConfig.getYear(baseStartMonth) / 10) * 10,
            );
            const baseEndYear = generateConfig.addYear(baseStartYear, 10);
            const baseEndDate = generateConfig.addDate(baseEndYear, -1);
            return disabledDate(baseStartYear, disabledInfo) && disabledDate(baseEndDate, disabledInfo);
          }
        : undefined;

      const yearNode = `${formatValue(startYearDate, {
        locale,
        format: locale.yearFormat,
        generateConfig,
      })}-${formatValue(endYearDate, {
        locale,
        format: locale.yearFormat,
        generateConfig,
      })}`;

      return (
        <div class={panelPrefixCls}>
          <PanelHeader
            superOffset={(distance: number, date: any) =>
              generateConfig.addYear(date, distance * 100)
            }
            onChange={onPickerValueChange}
            getStart={getStartYear}
            getEnd={getEndYear}
          >
            {yearNode}
          </PanelHeader>

          <PanelBody
            {...props}
            disabledDate={mergedDisabledDate}
            colNum={3}
            rowNum={4}
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
