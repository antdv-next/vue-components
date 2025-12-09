import type { VueNode } from '@v-c/util/dist/type'
import KeyCode from '@v-c/util/dist/KeyCode'
import { computed, defineComponent } from 'vue'

export interface StarProps {
  value?: number
  index?: number
  prefixCls?: string
  allowHalf?: boolean
  disabled?: boolean
  character?: ((props: StarProps) => any) | VueNode
  characterRender?: ((origin: any, props: StarProps) => any)
  onClick?: (e: MouseEvent | KeyboardEvent, index: number) => void
  onHover?: (e: MouseEvent, index: number) => void
  focused?: boolean
  count?: number
}

export default defineComponent<StarProps>(
  (props) => {
    const onHover = (e: MouseEvent) => {
      const { index } = props
      props?.onHover?.(e, index)
    }
    const onClick = (e: MouseEvent) => {
      const { index } = props
      props?.onClick?.(e, index)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const { index } = props
      if (e.keyCode === KeyCode.ENTER) {
        props?.onClick?.(e, index)
      }
    }

    const cls = computed(() => {
      const { prefixCls, index, value, allowHalf, focused } = props
      const starValue = index + 1
      let className = prefixCls
      if (value === 0 && index === 0 && focused) {
        className += ` ${prefixCls}-focused`
      }
      else if (allowHalf && value + 0.5 >= starValue && value < starValue) {
        className += ` ${prefixCls}-half ${prefixCls}-active`
        if (focused) {
          className += ` ${prefixCls}-focused`
        }
      }
      else {
        if (starValue <= value) {
          className += ` ${prefixCls}-full`
        }
        else {
          className += ` ${prefixCls}-zero`
        }
        if (starValue === value && focused) {
          className += ` ${prefixCls}-focused`
        }
      }
      return className
    })

    return () => {
      const {
        disabled,
        prefixCls,
        characterRender,
        character,
        index,
        count,
        value,
      } = props
      const characterNode = typeof character === 'function'
        ? (character as any)({
            disabled,
            prefixCls,
            index,
            count,
            value,
          })
        : character
      let star = (
        <li class={cls.value}>
          <div
            onClick={disabled ? null : onClick}
            onKeydown={disabled ? null : onKeyDown}
            onMousemove={disabled ? null : onHover}
            role="radio"
            aria-checked={value > index ? 'true' : 'false'}
            aria-posinset={index + 1}
            aria-setsize={count}
            tabindex={disabled ? -1 : 0}
          >
            <div class={`${prefixCls}-first`}>{characterNode}</div>
            <div class={`${prefixCls}-second`}>{characterNode}</div>
          </div>
        </li>
      )
      if (characterRender) {
        star = characterRender(star, props)
      }
      return star
    }
  },
  {
    name: 'RateStar',
    inheritAttrs: false,
  },
)
