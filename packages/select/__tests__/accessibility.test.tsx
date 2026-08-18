import KeyCode from '@v-c/util/dist/KeyCode'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Select from '../src'

async function flushSelect() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve))
  await nextTick()
}

function keyDown(element: HTMLElement, keyCode: number) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'which', { value: keyCode })
  Object.defineProperty(event, 'keyCode', { value: keyCode })
  element.dispatchEvent(event)
}

describe('select.Accessibility virtual mode position announcement', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should have correct aria-posinset and aria-setsize in virtual mode', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        id: 'virtual-select',
        open: true,
        options: [{ value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }],
      },
    })

    await flushSelect()

    // The hidden accessibility container is the listbox itself in virtual mode
    const getHiddenOptions = () =>
      Array.from(document.querySelectorAll('#virtual-select_list div[role="option"]'))

    // Active index is 0, so the hidden container renders options 0 and 1
    let hiddenOptions = getHiddenOptions()
    expect(hiddenOptions.map(option => option.getAttribute('aria-posinset'))).toEqual([
      '1',
      '2',
    ])
    hiddenOptions.forEach((option) => {
      expect(option.getAttribute('aria-setsize')).toBe('5')
    })

    // Move active option to the middle of the list
    const input = wrapper.find('input').element
    keyDown(input, KeyCode.DOWN)
    keyDown(input, KeyCode.DOWN)
    await flushSelect()

    // Active index is 2, so the hidden container renders options 1, 2 and 3
    hiddenOptions = getHiddenOptions()
    expect(hiddenOptions.map(option => option.getAttribute('aria-posinset'))).toEqual([
      '2',
      '3',
      '4',
    ])
    hiddenOptions.forEach((option) => {
      expect(option.getAttribute('aria-setsize')).toBe('5')
    })

    wrapper.unmount()
  })

  it('aria-posinset and aria-setsize should skip group headers like native optgroup', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        id: 'virtual-select',
        open: true,
        options: [
          {
            label: 'First group',
            options: [{ value: '1' }, { value: '2' }, { value: '3' }],
          },
          {
            label: 'Second group',
            options: [{ value: '4' }, { value: '5' }, { value: '6' }],
          },
        ],
      },
    })

    await flushSelect()

    const hiddenContainer = document.querySelector('#virtual-select_list')!
    const getHiddenOptions = () =>
      Array.from(hiddenContainer.querySelectorAll('div[role="option"]'))
    const getGroupWrappers = () =>
      Array.from(hiddenContainer.querySelectorAll('div[role="group"]'))

    // Active option is the first real option (flatten index 1), so the
    // hidden container renders the first two options inside their group
    let groupWrappers = getGroupWrappers()
    expect(groupWrappers).toHaveLength(1)
    expect(groupWrappers[0].getAttribute('aria-label')).toBe('First group')

    let hiddenOptions = getHiddenOptions()
    expect(hiddenOptions.map(option => option.getAttribute('aria-posinset'))).toEqual([
      '1',
      '2',
    ])
    hiddenOptions.forEach((option) => {
      expect(option.getAttribute('aria-setsize')).toBe('6')
      expect(option.parentElement).toBe(groupWrappers[0])
    })

    // Move into the second group: positions keep counting across groups
    const input = wrapper.find('input').element
    keyDown(input, KeyCode.DOWN)
    keyDown(input, KeyCode.DOWN)
    keyDown(input, KeyCode.DOWN)
    await flushSelect()

    groupWrappers = getGroupWrappers()
    expect(groupWrappers).toHaveLength(1)
    expect(groupWrappers[0].getAttribute('aria-label')).toBe('Second group')

    hiddenOptions = getHiddenOptions()
    expect(hiddenOptions.map(option => option.getAttribute('aria-posinset'))).toEqual([
      '4',
      '5',
    ])
    hiddenOptions.forEach((option) => {
      expect(option.getAttribute('aria-setsize')).toBe('6')
      expect(option.parentElement).toBe(groupWrappers[0])
    })

    wrapper.unmount()
  })

  it('should split grouped and top-level options into separate segments', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        id: 'virtual-select',
        open: true,
        options: [
          {
            label: 'Group',
            options: [{ value: '1' }, { value: '2' }, { value: '3' }],
          },
          // Top-level option directly after a group, with no header between
          { value: '4' },
        ],
      },
    })

    await flushSelect()

    const hiddenContainer = document.querySelector('#virtual-select_list')!

    // Activate the last grouped option so the window spans the group
    // boundary: options '2', '3' (grouped) and '4' (top-level)
    const input = wrapper.find('input').element
    keyDown(input, KeyCode.DOWN)
    keyDown(input, KeyCode.DOWN)
    await flushSelect()

    // Grouped options stay wrapped; the top-level option renders bare
    const groupWrappers = Array.from(hiddenContainer.querySelectorAll('div[role="group"]'))
    expect(groupWrappers).toHaveLength(1)
    expect(groupWrappers[0].getAttribute('aria-label')).toBe('Group')
    expect(
      Array.from(groupWrappers[0].querySelectorAll('div[role="option"]')).map(option =>
        option.getAttribute('aria-posinset'),
      ),
    ).toEqual(['2', '3'])

    const topLevelOption = Array.from(
      hiddenContainer.querySelectorAll('div[role="option"]'),
    ).find(option => option.getAttribute('aria-posinset') === '4')
    expect(topLevelOption).toBeTruthy()
    expect(topLevelOption!.parentElement).toBe(hiddenContainer)
    expect(topLevelOption!.getAttribute('aria-setsize')).toBe('4')

    wrapper.unmount()
  })

  it('should use group title in aria-label', async () => {
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        id: 'virtual-select',
        open: true,
        options: [
          {
            label: 'Group',
            title: 'Group title',
            options: [{ value: '1' }, { value: '2' }],
          },
        ],
      },
    })

    await flushSelect()

    const hiddenContainer = document.querySelector('#virtual-select_list')!
    const groupWrapper = hiddenContainer.querySelector('div[role="group"]')
    expect(groupWrapper?.getAttribute('aria-label')).toBe('Group title')

    wrapper.unmount()
  })
})
