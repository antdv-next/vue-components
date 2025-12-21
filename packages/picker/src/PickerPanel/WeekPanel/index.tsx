import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import classNames from 'classnames';
import DatePanel from '../DatePanel';
import { isInRange, isSameWeek } from '../../utils/dateUtil';

export default defineComponent({
  name: 'WeekPanel',
  inheritAttrs: false,
  props: {
    prefixCls: String,
    generateConfig: Object as PropType<any>,
    locale: Object as PropType<any>,
    value: Object as PropType<any>,
    hoverValue: Array as PropType<any>,
    hoverRangeValue: Array as PropType<any>,
  },
  setup(props, { attrs }) {
    return () => {
      const { prefixCls, generateConfig, locale, value, hoverValue, hoverRangeValue } = props;
      const localeName = locale.locale;
      const rowPrefixCls = `${prefixCls}-week-panel-row`;

      const rowClassName = (currentDate: any) => {
        const rangeCls: Record<string, boolean> = {};

        if (hoverRangeValue) {
          const [rangeStart, rangeEnd] = hoverRangeValue;
          const isRangeStart = isSameWeek(generateConfig, localeName, rangeStart, currentDate);
          const isRangeEnd = isSameWeek(generateConfig, localeName, rangeEnd, currentDate);

          rangeCls[`${rowPrefixCls}-range-start`] = isRangeStart;
          rangeCls[`${rowPrefixCls}-range-end`] = isRangeEnd;
          rangeCls[`${rowPrefixCls}-range-hover`] =
            !isRangeStart &&
            !isRangeEnd &&
            isInRange(generateConfig, rangeStart, rangeEnd, currentDate);
        }

        if (hoverValue) {
          rangeCls[`${rowPrefixCls}-hover`] = hoverValue.some((date: any) =>
            isSameWeek(generateConfig, localeName, currentDate, date),
          );
        }

        return classNames(
          rowPrefixCls,
          {
            [`${rowPrefixCls}-selected`]:
              !hoverRangeValue && isSameWeek(generateConfig, localeName, value, currentDate),
          },
          rangeCls,
        );
      };

      return (
        <DatePanel
          {...props}
          {...attrs}
          mode="week"
          panelName="week"
          rowClassName={rowClassName}
        />
      );
    };
  },
});
