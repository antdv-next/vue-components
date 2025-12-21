import { defineComponent, computed, ref } from 'vue';
import type { PropType } from 'vue';
import classNames from 'classnames';
import useTimeInfo from '../../../hooks/useTimeInfo';
import { formatValue } from '../../../utils/dateUtil';
import { usePanelContext, usePickerHackContext } from '../../context';
import TimeColumn, { type Unit } from './TimeColumn';
import type { SharedTimeProps } from '../../../interface';

function isAM(hour: number) {
  return hour < 12;
}

export default defineComponent({
  name: 'TimePanelBody',
  inheritAttrs: false,
  props: {
    showHour: Boolean,
    showMinute: Boolean,
    showSecond: Boolean,
    showMillisecond: Boolean,
    use12Hours: Boolean,
    changeOnScroll: Boolean,
    format: String,
    showNow: Boolean,
    hourStep: Number,
    minuteStep: Number,
    secondStep: Number,
    millisecondStep: Number,
    hideDisabledOptions: Boolean,
    defaultValue: Object,
    defaultOpenValue: Object,
    disabledHours: Function,
    disabledMinutes: Function,
    disabledSeconds: Function,
    disabledTime: Function,
  },
  setup(props) {
    const context = usePanelContext();
    const pickerHackContext = usePickerHackContext();

    const value = computed(() => context.value.values?.[0] || null);
    const generateConfig = computed(() => context.value.generateConfig);

    const [getValidTime, rowHourUnits, getMinuteUnits, getSecondUnits, getMillisecondUnits] = useTimeInfo(
      generateConfig,
      computed(() => props),
      value
    );

    const getUnitValue = (func: 'getHour' | 'getMinute' | 'getSecond' | 'getMillisecond') => {
      const val = value.value;
      const pickerVal = context.value.pickerValue;
      const valueUnitVal = val && generateConfig.value[func](val);
      const pickerUnitValue = pickerVal && generateConfig.value[func](pickerVal);
      return [valueUnitVal, pickerUnitValue] as const;
    };

    return () => {
      const {
        prefixCls,
        classNames: panelClassNames,
        styles,
        locale,
        onSelect,
        onHover,
      } = context.value;

      const { showHour, showMinute, showSecond, showMillisecond, use12Hours: showMeridiem, changeOnScroll } = props;
      const { onCellDblClick } = pickerHackContext?.value || {};

      const [hour, pickerHour] = getUnitValue('getHour');
      const [minute, pickerMinute] = getUnitValue('getMinute');
      const [second, pickerSecond] = getUnitValue('getSecond');
      const [millisecond, pickerMillisecond] = getUnitValue('getMillisecond');
      const meridiem = hour === null ? null : isAM(hour as number) ? 'am' : 'pm';

      // Hours
      const hourUnits = (() => {
        if (!showMeridiem) {
          return rowHourUnits.value;
        }
        return isAM(hour as number)
          ? rowHourUnits.value.filter((h) => isAM(h.value as number))
          : rowHourUnits.value.filter((h) => !isAM(h.value as number));
      })();

      const getEnabled = (units: Unit<number>[], val: number | null | undefined) => {
        const enabledUnits = units.filter((unit) => !unit.disabled);
        return val ?? enabledUnits?.[0]?.value;
      };

      // Minutes
      const validHour = getEnabled(rowHourUnits.value, hour as number);
      const minuteUnits = getMinuteUnits(validHour);

      // Seconds
      const validMinute = getEnabled(minuteUnits, minute as number);
      const secondUnits = getSecondUnits(validHour, validMinute);

      // Milliseconds
      const validSecond = getEnabled(secondUnits, second as number);
      const millisecondUnits = getMillisecondUnits(validHour, validMinute, validSecond);
      
      const validMillisecond = getEnabled(millisecondUnits, millisecond as number);

      // Meridiem
      const meridiemUnits = (() => {
        if (!showMeridiem) {
          return [];
        }
        const base = generateConfig.value.getNow();
        const amDate = generateConfig.value.setHour(base, 6);
        const pmDate = generateConfig.value.setHour(base, 18);

        const formatMeridiem = (date: any, defaultLabel: string) => {
          const { cellMeridiemFormat } = locale;
          return cellMeridiemFormat
            ? formatValue(date, {
                generateConfig: generateConfig.value,
                locale,
                format: cellMeridiemFormat,
              })
            : defaultLabel;
        };

        return [
          {
            label: formatMeridiem(amDate, 'AM'),
            value: 'am',
            disabled: rowHourUnits.value.every((h) => h.disabled || !isAM(h.value as number)),
          },
          {
            label: formatMeridiem(pmDate, 'PM'),
            value: 'pm',
            disabled: rowHourUnits.value.every((h) => h.disabled || isAM(h.value as number)),
          },
        ];
      })();

      // Change
      const triggerChange = (nextDate: any) => {
        const validateDate = getValidTime(nextDate);
        onSelect(validateDate);
      };

      const triggerDateTmpl = (() => {
        let tmpl = value.value || context.value.pickerValue || generateConfig.value.getNow();
        const isNotNull = (num: any) => num !== null && num !== undefined;

        if (isNotNull(hour)) {
           tmpl = generateConfig.value.setHour(tmpl, hour!);
           tmpl = generateConfig.value.setMinute(tmpl, minute!);
           tmpl = generateConfig.value.setSecond(tmpl, second!);
           tmpl = generateConfig.value.setMillisecond(tmpl, millisecond!);
        } else if (isNotNull(pickerHour)) {
           tmpl = generateConfig.value.setHour(tmpl, pickerHour!);
           tmpl = generateConfig.value.setMinute(tmpl, pickerMinute!);
           tmpl = generateConfig.value.setSecond(tmpl, pickerSecond!);
           tmpl = generateConfig.value.setMillisecond(tmpl, pickerMillisecond!);
        } else if (isNotNull(validHour)) {
           tmpl = generateConfig.value.setHour(tmpl, validHour);
           tmpl = generateConfig.value.setMinute(tmpl, validMinute);
           tmpl = generateConfig.value.setSecond(tmpl, validSecond);
           tmpl = generateConfig.value.setMillisecond(tmpl, validMillisecond);
        }
        return tmpl;
      })();

      const fillColumnValue = (
        val: number | string,
        func: 'setHour' | 'setMinute' | 'setSecond' | 'setMillisecond',
      ) => {
        if (val === null) {
          return null;
        }
        return generateConfig.value[func](triggerDateTmpl, val as any);
      };

      const getNextHourTime = (val: number) => fillColumnValue(val, 'setHour');
      const getNextMinuteTime = (val: number) => fillColumnValue(val, 'setMinute');
      const getNextSecondTime = (val: number) => fillColumnValue(val, 'setSecond');
      const getNextMillisecondTime = (val: number) => fillColumnValue(val, 'setMillisecond');
      const getMeridiemTime = (val: string) => {
        if (val === null) {
          return null;
        }
        if (val === 'am' && !isAM(hour as number)) {
          return generateConfig.value.setHour(triggerDateTmpl, (hour as number) - 12);
        } else if (val === 'pm' && isAM(hour as number)) {
          return generateConfig.value.setHour(triggerDateTmpl, (hour as number) + 12);
        }
        return triggerDateTmpl;
      };

      const onHourChange = (val: number | string) => {
        triggerChange(getNextHourTime(val as number));
      };
      const onMinuteChange = (val: number | string) => {
        triggerChange(getNextMinuteTime(val as number));
      };
      const onSecondChange = (val: number | string) => {
        triggerChange(getNextSecondTime(val as number));
      };
      const onMillisecondChange = (val: number | string) => {
        triggerChange(getNextMillisecondTime(val as number));
      };
      const onMeridiemChange = (val: number | string) => {
        triggerChange(getMeridiemTime(val as string));
      };

      const onHourHover = (val: number | string) => {
        onHover?.(getNextHourTime(val as number));
      };
      const onMinuteHover = (val: number | string) => {
        onHover?.(getNextMinuteTime(val as number));
      };
      const onSecondHover = (val: number | string) => {
        onHover?.(getNextSecondTime(val as number));
      };
      const onMillisecondHover = (val: number | string) => {
        onHover?.(getNextMillisecondTime(val as number));
      };
      const onMeridiemHover = (val: number | string) => {
        onHover?.(getMeridiemTime(val as string));
      };

      const sharedColumnProps = {
        onDblClick: onCellDblClick,
        changeOnScroll,
      };

      return (
        <div class={classNames(`${prefixCls}-content`, panelClassNames.content)} style={styles.content}>
          {showHour && (
            <TimeColumn
              units={hourUnits}
              value={hour!}
              optionalValue={pickerHour!}
              type="hour"
              onChange={onHourChange}
              onHover={onHourHover}
              {...sharedColumnProps}
            />
          )}
          {showMinute && (
            <TimeColumn
              units={minuteUnits}
              value={minute!}
              optionalValue={pickerMinute!}
              type="minute"
              onChange={onMinuteChange}
              onHover={onMinuteHover}
              {...sharedColumnProps}
            />
          )}
          {showSecond && (
            <TimeColumn
              units={secondUnits}
              value={second!}
              optionalValue={pickerSecond!}
              type="second"
              onChange={onSecondChange}
              onHover={onSecondHover}
              {...sharedColumnProps}
            />
          )}
          {showMillisecond && (
            <TimeColumn
              units={millisecondUnits}
              value={millisecond!}
              optionalValue={pickerMillisecond!}
              type="millisecond"
              onChange={onMillisecondChange}
              onHover={onMillisecondHover}
              {...sharedColumnProps}
            />
          )}
          {showMeridiem && (
            <TimeColumn
              units={meridiemUnits}
              value={meridiem!}
              type="meridiem"
              onChange={onMeridiemChange}
              onHover={onMeridiemHover}
              {...sharedColumnProps}
            />
          )}
        </div>
      );
    };
  },
});
