import type { ColumnType, Key } from '../interface'
import ResizeObserver from '@v-c/resize-observer'
import isVisible from '@v-c/util/dist/Dom/isVisible'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { cloneVNode, defineComponent, isVNode, ref } from 'vue'
import { useInjectTableContext } from '../context/TableContext'
import MeasureCell from './MeasureCell'

export interface MeasureRowProps {
  prefixCls: string
  onColumnResize: (key: Key, width: number) => void
  columnsKey: Key[]
  columns: readonly ColumnType<any>[]
}

const MeasureRow = defineComponent<MeasureRowProps>({
  name: 'TableMeasureRow',
  props: ['prefixCls', 'onColumnResize', 'columnsKey', 'columns'] as any,
  setup(props) {
    const rowRef = ref<HTMLTableRowElement | null>(null)
    const { measureRowRender } = useInjectTableContext()
    return () => {
      const cloneTitle = (title: any): any => {
        if (Array.isArray(title)) {
          return title.map(node => cloneTitle(node))
        }
        if (isVNode(title)) {
          const cloned: any = cloneVNode(title, { ref: undefined })
          let children = cloned.children
          if (cloned.children?.default && typeof cloned.children.default === 'function') {
            children = filterEmpty(cloned.children?.default?.())
            if (Array.isArray(children)) {
              children = children.map((child: any) => cloneTitle(child))
            }
            else if (isVNode(children)) {
              children = cloneTitle(children)
            }
            cloned.children.default = () => children
          }
          else if (Array.isArray(children)) {
            cloned.children = children.map((child: any) => cloneTitle(child))
          }

          return cloned
        }
        return title
      }

      const measureRow = (
        <tr aria-hidden="true" class={`${props.prefixCls}-measure-row`} style={{ height: 0 }} ref={rowRef}>
          <ResizeObserver.Collection
            onBatchResize={(infoList) => {
              if (isVisible(rowRef.value as any)) {
                infoList.forEach(({ data: columnKey, size }) => {
                  props.onColumnResize(columnKey, size.offsetWidth)
                })
              }
            }}
          >
            {props.columnsKey.map((columnKey) => {
              const column = props.columns.find(col => col.key === columnKey)
              const titleForMeasure = cloneTitle(column?.title)
              return (
                <MeasureCell
                  key={columnKey as any}
                  columnKey={columnKey}
                  onColumnResize={props.onColumnResize}
                  title={titleForMeasure}
                />
              )
            })}
          </ResizeObserver.Collection>
        </tr>
      )

      return typeof measureRowRender === 'function' ? measureRowRender(measureRow) : measureRow
    }
  },
})

export default MeasureRow
