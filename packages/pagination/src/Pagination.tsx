import type { VueNode } from '@v-c/util'
import type { Ref, VNode } from 'vue'
import type { PaginationProps } from './interface'
import { classNames } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import KeyCode from '@v-c/util/dist/KeyCode'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import { cloneElement } from '@v-c/util/dist/vnode'
import {
  computed,
  defineComponent,
  h,
  isVNode,
  ref,
  toRef,
  watchEffect,
} from 'vue'
import zhCN from './locale/zh_CN'
import Options from './Options.tsx'
import Pager from './Pager'

function noop() {}

function isInteger(v: number) {
  const value = Number(v)
  return (
    typeof value === 'number'
    && !Number.isNaN(value)
    && isFinite(value)
    && Math.floor(value) === value
  )
}
const defaultItemRender: PaginationProps['itemRender'] = (_page, _type, element) => element
function calculatePage(p: number | undefined, pageSize: number, total: number) {
  const _pageSize = typeof p === 'undefined' ? pageSize : p
  return Math.floor((total - 1) / _pageSize) + 1
}

const defaultProps = {
  prefixCls: 'vc-pagination',
  selectPrefixCls: 'vc-select',
  defaultCurrent: 1,
  total: 0,
  defaultPageSize: 10,
  onChange: noop,
  showPrevNextJumpers: true,
  showTitle: true,
  onShowSizeChange: noop,
  locale: zhCN,
  totalBoundaryShowSizeChanger: 50,
  itemRender: defaultItemRender,
} as any

