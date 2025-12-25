import type { RefOptionListProps } from '@v-c/select'
import type { Ref } from 'vue'
import type {
  DefaultOptionType,
  InternalFieldNames,
  LegacyKey,
  SingleValueType,
} from '../Cascader'
import KeyCode from '@v-c/util/dist/KeyCode'
import { SEARCH_MARK } from '../hooks/useSearchOptions'
import { getFullPathKeys, toPathKey } from '../utils/commonUtil'

export default function useKeyboard(
  options: Ref<DefaultOptionType[]>,
  fieldNames: Ref<InternalFieldNames>,
  activeValueCells: Ref<LegacyKey[]>,
  setActiveValueCells: (activeValueCells: LegacyKey[]) => void,
  onKeyBoardSelect: (valueCells: SingleValueType, option: DefaultOptionType) => void,
  contextProps: {
    direction: Ref<'ltr' | 'rtl' | undefined>
    searchValue: Ref<string>
    toggleOpen: (open?: boolean) => void
    open: Ref<boolean | undefined>
  },
): RefOptionListProps {
  const getActiveStatus = () => {
    let activeIndex = -1
    let currentOptions = options.value

    const mergedActiveIndexes: number[] = []
    const mergedActiveValueCells: LegacyKey[] = []

    const len = activeValueCells.value.length

    const pathKeys = getFullPathKeys(options.value, fieldNames.value)

    // Fill validate active value cells and index
    for (let i = 0; i < len && currentOptions; i += 1) {
      // Mark the active index for current options
      const nextActiveIndex = currentOptions.findIndex(
        (option, index) =>
          (pathKeys[index] ? toPathKey(pathKeys[index]) : option[fieldNames.value.value])
          === activeValueCells.value[i],
      )

      if (nextActiveIndex === -1) {
        break
      }

      activeIndex = nextActiveIndex
      mergedActiveIndexes.push(activeIndex)
      mergedActiveValueCells.push(activeValueCells.value[i])

      currentOptions = currentOptions[activeIndex]?.[fieldNames.value.children]
    }

    // Fill last active options
    let activeOptions = options.value
    for (let i = 0; i < mergedActiveIndexes.length - 1; i += 1) {
      activeOptions = activeOptions[mergedActiveIndexes[i]]?.[fieldNames.value.children] || []
    }

    return {
      validActiveValueCells: mergedActiveValueCells,
      lastActiveIndex: activeIndex,
      lastActiveOptions: activeOptions,
      fullPathKeys: pathKeys,
    }
  }

  // Update active value cells and scroll to target element
  const internalSetActiveValueCells = (next: LegacyKey[]) => {
    setActiveValueCells(next)
  }

  // Same options offset
  const offsetActiveOption = (offset: number) => {
    const { lastActiveOptions, lastActiveIndex, fullPathKeys, validActiveValueCells } = getActiveStatus()
    const len = lastActiveOptions.length

    let currentIndex = lastActiveIndex
    if (currentIndex === -1 && offset < 0) {
      currentIndex = len
    }

    for (let i = 0; i < len; i += 1) {
      currentIndex = (currentIndex + offset + len) % len
      const option = lastActiveOptions[currentIndex]
      if (option && !option.disabled) {
        const nextActiveCells = validActiveValueCells
          .slice(0, -1)
          .concat(
            fullPathKeys[currentIndex]
              ? toPathKey(fullPathKeys[currentIndex])
              : option[fieldNames.value.value],
          )
        internalSetActiveValueCells(nextActiveCells)
        return
      }
    }
  }

  // Different options offset
  const prevColumn = () => {
    const { validActiveValueCells } = getActiveStatus()
    if (validActiveValueCells.length > 1) {
      const nextActiveCells = validActiveValueCells.slice(0, -1)
      internalSetActiveValueCells(nextActiveCells)
    }
    else {
      contextProps.toggleOpen(false)
    }
  }

  const nextColumn = () => {
    const { lastActiveOptions, lastActiveIndex, validActiveValueCells } = getActiveStatus()
    const nextOptions: DefaultOptionType[]
      = lastActiveOptions[lastActiveIndex]?.[fieldNames.value.children] || []

    const nextOption = nextOptions.find(option => !option.disabled)

    if (nextOption) {
      const nextActiveCells = [...validActiveValueCells, nextOption[fieldNames.value.value]]
      internalSetActiveValueCells(nextActiveCells)
    }
  }

  return {
    scrollTo: () => {

    },
    onKeyDown: (event) => {
      const { which } = event

      const rtl = contextProps.direction.value === 'rtl'
      const searchValue = contextProps.searchValue.value
      const open = contextProps.open.value

      switch (which) {
        // >>> Arrow keys
        case KeyCode.UP:
        case KeyCode.DOWN: {
          let offset = 0
          if (which === KeyCode.UP) {
            offset = -1
          }
          else if (which === KeyCode.DOWN) {
            offset = 1
          }

          if (offset !== 0) {
            offsetActiveOption(offset)
          }

          break
        }

        case KeyCode.LEFT: {
          if (searchValue) {
            break
          }
          if (rtl) {
            nextColumn()
          }
          else {
            prevColumn()
          }
          break
        }

        case KeyCode.RIGHT: {
          if (searchValue) {
            break
          }
          if (rtl) {
            prevColumn()
          }
          else {
            nextColumn()
          }
          break
        }

        case KeyCode.BACKSPACE: {
          if (!searchValue) {
            prevColumn()
          }
          break
        }

        // >>> Select
        case KeyCode.ENTER: {
          const { validActiveValueCells, lastActiveOptions, lastActiveIndex } = getActiveStatus()
          if (validActiveValueCells.length) {
            const option = lastActiveOptions[lastActiveIndex]

            // Search option should revert back of origin options
            const originOptions: DefaultOptionType[] = option?.[SEARCH_MARK] || []
            if (originOptions.length) {
              onKeyBoardSelect(
                originOptions.map(opt => opt[fieldNames.value.value]),
                originOptions[originOptions.length - 1],
              )
            }
            else {
              onKeyBoardSelect(validActiveValueCells as SingleValueType, lastActiveOptions[lastActiveIndex])
            }
          }
          break
        }

        // >>> Close
        case KeyCode.ESC: {
          contextProps.toggleOpen(false)

          if (open) {
            event.stopPropagation()
          }
        }
      }
    },
    onKeyUp: () => {},
  }
}
