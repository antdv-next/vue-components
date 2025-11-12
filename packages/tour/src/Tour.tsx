import type { TriggerRef } from '@v-c/trigger'
import type { CSSProperties } from 'vue'
import type { TourProps, TourStepInfo } from './interface'
import { Trigger } from '@v-c/trigger'
import { clsx } from '@v-c/util'
import { computed, defineComponent, nextTick, shallowRef, watch } from 'vue'
import { useClosable } from './hooks/useClosable'
import useTarget from './hooks/useTarget'
import Mask from './Mask'
import Placeholder from './Placeholder'
import { getPlacements } from './placements'
import TourStep from './TourStep'
import { getPlacement } from './util'

const CENTER_PLACEHOLDER: CSSProperties = {
  left: '50%',
  top: '50%',
  width: 1,
  height: 1,
}
const defaultScrollIntoViewOptions: ScrollIntoViewOptions = {
  block: 'center',
  inline: 'center',
}

export type {
  TourProps,
}
const Tour = defineComponent<TourProps>(
  (props, { attrs }) => {
    const triggerRef = shallowRef<TriggerRef>()
    const placeholderRef = shallowRef<HTMLDivElement | null>(null)
    const inlineMode = computed(() => props?.getPopupContainer === false)
    const prefixCls = computed(() => props?.prefixCls ?? 'vc-tour')
    const steps = computed(() => props?.steps ?? [])
    const stepCount = computed(() => steps.value.length)

    const mergedCurrent = shallowRef<number>(
      typeof props?.current === 'number'
        ? props.current
        : props?.defaultCurrent ?? 0,
    )
    const setMergedCurrent = (nextCurrent: number) => {
      if (typeof props?.current === 'undefined') {
        mergedCurrent.value = nextCurrent
      }
    }
    watch(
      () => props?.current,
      (val) => {
        if (typeof val === 'number') {
          mergedCurrent.value = val
        }
      },
    )
    const internalOpen = shallowRef<boolean | undefined>(
      typeof props?.open === 'boolean' ? props.open : props?.defaultOpen,
    )
    const setInternalOpen = (nextOpen?: boolean) => {
      if (typeof props?.open === 'undefined') {
        internalOpen.value = nextOpen
      }
    }
    watch(
      () => props?.open,
      (val) => {
        if (typeof val !== 'undefined') {
          internalOpen.value = val
        }
      },
    )

    const mergedOpen = computed(() => {
      if (mergedCurrent.value < 0 || mergedCurrent.value >= stepCount.value) {
        return false
      }
      return internalOpen.value ?? true
    })

    // Record if already rended in the DOM to avoid `findDOMNode` issue
    const hasOpened = shallowRef(mergedOpen.value)
    const openRef = shallowRef(mergedOpen.value)

    watch(
      [mergedOpen],
      async () => {
        await nextTick()
        if (mergedOpen.value) {
          if (!openRef.value) {
            setMergedCurrent(0)
          }
          hasOpened.value = true
        }
        openRef.value = mergedOpen.value
      },
    )

    const stepInfo = computed(() => (steps.value?.[mergedCurrent.value] ?? {}) as TourStepInfo)
    const stepStyle = computed(() => stepInfo.value?.style)
    const stepClassName = computed(() => stepInfo.value?.className)
    const stepClosable = computed(() => stepInfo.value?.closable)
    const stepCloseIcon = computed(() => stepInfo.value?.closeIcon)
    const closable = computed(() => props?.closable)
    const closeIcon = computed(() => props?.closeIcon)
    const mergedClosable = useClosable(
      stepClosable,
      stepCloseIcon,
      closable,
      closeIcon,
    )

    const mergedMask = computed(() => {
      const mask = stepInfo.value?.mask ?? props?.mask ?? true
      return mergedOpen.value && mask
    })

    const mergedScrollIntoViewOptions = computed(() => stepInfo?.value?.scrollIntoViewOptions ?? props?.scrollIntoViewOptions ?? defaultScrollIntoViewOptions)

    // ====================== Align Target ======================
    const [posInfo, targetElement] = useTarget(
      computed(() => stepInfo?.value?.target),
      mergedOpen,
      computed(() => props?.gap),
      mergedScrollIntoViewOptions,
      inlineMode,
      placeholderRef,
    )
    const mergedPlacement = computed(() => getPlacement(
      targetElement.value as any,
      props?.placement as any,
      stepInfo.value?.placement as any,
    ))

    // ========================= arrow =========================
    const mergedArrow = computed(
      () => {
        if (!targetElement.value) {
          return false
        }
        if (typeof stepInfo.value?.arrow !== 'undefined') {
          return stepInfo.value?.arrow
        }
        return typeof props?.arrow === 'undefined' ? true : props?.arrow
      },
    )

    const arrowPointAtCenter = computed(() => typeof mergedArrow.value === 'object' ? mergedArrow?.value?.pointAtCenter : false)
    watch(
      [arrowPointAtCenter, mergedCurrent],
      async () => {
        await nextTick()
        triggerRef?.value?.forceAlign?.()
      },
      {
        immediate: true,
      },
    )
    // ========================= Change =========================
    const onInternalChange = (nextCurrent: number) => {
      setMergedCurrent(nextCurrent)
      props?.onChange?.(nextCurrent)
    }

    const mergedBuiltinPlacements = computed(() => {
      const { builtinPlacements } = props
      if (builtinPlacements) {
        return typeof builtinPlacements === 'function' ? builtinPlacements({ arrowPointAtCenter: arrowPointAtCenter.value }) : builtinPlacements
      }
      return getPlacements(arrowPointAtCenter.value)
    })
    const handleClose = () => {
      setInternalOpen(false)
      props?.onClose?.(mergedCurrent.value)
    }

    // when targetElement is not exist, use body as triggerDOMNode
    const fallbackDOM = () => {
      return targetElement.value || (typeof document !== 'undefined' ? document.body : null)
    }

    return () => {
      const {
        styles,
        classNames,
        renderPanel,
        rootClassName,
        animated,
        zIndex = 1001,
        getPopupContainer,
        className,
        style,
        disabledInteraction,
        onPopupAlign,
      } = props
      const {
        class: attrClass,
        style: attrStyle,
        ...restAttrs
      } = attrs as {
        class?: unknown
        style?: unknown
        [key: string]: unknown
      }
      const mergedMaskValue = mergedMask.value
      const mergedShowMask = typeof mergedMaskValue === 'boolean' ? mergedMaskValue : !!mergedMaskValue
      const mergedMaskStyle = typeof mergedMaskValue === 'boolean' ? undefined : mergedMaskValue
      const placeholderClassName = clsx(
        className,
        attrClass as any,
        rootClassName,
        `${prefixCls.value}-target-placeholder`,
      )
      const basePosition: CSSProperties = posInfo.value
        ? {
            left: posInfo.value.left,
            top: posInfo.value.top,
            width: posInfo.value.width,
            height: posInfo.value.height,
          }
        : CENTER_PLACEHOLDER
      const placeholderStyle: CSSProperties = {
        ...basePosition,
        position: inlineMode.value ? 'absolute' : 'fixed',
        pointerEvents: 'none',
        ...(style || {}),
      }
      if (attrStyle && typeof attrStyle === 'object') {
        Object.assign(placeholderStyle, attrStyle as CSSProperties)
      }
      console.log(stepInfo.value)
      const popupElement = (
        <TourStep
          styles={styles}
          classNames={classNames}
          arrow={mergedArrow.value}
          key="content"
          prefixCls={prefixCls.value}
          total={stepCount.value}
          renderPanel={renderPanel}
          onPrev={() => {
            onInternalChange(mergedCurrent.value - 1)
          }}
          onNext={() => {
            onInternalChange(mergedCurrent.value + 1)
          }}
          onClose={handleClose}
          current={mergedCurrent.value}
          onFinish={() => {
            handleClose()
            props?.onFinish?.()
          }}
          {...(stepInfo.value as TourStepInfo)}
          closable={mergedClosable.value}
        />
      )

      // ========================= Render =========================
      // Skip if not init yet
      if (targetElement.value === undefined || !hasOpened.value) {
        return null
      }
      return (
        <>
          <Mask
            getPopupContainer={getPopupContainer}
            styles={styles}
            classNames={classNames}
            zIndex={zIndex}
            prefixCls={prefixCls.value}
            pos={posInfo.value as any}
            showMask={mergedShowMask}
            style={mergedMaskStyle?.style}
            fill={mergedMaskStyle?.color}
            open={mergedOpen.value}
            animated={animated}
            rootClassName={rootClassName}
            disabledInteraction={disabledInteraction}
          />
          <Trigger
            {...restAttrs}
            getPopupContainer={getPopupContainer as any}
            builtinPlacements={mergedBuiltinPlacements.value}
            ref={triggerRef as any}
            popupStyle={stepStyle.value as CSSProperties}
            popupPlacement={mergedPlacement.value}
            popupVisible={mergedOpen.value}
            popupClassName={clsx(rootClassName, stepClassName.value)}
            prefixCls={prefixCls.value}
            popup={popupElement}
            forceRender={false}
            autoDestroy
            zIndex={zIndex}
            arrow={!!mergedArrow.value}
            onPopupAlign={onPopupAlign}
          >
            <Placeholder
              open={mergedOpen.value}
              autoLock={!inlineMode.value}
              getContainer={getPopupContainer as any}
              domRef={placeholderRef}
              fallbackDOM={fallbackDOM}
              class={placeholderClassName}
              style={placeholderStyle}
            />
          </Trigger>
        </>
      )
    }
  },
  {
    name: 'VcTour',
    inheritAttrs: false,
  },
)

export default Tour
