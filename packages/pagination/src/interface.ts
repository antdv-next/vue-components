import type { VueNode } from '@v-c/util/dist/type'
import type {
  Component,
  CSSProperties,
  ExtractPropTypes,
  PropType,
  VNode,
  VNodeChild,
} from 'vue'

export interface PaginationLocale {
  // Options
  items_per_page?: string
  jump_to?: string
  jump_to_confirm?: string
  page?: string

  // Pagination
  prev_page?: string
  next_page?: string
  prev_5?: string
  next_5?: string
  prev_3?: string
  next_3?: string
  page_size?: string
}

export type ItemRender = (
  page: number,
  type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
  element: VNode,
) => VNodeChild

export function paginationProps() {
  return {
    disabled: {
      type: Boolean,
      default: undefined,
    },
    prefixCls: {
      type: String,
      default: 'vc-pagination',
    },
    selectPrefixCls: {
      type: String,
      default: 'vc-select',
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: undefined,
    },
    totalBoundaryShowSizeChanger: {
      type: Number,
      default: 50,
    },
    current: Number,
    pageSize: Number,
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    defaultPageSize: {
      type: Number,
      default: 10,
    },
    total: {
      type: Number,
      default: 0,
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
    align: {
      type: String as PropType<'start' | 'center' | 'end'>,
      default: 'start',
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: undefined,
    },
    className: {
      type: String,
      default: undefined,
    },
    showSizeChanger: {
      type: Boolean,
      default: undefined,
    },
    showLessItems: {
      type: Boolean,
      default: false,
    },
    selectComponentClass: Object as PropType<Component>,
    showTotal: Function as PropType<
      (total: number, range: [number, number]) => VNodeChild
    >,
    showTitle: {
      type: Boolean,
      default: true,
    },
    simple: {
      type: [Boolean, Object] as PropType<boolean | { readOnly?: boolean }>,
      default: undefined,
    },
    itemRender: {
      type: Function as PropType<ItemRender>,
      default: undefined,
    },
    prevIcon: {
      type: Object as PropType<VNode | Component>,
      default: undefined,
    },
    nextIcon: {
      type: Object as PropType<VNode | Component>,
      default: undefined,
    },
    jumpPrevIcon: {
      type: Object as PropType<VNode | Component>,
      default: undefined,
    },
    jumpNextIcon: {
      type: Object as PropType<VNode | Component>,
      default: undefined,
    },
    showPrevNextJumpers: {
      type: Boolean,
      default: true,
    },
    onChange: {
      type: Function as PropType<(page: number, pageSize: number) => void>,
      default: undefined,
    },
    locale: {
      type: Object as PropType<PaginationLocale>,
      default: undefined,
    },
    showQuickJumper: {
      type: [Boolean, Object] as PropType<boolean | { goButton?: VNode }>,
      default: undefined,
    },
    onShowSizeChange: {
      type: Function as PropType<(current: number, pageSize: number) => void>,
      default: undefined,
    },
    sizeChangerRender: {
      type: Function as PropType<SizeChangerRender>,
    },
  }
}

export type PaginationProps = ExtractPropTypes<ReturnType<typeof paginationProps>>

export type SizeChangerRender = (info: {
  'disabled': boolean
  'size': number
  'onSizeChange': (value: string | number) => void
  'aria-label': string
  'className': string
  'options': {
    label: string
    value: string | number
  }[]
}) => VueNode

export function optionsProps() {
  return {
    disabled: {
      type: Boolean,
    },
    locale: {
      type: Object as PropType<PaginationLocale>,
      required: true,
    },
    rootPrefixCls: {
      type: String,
      required: true,
    },
    selectPrefixCls: {
      type: String,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    pageSizeOptions: {
      type: Array as PropType<Array<number>>,
    },
    goButton: {
      type: [Boolean, String],
    },
    changeSize: {
      type: Function as PropType<(size: number) => void>,
    },
    quickGo: {
      type: Function as PropType<(value: number | undefined) => void>,
    },
    buildOptionText: {
      type: Function as PropType<(value: string | number) => string>,
    },
    showSizeChanger: {
      type: Boolean,
      require: true,
    },
    sizeChangerRender: {
      type: Function as PropType<SizeChangerRender>,
    },
  }
}
