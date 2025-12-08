import type { RangeTimeProps, SharedTimeProps } from '../../interface'

export type PopupShowTimeConfig<DateType extends object = any> = Omit<
  RangeTimeProps<DateType>,
  'defaultValue' | 'defaultOpenValue' | 'disabledTime'
>
& Pick<SharedTimeProps<DateType>, 'disabledTime'>
