import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { PopupRender, SubMenuType } from '../interface'
import { defineComponent } from 'vue'

export type SemanticName = 'list' | 'listTitle'
export interface SubMenuProps extends Omit<SubMenuType, 'key' | 'children' | 'label'> {
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  title?: VueNode

  // children?: React.ReactNode

  /** @private Used for rest popup. Do not use in your prod */
  internalPopupClose?: boolean

  /** @private Internal filled key. Do not set it directly */
  eventKey?: string

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean
  popupRender?: PopupRender
  // >>>>>>>>>>>>>>>>>>>>> Next  Round <<<<<<<<<<<<<<<<<<<<<<<
  // onDestroy?: DestroyEventHandler;
}

const InternalSubMenu = defineComponent<SubMenuProps>(
  (props, { slots, expose, attrs }) => {
    return () => {
      return null
    }
  },
  {
    name: 'InternalSubMenu',
    inheritAttrs: false,
  },
)
