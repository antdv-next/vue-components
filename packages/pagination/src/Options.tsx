import type { VueNode } from '@v-c/util/dist/type'
import type { PaginationLocale, SizeChangerRender } from './interface'
import KeyCode from '@v-c/util/dist/KeyCode'
import { computed, defineComponent, nextTick, ref } from 'vue'

interface OptionsProps {
  disabled?: boolean
  locale: PaginationLocale
  rootPrefixCls: string
  selectPrefixCls?: string
  pageSize: number
  pageSizeOptions?: number[]
  goButton?: boolean | string | any
  changeSize?: (size: number) => void
  quickGo?: (value: number | undefined) => void
  buildOptionText?: (value: number | string) => string
  showSizeChanger: boolean
  sizeChangerRender?: SizeChangerRender
}

const Options = defineComponent<OptionsProps>(
  (props) => {
    const defaultPageSizeOptions = [10, 20, 50, 100]

    const goInputText = ref('')

    const getValidValue = computed(() => {
      return !goInputText.value || Number.isNaN(goInputText.value)
        ? undefined
        : Number(goInputText.value)
    })

    const handleChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
      if (/^\d*$/.test(value)) {
        goInputText.value = value
      }
    }

    const handleBlur = (e: FocusEvent) => {
      if (props.goButton || goInputText.value === '') {
        return
      }
      nextTick(() => {
        goInputText.value = ''
      })
      const relTarget = e.relatedTarget as HTMLInputElement | null

      if (
        (relTarget
          && relTarget.className.includes(`${props.rootPrefixCls}-item-link`))
        || relTarget?.className.includes(`${props.rootPrefixCls}-item`)
      ) {
        return
      }

      props.quickGo?.(getValidValue.value)
    }

    const getterPageSizeOptions = computed(
      () => props.pageSizeOptions || defaultPageSizeOptions,
    )

    const go = (e: any) => {
      if (goInputText.value === '') {
        return
      }
      if (e.keyCode === KeyCode.ENTER || e.type === 'click') {
        nextTick(() => {
          goInputText.value = ''
        })
        props.quickGo?.(getValidValue.value)
      }
    }

    const getPageSizeOptions = () => {
      if (
        getterPageSizeOptions.value.some(
          option => option.toString() === props.pageSize.toString(),
        )
      ) {
        return getterPageSizeOptions.value
      }
      return getterPageSizeOptions.value
        .concat([props.pageSize])
        .sort((a, b) => {
          const numberA = Number.isNaN(Number(a)) ? 0 : Number(a)
          const numberB = Number.isNaN(Number(b)) ? 0 : Number(b)
          return numberA - numberB
        })
    }

    return () => {
      const {
        rootPrefixCls,
        locale,
        showSizeChanger,
        disabled,
        pageSize,
        quickGo,
        goButton,
        buildOptionText,
        sizeChangerRender,
        changeSize,
      } = props

      const mergeBuildOptionText
        = typeof buildOptionText === 'function'
          ? buildOptionText
          : (value: string | number) => `${value} ${locale.items_per_page}`

      const prefixCls = `${rootPrefixCls}-options`

      if (!showSizeChanger && !quickGo) {
        return null
      }

      let changeSelect: VueNode = null
      let goInput: VueNode = null
      let gotoButton: VueNode = null

      // =========== size Changer ===========
      if (showSizeChanger && sizeChangerRender) {
        changeSelect = sizeChangerRender({
          'disabled': disabled as any,
          'size': pageSize,
          'onSizeChange': (nextValue) => {
            changeSize?.(Number(nextValue))
          },
          'aria-label': locale.page_size as any,
          'className': `${prefixCls}-size-changer`,
          'options': getPageSizeOptions().map(opt => ({
            label: mergeBuildOptionText(opt),
            value: opt,
          })),
        })
      }

      // ============= quickGo ============
      if (quickGo) {
        if (goButton) {
          gotoButton
            = typeof goButton === 'boolean'
              ? (
                  <button
                    type="button"
                    onClick={go}
                    onKeyup={go}
                    disabled={disabled}
                    class={`${prefixCls}-quick-jumper-button`}
                  >
                    {locale.jump_to_confirm}
                  </button>
                )
              : (
                  <span onClick={go} onKeyup={go}>
                    {goButton}
                  </span>
                )
        }

        goInput = (
          <div class={`${prefixCls}-quick-jumper`}>
            {locale.jump_to}
            <input
              disabled={disabled}
              type="text"
              value={goInputText.value}
              onInput={handleChange}
              onKeyup={go}
              onBlur={handleBlur}
              aria-label={locale.page}
            />
            {locale.page}
            {gotoButton}
          </div>
        )
      }

      return (
        <li class={prefixCls}>
          {changeSelect}
          {goInput}
        </li>
      )
    }
  },
)

export default Options
