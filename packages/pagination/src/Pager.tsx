import type { PaginationLocale, SizeChangerRender } from './interface'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'

type OnClick = (page: number) => void

interface OptionsProps {
  disabled?: boolean
  locale: PaginationLocale
  rootPrefixCls: string
  selectPrefixCls?: string
  pageSize: number
  pageSizeOptions?: number[]
  goButton?: boolean | string
  changeSize?: (size: number) => void
  quickGo?: (value: number) => void
  buildOptionText?: (value: number | string) => string
  showSizeChanger: boolean
  sizeChangerRender?: SizeChangerRender
}
const defaultPageSizeOptions = [10, 20, 50, 100]

const defaults = {
  pageSizeOptions: defaultPageSizeOptions,
} as any

const Pager = defineComponent<OptionsProps>({
  inheritAttrs: false,
  setup(props = defaults) {
    const handleClick = () => {
      props.onClick?.(props.page!)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      props.onKeyPress?.(e, props.onClick!, props.page!)
    }

    return () => {
      const { rootPrefixCls, page, active, className, showTitle, itemRender }
        = props
      const prefixCls = `${rootPrefixCls}-item`

      const cls = classNames(
        prefixCls,
        `${prefixCls}-${page}`,
        {
          [`${prefixCls}-active`]: active,
          [`${prefixCls}-disabled`]: !page,
        },
        className,
      )

      const pager = itemRender?.(page!, 'page', <a rel="nofollow">{page}</a>)

      return pager
        ? (
            <li
              title={showTitle ? String(page) : undefined}
              class={cls}
              onClick={handleClick}
              onKeydown={handleKeyPress}
              tabindex={0}
            >
              {pager}
            </li>
          )
        : null
    }
  },
})

export default Pager
