import type { Ref } from 'vue'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { classNames as classnames } from '@v-c/util'
import { defineComponent, ref, toRef } from 'vue'
import { useItems } from './hooks/useItems'
import { generatorCollapseProps, type Key } from './interface'

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

const Collapse = defineComponent({
  props: generatorCollapseProps(),
  name: 'VcCollapse',
  inheritAttrs: false,
  setup(props, { attrs, expose, slots }) {
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
        className,
        style,
        openMotion,
        expandIcon,
        collapsible,
        accordion,
        destroyInactivePanel,
        classNames,
        styles,
        items,
      } = props

      const collapseClassName = classnames(prefixCls, className)

      const mergedProps = { ...props, ...attrs }

      const mergedChildren = useItems(items, slots.default, {
        prefixCls,
        accordion,
        openMotion,
        expandIcon,
        collapsible,
        destroyInactivePanel,
        onItemClick,
        activeKey: activeKey.value,
        classNames,
        styles,
      })

      return (
        <div
          ref={refWrapper}
          class={collapseClassName}
          style={style}
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
