import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Checkbox from '../src'

describe('checkbox input attributes', () => {
  it('spreads name/id/required/tabIndex/value onto the inner input instead of the wrapper span', () => {
    const wrapper = mount(() => (
      <Checkbox
        id="agree"
        name="agree"
        required
        tabIndex={3}
        value="yes"
      />
    ))
    const input = wrapper.find('input').element as HTMLInputElement
    const span = wrapper.find('span').element

    expect(input.id).toBe('agree')
    expect(input.name).toBe('agree')
    expect(input.required).toBe(true)
    expect(input.tabIndex).toBe(3)
    expect(input.value).toBe('yes')
    expect(span.id).toBe('')
  })

  it('supports autoFocus on the inner input', () => {
    const wrapper = mount(() => <Checkbox autoFocus />, { attachTo: document.body })
    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })
})

describe('checkbox focus / blur', () => {
  it('fires user onFocus/onBlur listeners bound on the inner input', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const wrapper = mount(() => (
      <Checkbox onFocus={onFocus} onBlur={onBlur} />
    ))

    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})

describe('checkbox form integration', () => {
  it('submits checked state with name/value', async () => {
    const wrapper = mount(() => (
      <form>
        <Checkbox name="agree" value="yes" />
      </form>
    ))
    const form = wrapper.find('form').element as HTMLFormElement

    await wrapper.find('input').setValue()
    expect(new FormData(form).get('agree')).toBe('yes')
  })

  it('submits "on" by default when no value prop is given', async () => {
    const wrapper = mount(() => (
      <form>
        <Checkbox name="agree" />
      </form>
    ))
    const form = wrapper.find('form').element as HTMLFormElement

    await wrapper.find('input').setValue()
    expect(new FormData(form).get('agree')).toBe('on')
  })

  it('makes required constraint validation work on the inner input', () => {
    const wrapper = mount(() => (
      <form>
        <Checkbox name="agree" required />
      </form>
    ))
    const input = wrapper.find('input').element as HTMLInputElement

    expect(input.checkValidity()).toBe(false)
    input.checked = true
    expect(input.checkValidity()).toBe(true)
  })
})

describe('checkbox base behavior', () => {
  it('toggles checked state and emits change / update:checked', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(() => (
      <Checkbox
        onChange={onChange}
        {...{ 'onUpdate:checked': onUpdate }}
      />
    ))

    await wrapper.find('input').setValue()
    expect(wrapper.find('span').classes()).toContain('vc-checkbox-checked')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith(true)

    await wrapper.find('input').setValue(false)
    expect(onUpdate).toHaveBeenLastCalledWith(false)
  })

  it('keeps class/style/title on the wrapper span', () => {
    const wrapper = mount(() => (
      <Checkbox
        class="my-checkbox"
        style={{ color: 'red' }}
        title="tip"
        name="agree"
      />
    ))
    const span = wrapper.find('span')

    expect(span.classes()).toContain('my-checkbox')
    expect(span.attributes('style')).toContain('color: red')
    expect(span.attributes('title')).toBe('tip')
    expect(wrapper.find('input').classes()).toContain('vc-checkbox-input')
  })
})
