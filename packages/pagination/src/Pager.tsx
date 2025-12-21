import type { CSSProperties } from 'vue'
import type { PaginationProps } from './interface'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'

export interface PagerProps extends Pick<PaginationProps, 'itemRender'> {
  rootPrefixCls: string
  page: number
  active?: boolean
  className?: string
  style?: CSSProperties
  showTitle: boolean
  onClick?: (page: number) => void
  onKeyPress?: (
    e: KeyboardEvent,
    onClick: PagerProps['onClick'],
    page: PagerProps['page'],
  ) => void
}

const Pager = defineComponent<PagerProps>((props) => {
  const handleClick = () => {
    props.onClick?.(props.page)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    props.onKeyPress?.(e, props.onClick, props.page)
  }

  return () => {
    const {
      rootPrefixCls,
      page,
      active,
      className,
      showTitle,
      itemRender,
      style,
    } = props
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

    const pager = itemRender?.(page, 'page', <a rel="nofollow">{page}</a>)

    return pager
      ? (
          <li
            title={showTitle ? String(page) : undefined}
            class={cls}
            style={style}
            onClick={handleClick}
            onKeydown={handleKeyPress}
            tabindex={0}
          >
            {pager}
          </li>
        )
      : null
  }
})

export default Pager
