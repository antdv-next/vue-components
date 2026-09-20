import type { Mock } from 'vitest'
import type { CollapseProps } from '../src'
import KeyCode from '@v-c/util/dist/KeyCode'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import Collapse, { Panel } from '../src/index'

describe('collapse', () => {
  let changeHook: Mock<any> | null

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    changeHook = null
  })

  function onChange(this: any, ...args: any[]) {
    if (changeHook) {
      changeHook.apply(this, args)
    }
  }

  function runNormalTest(element: any) {
    let collapse: ReturnType<typeof mount>

    beforeEach(() => {
      collapse = mount(element)
    })

    afterEach(() => {
      collapse.unmount()
    })

    it('add className', () => {
      const el = collapse.findAll('.vc-collapse-item')?.[2]

      expect(el.classes()).toContain('vc-collapse-item')
      expect(el.classes()).toContain('important')
    })

    it('create works', () => {
      expect(collapse.findAll('.vc-collapse')).toHaveLength(1)
    })

    it('header works', () => {
      expect(collapse.findAll('.vc-collapse-header')).toHaveLength(3)
    })

    it('panel works', () => {
      expect(collapse.findAll('.vc-collapse-item')).toHaveLength(3)
      expect(collapse.findAll('.vc-collapse-panel')).toHaveLength(0)
    })

    it('should render custom arrow icon correctly', () => {
      expect(collapse.find('.vc-collapse-header')?.text()).toContain('text>')
    })

    it('default active works', () => {
      expect(collapse.findAll('.vc-collapse-item-active').length).toBeFalsy()
    })

    it('extra works', () => {
      const extraNodes = collapse.findAll('.vc-collapse-extra')
      expect(extraNodes.length).toBe(1)
      expect(extraNodes[0].html()).toContain('<span>Extra span</span>')
    })

    it('onChange works', async () => {
      changeHook = vi.fn()
      const headerNode = collapse.findAll('.vc-collapse-header')?.[1]
      await headerNode?.trigger('click')
      expect(changeHook.mock.calls[0][0]).toEqual(['2'])
    })

    it('click should toggle panel state', async () => {
      const header = collapse.findAll('.vc-collapse-header')?.[1]
      await header?.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      await header?.trigger('click')
      expect(
        collapse.find('.vc-collapse-panel-inactive')?.element.innerHTML,
      ).toBe('<div class="vc-collapse-body">second</div>')
      expect(collapse.findAll('.vc-collapse-panel-active').length).toBeFalsy()
    })

    it('click should not toggle disabled panel state', async () => {
      const header = collapse.find('.vc-collapse-header')
      expect(header.element).toBeTruthy()
      await header.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active').length).toBeFalsy()
    })

    it('should not have role', () => {
      const item = collapse.find('.vc-collapse')
      expect(item.element).toBeTruthy()
      expect(item.attributes().role).toBe(undefined)
    })

    it('should set button role on panel title', () => {
      const item = collapse.find('.vc-collapse-header')
      expect(item.element).toBeTruthy()
      expect(item.attributes().role).toBe('button')
    })
  }

  describe('collapse', () => {
    const expandIcon = () => (
      <span>
        text
        {'>'}
      </span>
    )

    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        collapsible: 'disabled',
        children: 'first',
      },
      {
        label: 'collapse 2',
        key: '2',
        extra: <span>Extra span</span>,
        children: 'second',
      },
      {
        label: 'collapse 3',
        key: '3',
        class: 'important',
        children: 'third',
      },
    ]
    const element = (
      <Collapse items={items} expandIcon={expandIcon} onChange={onChange} />
    )

    runNormalTest(element)

    it('controlled', async () => {
      const onChangeSpy = vi.fn()

      const ControlledCollapse = defineComponent(() => {
        const activeKey = ref<CollapseProps['activeKey']>(['2'])
        const handleChange: CollapseProps['onChange'] = (key) => {
          activeKey.value = key
          onChangeSpy(key)
        }

        const items: CollapseProps['items'] = [
          {
            label: 'collapse 1',
            key: '1',
            children: 'first',
          },
          {
            label: 'collapse 2',
            key: '2',
            children: 'second',
          },
          {
            label: 'collapse 3',
            key: '3',
            children: 'third',
          },
        ]
        return () => (
          <Collapse
            onChange={handleChange}
            activeKey={activeKey.value}
            items={items}
          />
        )
      })

      const el = mount(ControlledCollapse)

      expect(el.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      const header = el.find('.vc-collapse-header')
      expect(header.element).toBeTruthy()
      await header.trigger('click')
      expect(el.findAll('.vc-collapse-panel-active')).toHaveLength(2)
      expect(onChangeSpy).toBeCalledWith(['2', '1'])
    })
  })

  describe('it should support number key', () => {
    const expandIcon = () => (
      <span>
        text
        {'>'}
      </span>
    )
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        collapsible: 'disabled',
        children: 'first',
      },
      {
        label: 'collapse 2',
        key: '2',
        extra: <span>Extra span</span>,
        children: 'second',
      },
      {
        label: 'collapse 3',
        key: '3',
        class: 'important',
        children: 'third',
      },
    ]

    const element = (
      <Collapse onChange={onChange} expandIcon={expandIcon} items={items} />
    )
    runNormalTest(element)
  })

  describe('prop: headerClass', () => {
    it('applies the passed headerClass to the header', () => {
      const items = [
        {
          label: 'collapse 1',
          key: '1',
          headerClass: 'custom-class',
          children: 'first',
        },
      ]
      const element = <Collapse onChange={onChange} items={items} />

      const wrapper = mount(element)
      const header = wrapper.find('.vc-collapse-header')

      expect(header.element?.classList.contains('custom-class')).toBeTruthy()
    })

    it('should support extra whit number 0', () => {
      const items = [
        {
          label: 'collapse 0',
          key: 0,
          extra: 0,
          children: 'zero',
        },
      ]
      const wrapper = mount(
        <Collapse onChange={onChange} activeKey={0} items={items}></Collapse>,
      )

      const extraNodes = wrapper.findAll('.vc-collapse-extra')
      expect(extraNodes).toHaveLength(1)
      expect(extraNodes[0].element.innerHTML).toBe('0')
    })

    it('should support activeKey number 0', () => {
      const items = [
        {
          label: 'collapse 0',
          key: 0,
          children: 'zero',
        },
        {
          label: 'collapse 1',
          key: 1,
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: 2,
          children: 'second',
        },
      ]
      const wrapper = mount(
        <Collapse onChange={onChange} activeKey={0} items={items} />,
      )

      // activeKey number 0, should open one item
      expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(1)
    })

    it('click should toggle panel state', async () => {
      const items = [
        {
          label: 'collapse 1',
          key: '1',
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: '2',
          children: 'second',
        },
        {
          label: 'collapse 3',
          key: '3',
          children: 'second',
          class: 'important',
        },
      ]

      const wrapper = mount(
        <Collapse
          onChange={onChange}
          destroyOnHidden
          items={items}
        >
        </Collapse>,
      )

      const header = wrapper.findAll('.vc-collapse-header')?.[1]
      await header.trigger('click')
      expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      await header.trigger('click')
      expect(wrapper.findAll('.vc-collapse-panel-inactive').length).toBeFalsy()
    })
  })

  function runAccordionTest(element: any) {
    let collapse: ReturnType<typeof mount>

    beforeEach(() => {
      collapse = mount(element)
    })

    afterEach(() => {
      collapse.unmount()
    })

    it('accordion content, should default open zero item', () => {
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(0)
    })

    it('accordion item, should default open zero item', () => {
      expect(collapse.findAll('.vc-collapse-item-active')).toHaveLength(0)
    })

    it('should toggle show on panel', async () => {
      let header = collapse.findAll('.vc-collapse-header')?.[1]
      await header.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      expect(collapse.findAll('.vc-collapse-item-active')).toHaveLength(1)
      header = collapse.findAll('.vc-collapse-header')?.[1]
      await header.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(0)
      expect(collapse.findAll('.vc-collapse-item-active')).toHaveLength(0)
    })

    it('should only show on panel', async () => {
      let header = collapse.find('.vc-collapse-header')
      expect(header.element).toBeTruthy()
      await header.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      expect(collapse.findAll('.vc-collapse-item-active')).toHaveLength(1)
      header = collapse.findAll('.vc-collapse-header')?.[2]
      await header.trigger('click')
      expect(collapse.findAll('.vc-collapse-panel-active')).toHaveLength(1)
      expect(collapse.findAll('.vc-collapse-item-active')).toHaveLength(1)
    })

    it('should add tab role on panel title', () => {
      const item = collapse.find('.vc-collapse-header')
      expect(item.element).toBeTruthy()
      expect(item.element.getAttribute('role')).toBe('tab')
    })

    it('should add tablist role on accordion', () => {
      const item = collapse.find('.vc-collapse')
      expect(item.element).toBeTruthy()
      expect(item.element.getAttribute('role')).toBe('tablist')
    })

    it('should add tablist role on PanelContent', async () => {
      const header = collapse.find('.vc-collapse-header')
      expect(header.element).toBeTruthy()
      await header.trigger('click')
      const item = collapse.find('.vc-collapse-panel')
      expect(item.element).toBeTruthy()
      expect(item!.element.getAttribute('role')).toBe('tabpanel')
    })
  }

  describe('prop: accordion', () => {
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        children: 'first',
      },
      {
        label: 'collapse 2',
        key: '2',
        children: 'second',
      },
      {
        label: 'collapse 3',
        key: '3',
        children: 'third',
      },
    ]

    const element = <Collapse items={items} accordion onChange={onChange} />

    runAccordionTest(element)
  })

  describe('forceRender', () => {
    it('when forceRender is not supplied it should lazy render the panel content', () => {
      const items: CollapseProps['items'] = [
        {
          label: 'collapse 1',
          key: '1',
          collapsible: 'disabled',
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: '2',
          children: 'second',
        },
      ]
      const wrapper = mount(<Collapse items={items} />)
      expect(wrapper.findAll('.vc-collapse-panel')).toHaveLength(0)
    })

    it('when forceRender is FALSE it should lazy render the panel content', () => {
      const items: CollapseProps['items'] = [
        {
          label: 'collapse 1',
          key: '1',
          collapsible: 'disabled',
          forceRender: false,
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: '2',
          children: 'second',
        },
      ]

      const wrapper = mount(<Collapse items={items} />)
      expect(wrapper.findAll('.vc-collapse-panel')).toHaveLength(0)
    })

    it('when forceRender is TRUE then it should render all the panel content to the DOM', () => {
      const items: CollapseProps['items'] = [
        {
          label: 'collapse 1',
          key: '1',
          collapsible: 'disabled',
          forceRender: true,
          children: 'first',
        },
        {
          label: 'collapse 2',
          key: '2',
          children: 'second',
        },
      ]
      const wrapper = mount(<Collapse items={items} />)

      expect(wrapper.findAll('.vc-collapse-panel')).toHaveLength(1)
      expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(0)
      const inactiveDom = wrapper.find('div.vc-collapse-panel-inactive')
      expect(inactiveDom.element).not.toBeFalsy()
      expect(getComputedStyle(inactiveDom!.element)).toHaveProperty(
        'display',
        'none',
      )
    })
  })

  it('should toggle panel when press enter', async () => {
    const myKeyEvent = {
      keyCode: KeyCode.ENTER,
    }

    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',

        children: 'first',
      },
      {
        label: 'collapse 2',
        key: '2',
        children: 'second',
      },
      {
        label: 'collapse 3',
        key: '3',
        children: 'second',
        collapsible: 'disabled',
      },
    ]
    const wrapper = mount(<Collapse items={items} />)

    // fireEvent.keyDown(container.querySelectorAll('.rc-collapse-header')?.[2], myKeyEvent);
    const el = wrapper.findAll('.vc-collapse-header')?.[2]
    await el.trigger('keydown', myKeyEvent)
    expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(0)

    await wrapper.find('.vc-collapse-header')?.trigger('keydown', myKeyEvent)

    expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(1)

    expect(wrapper.find('.vc-collapse-panel').element.className).toContain(
      'vc-collapse-panel-active',
    )

    await wrapper.find('.vc-collapse-header').trigger('keydown', myKeyEvent)

    expect(wrapper.findAll('.vc-collapse-panel-active')).toHaveLength(0)
    expect(wrapper.find('.vc-collapse-panel')!.element.className).not.toContain(
      'vc-collapse-panel-active',
    )
  })

  it('should support return null icon', () => {
    const items: CollapseProps['items'] = [
      { label: 'title', key: '1', children: 'first' },
    ]
    const wrapper = mount(
      <Collapse expandIcon={() => null} items={items}></Collapse>,
    )

    const childrenNodes = wrapper.find('.vc-collapse-header').element.childNodes
    let len = 0
    for (const node of childrenNodes) {
      if (node.nodeType !== 8) {
        len++
      }
    }
    expect(len).toBe(1)
  })

  describe('prop: collapsible', () => {
    it('default', async () => {
      const items: CollapseProps['items'] = [
        { label: 'collapse 1', key: '1', children: 'first' },
      ]
      const wrapper = mount(<Collapse items={items}></Collapse>)
      expect(wrapper.find('.vc-collapse-title')).toBeTruthy()
      await wrapper.find('.vc-collapse-header')?.trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(1)
    })
    it('should work when value is header', async () => {
      const items: CollapseProps['items'] = [
        { label: 'collapse 1', key: '1', children: 'first' },
      ]
      const wrapper = mount(
        <Collapse collapsible="header" items={items}></Collapse>,
      )
      expect(wrapper.find('.vc-collapse-title')).toBeTruthy()
      await wrapper.find('.vc-collapse-header').trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(0)
      await wrapper.find('.vc-collapse-title').trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(1)
    })

    it('should work when value is icon', async () => {
      const items: CollapseProps['items'] = [
        { label: 'collapse 1', key: '1', children: 'first' },
      ]
      const wrapper = mount(
        <Collapse collapsible="icon" items={items}></Collapse>,
      )
      expect(wrapper.find('.vc-collapse-expand-icon')).toBeTruthy()
      await wrapper.find('.vc-collapse-header')!.trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(0)
      await wrapper.find('.vc-collapse-expand-icon')!.trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(1)
    })

    it('should disabled when value is disabled', async () => {
      const items: CollapseProps['items'] = [
        { label: 'collapse 1', key: '1', children: 'first' },
      ]
      const wrapper = mount(
        <Collapse collapsible="disabled" items={items}></Collapse>,
      )
      expect(wrapper.find('.vc-collapse-title')).toBeTruthy()
      expect(wrapper.findAll('.vc-collapse-item-disabled')).toHaveLength(1)
      await wrapper.find('.vc-collapse-header').trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(0)
    })

    it('the value of panel should be read first', async () => {
      const items: CollapseProps['items'] = [
        {
          label: 'collapse 1',
          key: '1',
          children: 'first',
          collapsible: 'disabled',
        },
      ]
      const wrapper = mount(
        <Collapse collapsible="header" items={items}></Collapse>,
      )
      expect(wrapper.find('.vc-collapse-title')).toBeTruthy()

      expect(wrapper.findAll('.vc-collapse-item-disabled')).toHaveLength(1)

      await wrapper.find('.vc-collapse-header').trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(0)
    })

    it('icon trigger when collapsible equal header', async () => {
      const items: CollapseProps['items'] = [
        { label: 'collapse 1', key: '1', children: 'first' },
      ]
      const wrapper = mount(
        <Collapse collapsible="header" items={items}></Collapse>,
      )

      await wrapper.find('.vc-collapse-header .arrow').trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(1)
    })

    it('header not trigger when collapsible equal icon', async () => {
      const items: CollapseProps['items'] = [
        { label: 'collapse 1', key: '1', children: 'first' },
      ]
      const wrapper = mount(
        <Collapse collapsible="icon" items={items}></Collapse>,
      )
      await wrapper.find('.vc-collapse-title').trigger('click')
      expect(wrapper.findAll('.vc-collapse-item-active')).toHaveLength(0)
    })
  })

  it('!showArrow', () => {
    const items: CollapseProps['items'] = [
      { label: 'collapse 1', key: '1', children: 'first', showArrow: false },
    ]
    const wrapper = mount(<Collapse items={items}></Collapse>)

    expect(wrapper.findAll('.vc-collapse-expand-icon')).toHaveLength(0)
  })

  it('panel container dom can set event handler', async () => {
    const clickHandler = vi.fn()
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        children: <div class="target">Click this</div>,
        showArrow: false,
        // @ts-expect-error: ignore error
        onClick: clickHandler,
      },
    ]

    const wrapper = mount(
      <Collapse defaultActiveKey="1" items={items}></Collapse>,
    )

    await wrapper.find('.target').trigger('click')
    expect(clickHandler).toHaveBeenCalled()
  })

  it('falsy Panel', () => {
    const wrapper = mount(
      <Collapse>
        {null}
        <Panel header="collapse 1" key="1">
          <p>Panel 1 content</p>
        </Panel>
        {0}
        <Panel header="collapse 2" key="2">
          <p>Panel 2 content</p>
        </Panel>
        {undefined}
        {false}
        {true}
      </Collapse>,
    )
    expect(wrapper.findAll('.vc-collapse-item')).toHaveLength(2)
  })

  it('ref should work', async () => {
    const panelRef = ref()
    const items: CollapseProps['items'] = [
      { label: 'collapse 1', key: '1', children: 'first', ref: panelRef },
    ]
    const wrapper = mount(<Collapse items={items} />)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.ref).toBe(wrapper.vm.$el)
    expect(panelRef.value.ref).toBe(wrapper.find('.vc-collapse-item').element)
  })

  // https://github.com/react-component/collapse/issues/235
  it('onItemClick should work', async () => {
    const onItemClick = vi.fn()
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        children: 'first',
        onItemClick,
      },
    ]
    const wrapper = mount(<Collapse items={items}></Collapse>)
    await wrapper.find('.vc-collapse-header').trigger('click')
    expect(onItemClick).toHaveBeenCalled()
  })

  it('onItemClick should not work when collapsible is disabled', async () => {
    const onItemClick = vi.fn()
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        children: 'first',
        onItemClick,
      },
    ]
    const wrapper = mount(
      <Collapse collapsible="disabled" items={items}></Collapse>,
    )
    await wrapper.find('.vc-collapse-header').trigger('click')
    expect(onItemClick).not.toHaveBeenCalled()
  })

  it('panel style should work', () => {
    const items: CollapseProps['items'] = [
      {
        label: 'collapse 1',
        key: '1',
        children: 'first',
        style: { color: 'red' },
      },
    ]
    const wrapper = mount(<Collapse items={items}></Collapse>)
    expect(
      (wrapper.find('.vc-collapse-item').element as HTMLDivElement)?.style.color,
    ).toBe('red')
  })

  describe('props items', () => {
    const items: CollapseProps['items'] = [
      {
        key: '1',
        label: 'collapse 1',
        children: 'first',
        collapsible: 'disabled',
      },
      {
        key: '2',
        label: 'collapse 2',
        children: 'second',
        extra: <span>Extra span</span>,
      },
      {
        key: '3',
        label: 'collapse 3',
        class: 'important',
        children: 'third',
      },
    ]

    runNormalTest(
      <Collapse
        onChange={onChange}
        expandIcon={() => (
          <span>
            text
            {'>'}
          </span>
        )}
        items={items}
      />,
    )

    runAccordionTest(
      <Collapse
        onChange={onChange}
        accordion
        items={[
          {
            key: '1',
            label: 'collapse 1',
            children: 'first',
          },
          {
            key: '2',
            label: 'collapse 2',
            children: 'second',
          },
          {
            key: '3',
            label: 'collapse 3',
            children: 'third',
          },
        ]}
      />,
    )

    it('should work with onItemClick', async () => {
      const onItemClick = vi.fn()
      const wrapper = mount(
        <Collapse
          items={[
            {
              label: 'title 3',
              onItemClick,
            },
          ]}
        />,
      )
      await wrapper.find('.vc-collapse-header').trigger('click')
      expect(onItemClick).toHaveBeenCalled()
      expect(onItemClick).lastCalledWith('0')
    })

    it('should work with collapsible', async () => {
      const onItemClick = vi.fn()
      const onChangeFn = vi.fn()
      const wrapper = mount(
        <Collapse
          onChange={onChangeFn}
          items={[
            ...items.slice(0, 1),
            {
              label: 'title 3',
              onItemClick,
              collapsible: 'icon',
            },
          ]}
        />,
      )

      await wrapper.find('.vc-collapse-header').trigger('click')

      expect(onItemClick).not.toHaveBeenCalled()
      await wrapper
        .find('.vc-collapse-item:nth-child(2) .vc-collapse-expand-icon')
        .trigger('click')
      expect(onItemClick).toHaveBeenCalled()
      expect(onChangeFn).toBeCalledTimes(1)
      expect(onChangeFn).lastCalledWith(['1'])
    })

    it('should work with nested', () => {
      const wrapper = mount(
        <Collapse
          items={[
            ...items,
            {
              label: 'title 3',
              children: <Collapse items={items} />,
            },
          ]}
        />,
      )
      expect(wrapper.element.firstChild).toMatchSnapshot()
    })

    it('should not support expandIcon', () => {
      const wrapper = mount(
        <Collapse
          expandIcon={() => <i class="custom-icon">p</i>}
          items={[
            {
              label: 'title',
              expandIcon: () => <i class="custom-icon">c</i>,
            } as any,
          ]}
        />,
      )

      expect(wrapper.findAll('.custom-icon')).toHaveLength(1)
      expect(wrapper.find('.custom-icon').element?.innerHTML).toBe('p')
    })

    it('should support data- and aria- attributes', () => {
      const wrapper = mount(
        <Collapse
          data-testid="1234"
          aria-label="test"
          items={[
            {
              label: 'title',
            } as any,
          ]}
        />,
      )

      expect(
        wrapper.find('.vc-collapse').element?.getAttribute('data-testid'),
      ).toBe('1234')
      expect(
        wrapper.find('.vc-collapse').element?.getAttribute('aria-label'),
      ).toBe('test')
    })

    it('should support styles and classNames', () => {
      const customStyles = {
        header: { color: 'red' },
        body: { color: 'blue' },
        title: { color: 'green' },
        icon: { color: 'yellow' },
      }
      const customClassnames = {
        header: 'custom-header',
        body: 'custom-body',
        title: 'custom-title',
        icon: 'custom-icon',
      }

      const wrapper = mount(
        <Collapse
          activeKey={['1']}
          styles={customStyles}
          classNames={customClassnames}
          items={[
            {
              key: '1',
              label: 'title',
            },
          ]}
        />,
      )
      const headerElement = wrapper.find('.vc-collapse-header')
        .element as HTMLElement
      const bodyElement = wrapper.find('.vc-collapse-body')
        .element as HTMLElement
      const titleElement = wrapper.find('.vc-collapse-title')
        .element as HTMLElement
      const iconElement = wrapper.find('.vc-collapse-expand-icon')
        .element as HTMLElement

      // check classNames
      expect(headerElement.classList).toContain('custom-header')
      expect(bodyElement.classList).toContain('custom-body')
      expect(titleElement.classList).toContain('custom-title')
      expect(iconElement.classList).toContain('custom-icon')

      // check styles
      expect(headerElement.style.color).toBe('red')
      expect(bodyElement.style.color).toBe('blue')
      expect(titleElement.style.color).toBe('green')
      expect(iconElement.style.color).toBe('yellow')
    })
  })
})