const Pagination = defineComponent<PaginationProps>({
  name: 'VCPagination',
  inheritAttrs: false,
  setup(props = defaultProps, { attrs }) {
    const paginationRef = ref()
    const defaultPrefixCls = 'vc-pagination'

    const pageSizeProp = toRef(props, 'pageSize')
    const [pageSize, setPageSize] = useMergedState(10, {
      value: pageSizeProp as Ref<number>,
      defaultValue: props.defaultPageSize || 10,
    })

    const currentProp = toRef(props, 'current')
    const allPages = computed(() =>
      calculatePage(undefined, pageSize.value!, props.total!),
    )
    const [current, setCurrent] = useMergedState(1, {
      value: currentProp as Ref<number>,
      defaultValue: props.defaultCurrent || 1,
      postState: (c: number | undefined) =>
        Math.max(
          1,
          Math.min(c!, calculatePage(undefined, pageSize.value!, props.total!)),
        ),
    })

    const internalInputVal = ref(current.value)
    watchEffect(() => {
      internalInputVal.value = current.value
    })

    const calcPaginationCls = computed(() => {
      const { prefixCls = defaultPrefixCls, align, simple, disabled } = props
      return classNames(props.prefixCls, {
        [`${prefixCls}-start`]: align === 'start',
        [`${prefixCls}-center`]: align === 'center',
        [`${prefixCls}-end`]: align === 'end',
        [`${prefixCls}-simple`]: simple,
        [`${prefixCls}-disabled`]: disabled,
      })
    })

    function getValidValue(e: any): number {
      const inputValue = e.target.value
      const allPages = calculatePage(undefined, pageSize.value, props.total!)
      let value: number
      if (inputValue === '') {
        value = inputValue
      }
      else if (Number.isNaN(Number(inputValue))) {
        value = internalInputVal.value
      }
      else if (inputValue >= allPages) {
        value = allPages
      }
      else {
        value = Number(inputValue)
      }
      return value
    }

    function isValid(page: number) {
      return (
        isInteger(page)
        && page !== current.value
        && isInteger(props.total!)
        && props.total! > 0
      )
    }

    function getItemIcon(icon: VueNode, label: string) {
      let iconNode = icon || (
        <button
          type="button"
          aria-label={label}
          class={`${props.prefixCls}-item-link`}
        />
      )
      if (typeof icon === 'function') {
        iconNode = h(icon, { ...props })
      }
      return iconNode as VNode
    }

    const prevPage = computed(() =>
      current.value - 1 > 0 ? current.value - 1 : 0,
    )
    const nextPage = computed(() =>
      current.value + 1 < allPages.value ? current.value + 1 : allPages.value,
    )

    const jumpPrevPage = computed(() =>
      Math.max(1, current.value - (props.showLessItems ? 3 : 5)),
    )
    const jumpNextPage = computed(() =>
      Math.min(
        calculatePage(undefined, pageSize.value, props.total!),
        current.value + (props.showLessItems ? 3 : 5),
      ),
    )
    const hasPrev = computed(() => current.value > 1)
    const hasNext = computed(
      () =>
        current.value < calculatePage(undefined, pageSize.value, props.total!),
    )
    const goButton = computed(
      () => props.showQuickJumper && (props.showQuickJumper as any).goButton,
    )

    function handleChange(page: number | undefined) {
      if (typeof page !== 'undefined' && isValid(page) && !props.disabled) {
        const currentPage = calculatePage(
          undefined,
          pageSize.value,
          props.total!,
        )
        let newPage = page
        if (page > currentPage) {
          newPage = currentPage
        }
        else if (page < 1) {
          newPage = 1
        }

        if (newPage !== internalInputVal.value) {
          internalInputVal.value = newPage
        }

        setCurrent(newPage)
        props.onChange?.(newPage, pageSize.value)

        return newPage
      }

      return current.value
    }

    function prevHandle() {
      if (hasPrev.value)
        handleChange(current.value - 1)
    }

    function nextHandle() {
      if (hasNext.value)
        handleChange(current.value + 1)
    }

    function jumpPrevHandle() {
      handleChange(jumpPrevPage.value)
    }

    function jumpNextHandle() {
      handleChange(jumpNextPage.value)
    }

    function runIfEnter(
      event: KeyboardEvent,
      callback: (...args: any[]) => void,
      ...restParams: any[]
    ) {
      if (
        event.key === 'Enter'
        || event.charCode === KeyCode.ENTER
        || event.keyCode === KeyCode.ENTER
      ) {
        callback(...restParams)
      }
    }

    function runIfEnterPrev(event: KeyboardEvent) {
      runIfEnter(event, prevHandle)
    }

    function runIfEnterNext(event: KeyboardEvent) {
      runIfEnter(event, nextHandle)
    }

    function runIfEnterJumpPrev(event: KeyboardEvent) {
      runIfEnter(event, jumpPrevHandle)
    }

    function runIfEnterJumpNext(event: KeyboardEvent) {
      runIfEnter(event, jumpNextHandle)
    }

    function renderPrev(prevPage: number) {
      const itemRender = props.itemRender || defaultItemRender
      const prevButton = itemRender?.(
        prevPage,
        'prev',
        getItemIcon(props.prevIcon, 'prev page'),
      )
      return isVNode(prevButton)
        ? cloneElement(prevButton, { disabled: !hasPrev.value })
        : prevButton
    }

    function renderNext(nextPage: number) {
      const itemRender = props.itemRender || defaultItemRender
      const nextButton = itemRender?.(
        nextPage,
        'next',
        getItemIcon(props.nextIcon, 'next page'),
      )
      return isVNode(nextButton)
        ? cloneElement(nextButton, { disabled: !hasNext.value })
        : nextButton
    }

    function handleGoTO(event: Event) {
      if (
        event.type === 'click'
        || (event as KeyboardEvent).keyCode === KeyCode.ENTER
      ) {
        handleChange(internalInputVal.value)
      }
    }

    /**
     * prevent "up arrow" key reseting cursor position within textbox
     * @see https://stackoverflow.com/a/1081114
     */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.keyCode === KeyCode.UP || event.keyCode === KeyCode.DOWN) {
        event.preventDefault()
      }
    }

    function handleKeyUp(event: Event) {
      const value = getValidValue(event)
      if (value !== internalInputVal.value) {
        internalInputVal.value = value
      }

      switch ((event as KeyboardEvent).keyCode) {
        case KeyCode.ENTER:
          handleChange(value)
          break
        case KeyCode.UP:
          handleChange(value - 1)
          break
        case KeyCode.DOWN:
          handleChange(value + 1)
          break
        default:
          break
      }
    }

    function handleBlur(event: FocusEvent) {
      handleChange(getValidValue(event))
    }

    function changePageSize(size: number) {
      const newCurrent = calculatePage(size, pageSize.value, props.total!)
      const nextCurrent
        = current.value > newCurrent && newCurrent !== 0
          ? newCurrent
          : current.value

      setPageSize(size)
      internalInputVal.value = nextCurrent
      props.onShowSizeChange?.(current.value, size)
      setCurrent(nextCurrent)
      props.onChange?.(nextCurrent, size)
    }

    const shouldDisplayQuickJumper = computed(() =>
      props.total! > pageSize.value ? props.showQuickJumper : false,
    )

    return () => {
      const {
        prefixCls = defaultPrefixCls,
        selectPrefixCls = 'vc-select',
        showTotal,
        total = 0,
        locale,
        simple,
        showTitle,
        showLessItems,
        jumpPrevIcon,
        jumpNextIcon,
        pageSizeOptions,
        disabled,
        showPrevNextJumpers,
        itemRender = defaultItemRender,
        totalBoundaryShowSizeChanger = 50,
        showSizeChanger = total > totalBoundaryShowSizeChanger,
        sizeChangerRender,
      } = props

      const { style, className } = getAttrStyleAndClass(attrs)
      const dataOrAriaAttributeProps = pickAttrs(attrs, {
        aria: true,
        data: true,
      })

      let prev = renderPrev(prevPage.value)
      if (prev) {
        const prevDisabled = !hasPrev.value || !allPages.value
        prev = (
          <li
            title={props.showTitle ? locale?.prev_page : undefined}
            onClick={prevHandle}
            tabindex={prevDisabled ? undefined : 0}
            onKeydown={runIfEnterPrev}
            class={classNames(`${prefixCls}-prev`, {
              [`${prefixCls}-disabled`]: prevDisabled,
            })}
            aria-disabled={prevDisabled}
          >
            {prev}
          </li>
        )
      }

      let next = renderNext(nextPage.value)
      if (next) {
        let nextDisabled: boolean, nextTabIndex: number | null

        if (simple) {
          nextDisabled = !hasNext
          nextTabIndex = hasPrev ? 0 : null
        }
        else {
          nextDisabled = !hasNext || !allPages
          nextTabIndex = nextDisabled ? null : 0
        }

        next = (
          <li
            title={showTitle ? locale?.next_page : undefined}
            onClick={nextHandle}
            tabindex={nextTabIndex ?? undefined}
            onKeydown={runIfEnterNext}
            class={classNames(`${prefixCls}-next`, {
              [`${prefixCls}-disabled`]: nextDisabled,
            })}
            aria-disabled={nextDisabled}
          >
            {next}
          </li>
        )
      }

      const totalText = showTotal && (
        <li class={`${prefixCls}-total-text`}>
          {showTotal(total, [
            total === 0 ? 0 : (current.value - 1) * pageSize.value + 1,
            current.value * pageSize.value > total
              ? total
              : current.value * pageSize.value,
          ])}
        </li>
      )

      // ========================== Simple ============================
      const isReadOnly = typeof simple === 'object' ? simple.readOnly : !simple
      let gotoButton: any = goButton.value

      let simplePager: VNode | null = null
      if (simple) {
        if (goButton.value) {
          if (typeof goButton.value === 'boolean') {
            gotoButton = (
              <button type="button" onClick={handleGoTO} onKeyup={handleGoTO}>
                {locale?.jump_to_confirm}
              </button>
            )
          }
        }
        else {
          gotoButton = (
            <span onClick={handleGoTO} onKeyup={handleGoTO}>
              {goButton}
            </span>
          )
        }

        gotoButton = (
          <li
            title={
              showTitle
                ? `${locale?.jump_to}${current.value}/${allPages.value}`
                : undefined
            }
            class={`${prefixCls}-simple-pager`}
          >
            {gotoButton}
          </li>
        )

        simplePager = (
          <li
            title={showTitle ? `${current.value}/${allPages.value}` : undefined}
            class={`${prefixCls}-simple-pager`}
          >
            {isReadOnly
              ? (
                  internalInputVal.value
                )
              : (
                  <input
                    type="text"
                    value={internalInputVal}
                    disabled={disabled}
                    onKeydown={handleKeyDown}
                    onKeyup={handleKeyUp}
                    onChange={handleKeyUp}
                    onBlur={handleBlur}
                    size={3}
                  />
                )}
            <span class={`${prefixCls}-slash`}>/</span>
            {allPages}
          </li>
        )
      }

      // ====================== Normal ======================
      const pagerProps = {
        rootPrefixCls: prefixCls,
        onClick: handleChange,
        onKeypress: runIfEnter,
        showTitle,
        itemRender,
        page: -1,
      }

      const pagerList: (VNode | null)[] = []
      const pageBufferSize = showLessItems ? 1 : 2
      if (allPages.value <= 3 + pageBufferSize * 2) {
        if (!allPages.value) {
          pagerList.push(
            <Pager
              {...pagerProps}
              key="noPager"
              page={1}
              class={`${prefixCls}-item-disabled`}
            />,
          )
        }

        for (let i = 1; i <= allPages.value; i += 1) {
          pagerList.push(
            <Pager
              {...pagerProps}
              key={i}
              page={i}
              active={current.value === i}
            />,
          )
        }
      }
      else {
        const prevItemTitle = showLessItems ? locale?.prev_3 : locale?.prev_5
        const nextItemTitle = showLessItems ? locale?.next_3 : locale?.next_5

        const jumpPrevContent = itemRender(
          jumpPrevPage.value,
          'jump-prev',
          getItemIcon(jumpPrevIcon, 'prev page'),
        )
        const jumpNextContent = itemRender(
          jumpNextPage.value,
          'jump-next',
          getItemIcon(jumpNextIcon, 'next page'),
        )
        let jumpPrev = null
        let jumpNext = null

        if (showPrevNextJumpers) {
          jumpPrev = jumpPrevContent
            ? (
                <li
                  title={showTitle ? prevItemTitle : undefined}
                  key="prev"
                  onClick={jumpPrevHandle}
                  tabindex={0}
                  onKeydown={runIfEnterJumpPrev}
                  class={classNames(`${prefixCls}-jump-prev`, {
                    [`${prefixCls}-jump-prev-custom-icon`]: !!jumpPrevIcon,
                  })}
                >
                  {jumpPrevContent}
                </li>
              )
            : null

          jumpNext = jumpNextContent
            ? (
                <li
                  title={showTitle ? nextItemTitle : undefined}
                  key="next"
                  onClick={jumpNextHandle}
                  tabindex={0}
                  onKeydown={runIfEnterJumpNext}
                  class={classNames(`${prefixCls}-jump-next`, {
                    [`${prefixCls}-jump-next-custom-icon`]: !!jumpNextIcon,
                  })}
                >
                  {jumpNextContent}
                </li>
              )
            : null
        }
        let left = Math.max(1, current.value - pageBufferSize)
        let right = Math.min(current.value + pageBufferSize, allPages.value)

        if (current.value - 1 <= pageBufferSize) {
          right = 1 + pageBufferSize * 2
        }
        if (allPages.value - current.value <= pageBufferSize) {
          left = allPages.value - pageBufferSize * 2
        }

        for (let i = left; i <= right; i += 1) {
          pagerList.push(
            <Pager
              {...pagerProps}
              key={i}
              page={i}
              active={current.value === i}
            />,
          )
        }

        if (
          current.value - 1 >= pageBufferSize * 2
          && current.value !== 1 + 2
        ) {
          if (pagerList[0]) {
            pagerList[0] = cloneElement(pagerList[0], {
              className: classNames(
                `${prefixCls}-item-after-jump-prev`,
                pagerList[0].props?.className,
              ),
            })
          }
          pagerList.unshift(jumpPrev)
        }

        if (
          allPages.value - current.value >= pageBufferSize * 2
          && current.value !== allPages.value - 2
        ) {
          const lastOne = pagerList[pagerList.length - 1]
          if (lastOne) {
            pagerList[pagerList.length - 1] = cloneElement(lastOne, {
              className: classNames(
                `${prefixCls}-item-before-jump-next`,
                lastOne.props?.className,
              ),
            })
          }
          pagerList.push(jumpNext)
        }

        if (left !== 1) {
          pagerList.unshift(<Pager {...pagerProps} key={1} page={1} />)
        }
        if (right !== allPages.value) {
          pagerList.push(
            <Pager
              {...pagerProps}
              key={allPages.value}
              page={allPages.value}
            />,
          )
        }
      }

      return (
        <ul
          ref={paginationRef}
          class={[calcPaginationCls.value, className]}
          style={style}
          {...dataOrAriaAttributeProps}
        >
          {totalText}
          {prev}
          {simple ? simplePager : pagerList}
          {next}
          <Options
            locale={locale}
            rootPrefixCls={prefixCls}
            disabled={disabled}
            selectPrefixCls={selectPrefixCls}
            changeSize={changePageSize}
            pageSizeOptions={pageSizeOptions}
            pageSize={pageSize.value}
            quickGo={shouldDisplayQuickJumper.value ? handleChange : undefined}
            goButton={gotoButton}
            showSizeChanger={showSizeChanger}
            sizeChangerRender={sizeChangerRender}
          />
        </ul>
      )
    }
  },
})

export default Pagination
