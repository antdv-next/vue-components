import type { ExtractPropTypes } from 'vue'
import omit from '@v-c/util/dist/omit'
import classNames from 'classnames'
import { defineComponent } from 'vue'
import { useInjectMenu } from './context/MenuContext'
import { useFullPath, useMeasure } from './context/PathContext.tsx'
import { parseChildren } from './utils/commonUtil'

function menuItemGroupProps() {
  return {
    title: {
      type: [String, Object],
    },
    eventKey: [String, Object],
    warnKey: Boolean,
  }
}

export type MenuItemGroupProps = Partial<ExtractPropTypes<ReturnType<typeof menuItemGroupProps>>>

const InternalMenuItemGroup = defineComponent({
  name: 'InternalMenuItemGroup',
  inheritAttrs: false,
  props: menuItemGroupProps(),
  emits: ['mouseEnter', 'mouseLeave', 'keyDown', 'click', 'focus'],
  setup(props, { slots, attrs }) {
    const { prefixCls, classNames: menuClassNames, styles } = useInjectMenu()

    const groupPrefixCls = `${prefixCls}-item-group`

    return () => {
      const { title } = props
      return (
        <li
          role="presentation"
          {...attrs}
          onClick={e => e.stopPropagation()}
          class={classNames(groupPrefixCls, [attrs.class])}
        >
          <div
            role="presentation"
            class={classNames(`${groupPrefixCls}-title`, menuClassNames?.listTitle)}
            style={styles?.listTitle}
            title={typeof title === 'string' ? title : undefined}
          >
            {title}
          </div>
          <ul
            role="group"
            class={classNames(`${groupPrefixCls}-list`, menuClassNames?.list)}
            style={styles?.list}
          >
            {slots.default?.()}
          </ul>
        </li>
      )
    }
  },
})

export default defineComponent({
  name: 'MenuItemGroup',
  inheritAttrs: false,
  props: {
    eventKey: {
      type: [String, Object],
    },
    warnKey: {
      type: Boolean,
    },
  },
  setup(props, { slots }) {
    const connectedKeyPath = useFullPath(props.eventKey!)

    const measure = useMeasure()

    return () => {
      const childList = parseChildren(slots.default?.(), connectedKeyPath)

      if (measure) {
        return childList
      }
      return (
        <InternalMenuItemGroup {...omit(props, ['warnKey'])}>
          {childList}
        </InternalMenuItemGroup>
      )
    }
  },
})
