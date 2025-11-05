import type { VueNode } from '@v-c/util/dist/type'
import type { CSSMotionProps } from '@v-c/util/dist/utils/transition'
import type { CSSProperties } from 'vue'

export interface EditableConfig {
  onEdit: (
    type: 'add' | 'remove',
    info: { key?: string, event: MouseEvent | KeyboardEvent },
  ) => void
  showAdd?: boolean
  removeIcon?: VueNode
  addIcon?: VueNode
}

export interface AnimatedConfig {
  inkBar?: boolean
  tabPane?: boolean
  tabPaneMotion?: CSSMotionProps
}

export interface TabsLocale {
  dropdownAriaLabel?: string
  removeAriaLabel?: string
  addAriaLabel?: string
}

export interface AddButtonProps {
  prefixCls: string
  editable?: EditableConfig
  locale?: TabsLocale
  style?: CSSProperties
}
