import type { CustomizeComponent } from '../interface';
import Cell from '../Cell';
import { defineComponent } from 'vue';
import { useInjectTable } from '../context/TableContext';
import { useInjectExpandedRow } from '../context/ExpandedRowContext';

export interface ExpandedRowProps {
  prefixCls: string;
  component: CustomizeComponent;
  cellComponent: CustomizeComponent;
  expanded: boolean;
  colSpan: number;
  isEmpty: boolean;
  stickyOffset?: number;
}

export default defineComponent<ExpandedRowProps>({
  name: 'ExpandedRow',
  inheritAttrs: false,
  props: ['prefixCls', 'component', 'cellComponent', 'expanded', 'colSpan', 'isEmpty', 'stickyOffset'] as any,
  setup(props, { slots, attrs }) {
    const tableContext = useInjectTable();
    const expandedRowContext = useInjectExpandedRow();
    const { fixHeader, fixColumn, componentWidth, horizonScroll } = expandedRowContext;
    return () => {
      const {
        prefixCls,
        component: Component,
        cellComponent,
        expanded,
        colSpan,
        isEmpty,
        stickyOffset = 0,
      } = props;

      return (
        <Component
          class={attrs.class}
          style={{
            display: expanded ? null : 'none',
          }}
        >
          <Cell
            component={cellComponent}
            prefixCls={prefixCls}
            colSpan={colSpan}
            v-slots={{
              default: () => {
                let contentNode: any = slots.default?.();

                if (isEmpty ? horizonScroll.value && componentWidth.value : fixColumn.value) {
                  contentNode = (
                    <div
                      style={{
                        width: `${
                          componentWidth.value -
                          stickyOffset -
                          (fixHeader.value && !isEmpty ? tableContext.scrollbarSize : 0)
                        }px`,
                        position: 'sticky',
                        left: `${stickyOffset}px`,
                        overflow: 'hidden',
                      }}
                      class={`${prefixCls}-expanded-row-fixed`}
                    >
                      {contentNode}
                    </div>
                  );
                }
                return contentNode;
              },
            }}
          ></Cell>
        </Component>
      );
    };
  },
});
