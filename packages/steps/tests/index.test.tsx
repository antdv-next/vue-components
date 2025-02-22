import type { VueNode } from '@v-c/util/dist/type'
import type { VNode } from 'vue'
import type { Step } from '../src'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vitest } from 'vitest'
import { cloneVNode, defineComponent, ref } from 'vue'
import Steps from '../src'

describe('steps', () => {
  describe('render', () => {
    let description = 'hello'

    const renderSteps = (props: Record<string, unknown>) => {
      return mount(
        <Steps
          items={[
            {
              title: '已完成',
            },
            {
              title: '进行中',
            },
            {
              title: '待运行',
            },
            {
              title: '待运行',
            },
          ]}
          {...props}
        />,
      )
    }

    it('render corrently', () => {
      const wrapper = renderSteps({})
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders without items', () => {
      expect(() => {
        renderSteps({ items: undefined })
      }).not.toThrow()
    })

    it('renders current correctly', () => {
      const wrapper = renderSteps({ current: 2 })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders status correctly', () => {
      const wrapper = renderSteps({ current: 2, status: 'error' })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders vertical correctly', () => {
      const wrapper = renderSteps({ direction: 'vertical' })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders labelPlacement correctly', () => {
      const wrapper = renderSteps({ labelPlacement: 'vertical' })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders progressDot correctly', () => {
      const wrapper = renderSteps({ progressDot: true })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders progressDot function correctly', () => {
      const wrapper = renderSteps({ progressDot: () => <span>a</span> })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders stepIcon function correctly', () => {
      const wrapper = renderSteps({ stepIcon: () => <span>a</span> })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders step with description', () => {
      const wrapper = mount(
        <Steps
          items={[
            {
              title: '已完成',
              description,
            },
            {
              title: '进行中',
              description,
            },
            {
              title: '待运行',
              description,
            },
            {
              title: '待运行',
              description,
            },
          ]}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders step with description and status', () => {
      const wrapper = mount(
        <Steps
          items={[
            {
              title: '已完成',
              description,
              status: 'wait',
            },
            {
              title: '进行中',
              description,
              status: 'wait',
            },
            {
              title: '待运行',
              description,
              status: 'process',
            },
            {
              title: '待运行',
              description,
              status: 'finish',
            },
          ]}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders with falsy children', () => {
      const wrapper = mount(
        <Steps
          items={[
            {
              title: '已完成',
              description: 'xx',
              status: 'wait',
            },
            {
              title: '进行中',
              description: 'xx',
              status: 'wait',
              subTitle: '剩余 00:00:07',
            },
            undefined,
            {
              title: '待运行',
              description: 'xx',
              status: 'process',
            },
            false,
            {
              title: '待运行',
              description: 'xx',
              status: 'finish',
              disabled: true,
            },
            null,
          ]}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders step with tailContent', () => {
      const wrapper = mount(
        <Steps
          items={[
            {
              title: '已完成',
              description,
              tailContent: 'text',
            },
            {
              title: '进行中',
              description,
              tailContent: <div>content</div>,
            },
            {
              title: '待运行',
              description,
              tailContent: 3,
            },
            {
              title: '待运行',
              description,
              tailContent: 'text',
            },
          ]}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders step with type navigation', () => {
      description = 'This is a description.'
      const wrapper = mount(
        <Steps
          type="navigation"
          current={1}
          onChange={() => {}}
          items={[
            {
              title: 'Step 1',
              subTitle: '剩余 00:00:05 超长隐藏',
              description,
            },
            {
              title: 'Step 2',
              description,
            },
            {
              title: 'Step 3',
              description,
              disabled: true,
            },
          ]}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders step with type inline', () => {
      description = 'This is a description.'
      const wrapper = mount(
        <Steps
          type="inline"
          current={1}
          onChange={() => {}}
          items={[
            {
              title: 'Step 1',
              description,
            },
            {
              title: 'Step 2',
              description,
            },
            {
              title: 'Step 3',
              description,
              disabled: true,
            },
          ]}
          itemRender={(item: InstanceType<typeof Step>['$props'], stepItem: VueNode) => cloneVNode(stepItem as VNode, { title: item.description })}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })

    function getFinishIcon() {
      const path
          = 'M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.'
          + '5-42.4-84-55.5-32.5-13.5-66.9-20.3-102.4-20.3-49.3 0-97.4 13.5-139'
          + '.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5'
          + '-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 '
          + '55.5-24.4 23.9-43.5 51.7-56.9 82.8-13.9 32.3-21 66.6-21 101.9 0 33'
          + '.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99'
          + '.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.'
          + '7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 10'
          + '1.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 '
          + '20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z'
      return (
        <svg
          width="1em"
          height="1em"
          fill="currentColor"
          viewBox="0 0 1024 1024"
          style={{ verticalAlign: '-.125em' }}
        >
          <path d={path} />
        </svg>
      )
    }

    function getErrorIcon() {
      const path1
          = 'M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229'
          + '.2 512-512S794.8 0 512 0zm311.1 823.1c-40.4 40.4-87.5 72.2-139.9 9'
          + '4.3C629 940.4 571.4 952 512 952s-117-11.6-171.2-34.5c-52.4-22.2-99'
          + '.4-53.9-139.9-94.3-40.4-40.4-72.2-87.5-94.3-139.9C83.6 629 72 571.'
          + '4 72 512s11.6-117 34.5-171.2c22.2-52.4 53.9-99.4 94.3-139.9 40.4-4'
          + '0.4 87.5-72.2 139.9-94.3C395 83.6 452.6 72 512 72s117 11.6 171.2 3'
          + '4.5c52.4 22.2 99.4 53.9 139.9 94.3 40.4 40.4 72.2 87.5 94.3 139.9C'
          + '940.4 395 952 452.6 952 512s-11.6 117-34.5 171.2c-22.2 52.4-53.9 9'
          + '9.5-94.4 139.9z'
      const path2
          = 'M640.3 765.5c-19.9 0-36-16.1-36-36 0-50.9-41.4-92.3-92'
          + '.3-92.3s-92.3 41.4-92.3 92.3c0 19.9-16.1 36-36 36s-36-16.1-36-36c0'
          + '-90.6 73.7-164.3 164.3-164.3s164.3 73.7 164.3 164.3c0 19.9-16.1 36'
          + '-36 36zM194.2 382.4a60 60 0 1 0 120 0 60 60 0 1 0-120 0zM709.5 382'
          + '.4a60 60 0 1 0 120 0 60 60 0 1 0-120 0z'
      return (
        <svg
          width="1em"
          height="1em"
          fill="currentColor"
          viewBox="0 0 1024 1024"
          style={{ verticalAlign: '-.125em' }}
        >
          <path d={path1} />
          <path d={path2} />
        </svg>
      )
    }
    it('should render svg finishIcon and errorIcon correctly', () => {
      const icons = {
        finish: getFinishIcon(),
        error: getErrorIcon(),
      }
      const wrapper = mount(
        <Steps
          current={1}
          status="error"
          icons={icons}
          items={[
            {
              title: 'Finished',
              description: 'This is a description',
              icon: 'apple',
            },
            {
              title: 'In Process',
              description: 'This is a description',
            },
            {
              title: 'Waiting',
              description: 'This is a description',
            },
          ]}
        />,
      )
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  it('should render customIcon correctly', () => {
    const Icon = defineComponent({
      props: {
        type: {
          type: String,
          default: undefined,
        },
      },
      setup(props) {
        return () => <i class={`rcicon rcicon-${props.type}`} />
      },
    })

    const wrapper = mount(
      <Steps
        current={0}

        items={[
          {
            title: '步骤1',
            icon: <Icon type="cloud" />,
          },
          {
            title: '步骤2',
            icon: 'apple',
          },
          {
            title: '步骤3',
            icon: 'github',
          },
        ]}
      />,
    )

    expect(wrapper.element).toMatchSnapshot()
  })

  it('onChange', async () => {
    const onChange = vitest.fn()
    const wrapper = mount(
      <Steps
        onChange={onChange}
        items={[
          {
            title: '已完成',
          },
          {
            title: '进行中',
          },
          {
            title: '待运行',
          },
          {
            title: '待运行',
          },
        ]}
      />,
    )

    const el = wrapper.findAll('.vc-steps-item-container')
    await el?.[1].trigger('click')
    expect(onChange).toHaveBeenCalled()
  })

  it('items out of render function', async () => {
    const items = [
      {
        title: '已完成',
      },
      {
        title: '进行中',
      },
    ]

    const current = ref(0)
    const onChange = (val: number) => {
      current.value = val
    }
    const wrapper = mount(
      <Steps current={current.value} onChange={onChange} items={items} key={current.value} />,
    )

    await wrapper.findAll('.vc-steps-item-container')?.[1].trigger('click')
    await wrapper.setProps({ current: current.value })
    const el = wrapper.findAll('.vc-steps-item')?.[1]
    expect(
      el?.element.classList.value.includes('vc-steps-item-process'),
    ).toBeTruthy()
  })

  it('onClick', async () => {
    const onClick = vitest.fn()
    const onChange = vitest.fn()
    const wrapper = mount(
      <Steps
        onChange={onChange}
        items={[
          {
            title: '已完成',
            onClick,
          },
          {
            title: '进行中',
          },
          {
            title: '待运行',
          },
          {
            title: '待运行',
          },
        ]}
      />,
    )

    await wrapper.find('.vc-steps-item-container').trigger('click')
    expect(onClick).toHaveBeenCalled()
  })

  it('disabled', async () => {
    const onChange = vitest.fn()
    const wrapper = mount(
      <Steps
        onChange={onChange}
        items={[
          {},
          {},
          {
            disabled: true,
          },
        ]}
      />,
    )

    await wrapper.findAll('.vc-steps-item-container')?.[2].trigger('click')
    expect(onChange).not.toBeCalled()
  })

  it('key board support', async () => {
    const onChange = vitest.fn()
    const wrapper = mount(
      <Steps
        current={0}
        onChange={onChange}
        items={[
          {
            title: 'Finished',
            description: 'This is a description',
          },
          {
            title: 'Waiting',
            description: 'This is a description',
          },
        ]}
      />,
    )

    await wrapper.findAll('[role="button"]')?.[1].trigger('keydown', { keyCode: 13 })
    expect(onChange).toHaveBeenCalled()
  })
})
