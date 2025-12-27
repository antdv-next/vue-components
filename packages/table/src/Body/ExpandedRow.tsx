import { defineComponent } from 'vue'
import Cell from '../Cell'
import { useInjectTableContext } from '../context/TableContext'
import type { CustomizeComponent } from '../interface'

export interface ExpandedRowProps {
  prefixCls: string
  component: CustomizeComponent
  cellComponent: CustomizeComponent
  className: string
  expanded: boolean
  // children?: any
  colSpan: number
  isEmpty?: boolean
  stickyOffset?: number
}

const ExpandedRow = defineComponent<ExpandedRowProps>({
  name: 'TableExpandedRow',
  props: [
    'prefixCls',
    'component',
    'cellComponent',
    'className',
    'expanded',
    'colSpan',
    'isEmpty',
    'stickyOffset',
  ] as any,
  setup(props, { slots }) {
    const context = useInjectTableContext()

    return () => {
      const {
        prefixCls,
        component: Component,
        cellComponent,
        className,
        expanded,
        colSpan,
        isEmpty,
        stickyOffset = 0,
      } = props

      let contentNode = slots.default?.()

      if (isEmpty ? context.horizonScroll && context.componentWidth : context.fixColumn) {
        contentNode = (
          <div
            style={{
              width: `${context.componentWidth - stickyOffset - (context.fixHeader && !isEmpty ? context.scrollbarSize : 0)}px`,
              position: 'sticky',
              left: `${stickyOffset}px`,
              overflow: 'hidden',
            }}
            class={`${prefixCls}-expanded-row-fixed`}
          >
            {contentNode}
          </div>
        )
      }

      return (
        <Component class={className} style={{ display: expanded ? null : 'none' }}>
          <Cell component={cellComponent} prefixCls={prefixCls} colSpan={colSpan}>
            {contentNode}
          </Cell>
        </Component>
      )
    }
  },
})

export default ExpandedRow
