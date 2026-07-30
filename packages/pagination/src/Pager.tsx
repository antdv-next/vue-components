import type { CSSProperties } from 'vue'
import type { PaginationProps } from './interface'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'

export interface PagerProps extends Pick<PaginationProps, 'itemRender'> {
  rootPrefixCls: string
  page: number
  /** Localized word for "page", prefixed to the number in the accessible name. */
  pageLabel?: string
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
      pageLabel,
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

    // The `li` below carries `role="button"` and the accessible name, so the
    // inner anchor is hidden from the a11y tree to avoid a duplicate reading.
    const pager = itemRender?.(
      page,
      'page',
      <a tabindex={-1} aria-hidden="true" rel="nofollow">{page}</a>,
    )
    const pagerLabel = `${pageLabel ?? ''} ${page}`.trim()

    return pager
      ? (
          <li
            title={showTitle ? String(page) : undefined}
            class={cls}
            style={style}
            onClick={handleClick}
            onKeydown={handleKeyPress}
            tabindex={0}
            role="button"
            aria-label={pagerLabel}
            aria-current={active ? 'page' : undefined}
          >
            {pager}
          </li>
        )
      : null
  }
})

export default Pager
