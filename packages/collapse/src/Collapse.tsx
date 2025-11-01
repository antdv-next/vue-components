import type { Ref } from 'vue'
import type { CollapseProps, Key } from './interface'
import { classNames as classnames } from '@v-c/util'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import omit from '@v-c/util/dist/omit'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { defineComponent, ref, toRef } from 'vue'
import { useItems } from './hooks/useItems'

function getActiveKeysArray(activeKey: Key | Array<Key>) {
  let currentActiveKey = activeKey
  if (!Array.isArray(currentActiveKey)) {
    const activeKeyType = typeof currentActiveKey
    currentActiveKey
      = activeKeyType === 'number' || activeKeyType === 'string'
        ? [currentActiveKey]
        : []
  }
  return currentActiveKey.map(key => String(key))
}

const defaults = {
  prefixCls: 'vc-collapse',
} as any

const Collapse = defineComponent<CollapseProps>({
  name: 'VcCollapse',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose, slots }) {
    const refWrapper = ref<HTMLDivElement>()

    const [activeKey, setActiveKey] = useMergedState<
      Key | Key[],
      Ref<Array<Key>>
    >([], {
      value: toRef(props, 'activeKey') as Ref<Key | Key[]>,
      onChange: v => props.onChange?.(v as Key[]),
      defaultValue: props.defaultActiveKey,
      postState: getActiveKeysArray,
    })

    const getActiveKey = (key: Key) => {
      if (props.accordion) {
        return activeKey.value[0] === key ? [] : [key]
      }

      const index = activeKey.value.indexOf(key)
      const isActive = index > -1
      if (isActive) {
        return activeKey.value.filter(item => item !== key)
      }

      return [...activeKey.value, key]
    }
    const onItemClick = (key: Key) => {
      activeKey.value = getActiveKey(key)
      setActiveKey(activeKey.value)
    }

    expose({
      ref: refWrapper,
    })

    return () => {
      const {
        prefixCls = 'vc-collapse',
        openMotion,
        expandIcon,
        collapsible,
        accordion,
        classNames,
        styles,
        items,
        destroyOnHidden,
      } = props

      const collapseClassName = classnames(prefixCls, (attrs as any).class)

      const mergedProps = { ...props, ...omit(attrs, ['class', 'style']) }

      const mergedChildren = useItems(items, slots.default, {
        prefixCls,
        accordion,
        openMotion,
        expandIcon,
        collapsible,
        onItemClick,
        activeKey: activeKey.value,
        destroyOnHidden,
        classNames,
        styles,
      })

      return (
        <div
          ref={refWrapper}
          class={collapseClassName}
          style={(attrs as any).style}
          role={accordion ? 'tablist' : undefined}
          {...pickAttrs(mergedProps, { aria: true, data: true })}
        >
          {mergedChildren}
        </div>
      )
    }
  },
})

export default Collapse
