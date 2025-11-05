import type { MenuItemType } from './interface.ts'
import Overflow from '@v-c/overflow'
import { warning } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import { defineComponent } from 'vue'

export interface MenuItemProps extends Omit<MenuItemType, 'label' | 'key' > {
  /** @private Internal filled key. Do not set it directly */
  eventKey?: string

  /** @private Do not use. Private warning empty usage */
  warnKey?: boolean

  /** @deprecated No place to use this. Should remove */
  attribute?: Record<string, string>
}

// Since Menu event provide the `info.item` which point to the MenuItem node instance.
// We have to use class component here.
// This should be removed from doc & api in future.
const LegacyMenuItem = defineComponent<{
  elementRef?: any
}>(
  (props, { slots, attrs }) => {
    return () => {
      const { title, attribute, ...restProps } = attrs
      const { elementRef } = props
      // Here the props are eventually passed to the DOM element.
      // React does not recognize non-standard attributes.
      // Therefore, remove the props that is not used here.
      // ref: https://github.com/ant-design/ant-design/issues/41395
      const passedProps = omit(restProps, [
        'eventKey',
        'popupClassName',
        'popupOffset',
        'onTitleClick',
      ])

      warning(!attribute, '`attribute` of Menu.Item is deprecated. Please pass attribute directly.')

      return (
        <Overflow.Item
          {...attribute as any}
          title={typeof title === 'string' ? title : undefined}
          {...passedProps}
          ref={elementRef}
        >
          {slots?.default?.()}
        </Overflow.Item>
      )
    }
  },
  {
    name: 'LegacyMenuItem',
    inheritAttrs: false,
  },
)
