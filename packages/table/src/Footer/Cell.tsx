import { defineComponent } from 'vue';
import Cell from '../Cell';
import { useInjectSummary } from '../context/SummaryContext';
import { useInjectTable } from '../context/TableContext';
import type { AlignType, StickyOffsets } from '../interface';
import { getCellFixedInfo } from '../utils/fixUtil';

export interface SummaryCellProps {
  index?: number;
  colSpan?: number;
  rowSpan?: number;
  align?: AlignType;
}

export default defineComponent({
  name: 'ATableSummaryCell',
  props: ['index', 'colSpan', 'rowSpan', 'align'],
  setup(props, { attrs, slots }) {
    const tableContext = useInjectTable();
    const summaryContext = useInjectSummary();
    return () => {
      const { index, colSpan = 1, rowSpan, align } = props;
      const { prefixCls, direction } = tableContext;
      const { scrollColumnIndex, stickyOffsets, flattenColumns = [] } = summaryContext;
      const mergedStickyOffsets: StickyOffsets = stickyOffsets || {
        start: [],
        end: [],
        widths: [],
        left: [],
        right: [],
        isSticky: false,
      };
      const lastIndex = index + colSpan - 1;
      const mergedColSpan = lastIndex + 1 === scrollColumnIndex ? colSpan + 1 : colSpan;

      const fixedInfo = getCellFixedInfo(
        index,
        index + mergedColSpan - 1,
        flattenColumns,
        mergedStickyOffsets,
        direction,
      );
      return (
        <Cell
          class={attrs.class as string}
          index={index}
          component="td"
          prefixCls={prefixCls}
          record={null}
          dataIndex={null}
          align={align}
          colSpan={mergedColSpan}
          rowSpan={rowSpan}
          customRender={() => slots.default?.()}
          {...fixedInfo}
        />
      );
    };
  },
});
