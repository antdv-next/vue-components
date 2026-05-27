import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Switch from '../src'

describe('switch event handlers', () => {
  it('invokes onChange / onClick / onUpdate:checked on toggle', async () => {
    const onChange = vi.fn()
    const onClick = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Switch
        onChange={onChange}
        onClick={onClick}
        {...{ 'onUpdate:checked': onUpdate }}
      />
    ))
    await wrapper.find('button').trigger('click')
    expect(onChange).toHaveBeenCalledWith(true, expect.any(MouseEvent))
    expect(onClick).toHaveBeenCalledWith(true, expect.any(MouseEvent))
    expect(onUpdate).toHaveBeenCalledWith(true)
  })

  it('fires click handlers exactly once per click', async () => {
    const onClick = vi.fn()
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Switch
        onChange={onChange}
        onClick={onClick}
        {...{ 'onUpdate:checked': onUpdate }}
      />
    ))
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('does not leak event handlers onto the DOM button as attributes', () => {
    const wrapper = mount(() => (
      <Switch
        onChange={() => {}}
        onClick={() => {}}
        onKeyDown={() => {}}
        {...{ 'onUpdate:checked': () => {} }}
      />
    ))
    const btn = wrapper.find('button').element as HTMLElement
    expect(btn.getAttribute('onChange')).toBeNull()
    expect(btn.getAttribute('onUpdate:checked')).toBeNull()
    expect(btn.getAttribute('onKeyDown')).toBeNull()
  })
})
