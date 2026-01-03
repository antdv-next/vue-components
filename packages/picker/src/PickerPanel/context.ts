import type { InjectionKey, Ref } from 'vue'
import type { FilledPanelClassNames, FilledPanelStyles } from '../hooks/useSemantic'
import type { PanelMode, SharedPanelProps } from '../interface'
import { inject, provide } from 'vue'

export interface SharedPanelContextProps {
  classNames: FilledPanelClassNames
  styles: FilledPanelStyles
}

const SharedPanelContextKey: InjectionKey<Ref<SharedPanelContextProps>> = Symbol('SharedPanelContext')

export function provideSharedPanelContext(context: Ref<SharedPanelContextProps>) {
  provide(SharedPanelContextKey, context)
}

export function useSharedPanelContext() {
  return inject(SharedPanelContextKey, null as any) as Ref<SharedPanelContextProps> | null
}

export interface PanelContextProps<DateType extends object = any>
  extends Pick<
    SharedPanelProps<DateType>,
    | 'prefixCls'
    | 'cellRender'
    | 'generateConfig'
    | 'locale'
    | 'onSelect'
    | 'hoverValue'
    | 'hoverRangeValue'
    | 'onHover'
    | 'values'
    | 'pickerValue'

    // Limitation
    | 'disabledDate'
    | 'minDate'
    | 'maxDate'

    // Icon
    | 'prevIcon'
    | 'nextIcon'
    | 'superPrevIcon'
    | 'superNextIcon'
  > {
  panelType: PanelMode
  now: DateType
  classNames: FilledPanelClassNames
  styles: FilledPanelStyles
}

const PanelContextKey: InjectionKey<Ref<PanelContextProps>> = Symbol('PanelContext')

export function providePanelContext<DateType extends object = any>(context: Ref<PanelContextProps<DateType>>) {
  provide(PanelContextKey, context as any)
}

export function usePanelContext<DateType extends object = any>() {
  return inject(PanelContextKey, null as any) as Ref<PanelContextProps<DateType>> | null
}

export function useInfo<DateType extends object = any>(
  props: SharedPanelProps<DateType>,
  panelType: PanelMode,
  sharedContext?: Ref<SharedPanelContextProps> | null,
): [sharedProps: PanelContextProps<DateType>, now: DateType] {
  const ctx = sharedContext ?? useSharedPanelContext()
  const classNames = ctx?.value.classNames
  const styles = ctx?.value.styles

  const {
    prefixCls,
    generateConfig,
    locale,
    disabledDate,
    minDate,
    maxDate,
    cellRender,
    hoverValue,
    hoverRangeValue,
    onHover,
    values,
    pickerValue,
    onSelect,
    prevIcon,
    nextIcon,
    superPrevIcon,
    superNextIcon,
  } = props

  const now = generateConfig!.getNow()

  const info: PanelContextProps<DateType> = {
    now,
    values,
    pickerValue,
    prefixCls,
    classNames: classNames!,
    styles: styles!,
    disabledDate,
    minDate,
    maxDate,
    cellRender,
    hoverValue,
    hoverRangeValue,
    onHover,
    locale,
    generateConfig,
    onSelect,
    panelType,
    prevIcon,
    nextIcon,
    superPrevIcon,
    superNextIcon,
  }

  return [info, now]
}

export interface PickerHackContextProps {
  hidePrev?: boolean
  hideNext?: boolean
  hideHeader?: boolean
  onCellDblClick?: () => void
}

const PickerHackContextKey: InjectionKey<Ref<PickerHackContextProps>> = Symbol('PickerHackContext')

export function providePickerHackContext(context: Ref<PickerHackContextProps>) {
  provide(PickerHackContextKey, context)
}

export function usePickerHackContext() {
  return inject(PickerHackContextKey, null as any) as Ref<PickerHackContextProps> | null
}
