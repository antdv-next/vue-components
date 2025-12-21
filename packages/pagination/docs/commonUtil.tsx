import type { PaginationProps } from '../src'
import { defineComponent } from 'vue'
import Pagination from '../src'

interface SizeChangerOption {
  label: string
  value: string | number
}

export interface SizeChangerSelectProps {
  class?: any
  className?: any
  options?: SizeChangerOption[]
  onChange?: (value: string | number, event: Event) => void
  [key: string]: any
}

export function getSizeChangerRender(selectProps: SizeChangerSelectProps = {}) {
  return ({
    disabled,
    size: pageSize,
    onSizeChange,
    'aria-label': ariaLabel,
    className,
    options,
  }: any) => {
    const {
      class: selectClass,
      className: selectClassName,
      options: overrideOptions,
      onChange,
      ...restProps
    } = selectProps
    const mergedOptions = overrideOptions ?? options ?? []
    const mergedClassName = [className, selectClass, selectClassName].filter(Boolean)
    const selectedValue = pageSize ?? mergedOptions[0]?.value

    const handleChange = (event: Event) => {
      const value = (event.target as HTMLSelectElement).value
      onSizeChange?.(value)
      onChange?.(value, event)
    }

    return (
      <select
        {...restProps}
        class={mergedClassName}
        disabled={disabled}
        aria-label={ariaLabel}
        value={selectedValue as any}
        onChange={handleChange}
      >
        {mergedOptions.map((option: any) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
}

type PaginationWithSizeChangerProps = Omit<PaginationProps, 'sizeChangerRender'> & {
  sizeChangerProps?: SizeChangerSelectProps
}

const PaginationWithSizeChanger = defineComponent<PaginationWithSizeChangerProps>((props) => {
  return () => {
    const { sizeChangerProps, ...restProps } = props
    return (
      <Pagination
        {...restProps}
        sizeChangerRender={getSizeChangerRender(sizeChangerProps)}
      />
    )
  }
})

export default PaginationWithSizeChanger
