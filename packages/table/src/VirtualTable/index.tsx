import type { CustomizeScrollBody, GetComponent, Reference } from '../interface'
import type { TableProps } from '../Table'
import { clsx, get, warning } from '@v-c/util'
import { computed, defineComponent, reactive, ref, watchEffect } from 'vue'
import { INTERNAL_HOOKS } from '../constant'
import Table, { DEFAULT_PREFIX } from '../Table'
import BodyGrid from './BodyGrid'
import { useProvideStaticContext } from './context'

export interface VirtualTableProps<RecordType> extends Omit<TableProps<RecordType>, 'scroll'> {
  listItemHeight?: number
  scroll: { x?: number, y?: number }
}

const VirtualTable = defineComponent<VirtualTableProps<any>>(
  (props, { expose, slots, attrs }) => {
    const tableRef = ref<Reference | null>(null)

    const mergedScrollX = computed(() => {
      const scrollX = props.scroll?.x
      if (typeof scrollX !== 'number') {
        if (process.env.NODE_ENV !== 'production') {
          warning(!scrollX, '`scroll.x` in virtual table must be number.')
        }
        return 1
      }
      return scrollX
    })

    const mergedScrollY = computed(() => {
      const scrollY = props.scroll?.y
      if (typeof scrollY !== 'number') {
        if (process.env.NODE_ENV !== 'production') {
          warning(false, '`scroll.y` in virtual table must be number.')
        }
        return 500
      }
      return scrollY
    })

    const getComponent: GetComponent = (path, defaultComponent) => {
      return get(props.components, path as any) || defaultComponent
    }

    const onTablePropScroll = (event: Event) => {
      props.onScroll?.(event)
    }

    const staticContext = reactive({
      scrollY: mergedScrollY.value,
      listItemHeight: props.listItemHeight,
      sticky: props.sticky,
      getComponent,
      onScroll: onTablePropScroll,
    })

    useProvideStaticContext(staticContext)

    watchEffect(() => {
      staticContext.scrollY = mergedScrollY.value
      staticContext.listItemHeight = props.listItemHeight
      staticContext.sticky = props.sticky
    })

    expose({
      get nativeElement() {
        return tableRef.value?.nativeElement
      },
      scrollTo: (config: any) => tableRef.value?.scrollTo?.(config),
    })

    return () => {
      const { scroll, listItemHeight, components, ...restProps } = props
      const mergedClassName = clsx(restProps.className, `${props.prefixCls || DEFAULT_PREFIX}-virtual`)
      void listItemHeight
      const renderBody: CustomizeScrollBody<any> = (rawData, info) => (
        <BodyGrid ref={info.ref} data={rawData as any} onScroll={info.onScroll} />
      )
      return (
        <Table
          {...restProps}
          className={mergedClassName}
          scroll={{ ...scroll, x: mergedScrollX.value, y: mergedScrollY.value }}
          components={{
            ...(components || {}),
            body: props.data?.length ? renderBody : undefined,
          }}
          internalHooks={INTERNAL_HOOKS}
          tailor
          ref={tableRef}
        >
          {slots.default?.()}
        </Table>
      )
    }
  },
)

export default VirtualTable
