import type { Ref } from 'vue'
import type { TourProps, TourStepInfo } from '../interface'
import { computed } from 'vue'

type ClosableConfig = Exclude<TourStepInfo['closable'], boolean> | null

function isConfigObj(
  closable: TourStepInfo['closable'],
): closable is Exclude<TourStepInfo['closable'], boolean> {
  return closable !== null && typeof closable === 'object'
}

function getClosableConfig(
  closable: TourStepInfo['closable'],
  closeIcon: TourStepInfo['closeIcon'],
  preset: true,
): ClosableConfig
function getClosableConfig(
  closable: TourStepInfo['closable'],
  closeIcon: TourStepInfo['closeIcon'],
  preset: false,
): ClosableConfig | 'empty'

/**
 * Convert `closable` to ClosableConfig.
 * When `preset` is true, will auto fill ClosableConfig with default value.
 */
function getClosableConfig(
  closable: TourStepInfo['closable'],
  closeIcon: TourStepInfo['closeIcon'],
  preset: boolean,
): ClosableConfig | 'empty' {
  if (
    closable === false
    || (closeIcon === false && (!isConfigObj(closable) || !closable?.closeIcon))
  ) {
    return null
  }

  const mergedCloseIcon
    = typeof closeIcon !== 'boolean' ? closeIcon : undefined

  if (isConfigObj(closable)) {
    return {
      ...closable,
      closeIcon: closable?.closeIcon ?? mergedCloseIcon,
    }
  }

  // When StepClosable no need auto fill, but RootClosable need this.
  return preset || closable || closeIcon
    ? {
        closeIcon: mergedCloseIcon,
      }
    : 'empty'
}

export function useClosable(
  stepClosable: Ref<TourStepInfo['closable']>,
  stepCloseIcon: Ref<TourStepInfo['closeIcon']>,
  closable: Ref<TourProps['closable']>,
  closeIcon: Ref<TourProps['closeIcon']>,
) {
  return computed(() => {
    const stepClosableConfig = getClosableConfig(
      stepClosable.value,
      stepCloseIcon.value,
      false,
    )
    const rootCloseableConfig = getClosableConfig(
      closable.value,
      closeIcon.value,
      true,
    )
    if (stepClosableConfig !== 'empty') {
      return stepClosableConfig
    }
    return rootCloseableConfig
  })
}
