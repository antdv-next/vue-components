import type { PropType } from 'vue'
import type { ItemRender } from './interface'
import { classNames } from '@v-c/util'
import { defineComponent } from 'vue'

type OnClick = (page: number) => void

const Pager = defineComponent({
  inheritAttrs: false,
  props: {
    itemRender: {
      type: Function as PropType<ItemRender>,
    },
    rootPrefixCls: {
      type: String,
    },
    page: {
      type: Number,
    },
    active: {
      type: Boolean,
    },
    className: {
      type: [String, Array],
    },
    showTitle: {
      type: Boolean,
    },
    onClick: {
      type: Function as PropType<OnClick>,
    },
    onKeyPress: {
      type: Function as PropType<
        (e: KeyboardEvent, onClick: OnClick, page: number) => void
      >,
    },
  },
  setup(props) {
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
