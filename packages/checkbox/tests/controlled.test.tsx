import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import Checkbox from '../src'

enableAutoUnmount(afterEach)

describe('controlled checked state', () => {
  it.each([false, true])('restores checked=%s without suppressing events', async (checked) => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(Checkbox, {
      attachTo: document.body,
      props: { checked, onChange, 'onUpdate:checked': onUpdate },
    })
    const input = wrapper.find<HTMLInputElement>('input')

    for (let attempt = 1; attempt <= 2; attempt++) {
      input.element.click()
      await nextTick()

      expect(input.element.checked).toBe(checked)
      expect(wrapper.classes('vc-checkbox-checked')).toBe(checked)
      expect(onChange).toHaveBeenCalledTimes(attempt)
      expect(onChange.mock.calls[attempt - 1][0].target.checked).toBe(!checked)
      expect(onUpdate).toHaveBeenLastCalledWith(!checked)
    }

    await wrapper.setProps({ checked: !checked })
    expect(input.element.checked).toBe(!checked)
  })

  it('restores a standalone unchecked radio', async () => {
    const wrapper = mount(Checkbox, { attachTo: document.body, props: { type: 'radio', checked: false } })
    const input = wrapper.find<HTMLInputElement>('input')

    input.element.click()
    await nextTick()
    expect(input.element.checked).toBe(false)
  })

  it.each(['checkbox', 'radio'])('accepts v-model:checked updates for %s', async (type) => {
    const checked = ref(false)
    const wrapper = mount(() => <Checkbox type={type} v-model:checked={checked.value} />, { attachTo: document.body })
    const input = wrapper.find<HTMLInputElement>('input')

    input.element.click()
    await nextTick()
    expect(checked.value).toBe(true)
    expect(input.element.checked).toBe(true)
    expect(wrapper.classes()).toContain('vc-checkbox-checked')
  })

  it('allows the parent to accept a change later', async () => {
    const checked = ref(false)
    const wrapper = mount(() => <Checkbox checked={checked.value} />, { attachTo: document.body })
    const input = wrapper.find<HTMLInputElement>('input')

    input.element.click()
    await nextTick()
    expect(input.element.checked).toBe(false)

    checked.value = true
    await nextTick()
    expect(input.element.checked).toBe(true)
  })

  it.each([false, true])('preserves uncontrolled defaultChecked=%s', async (defaultChecked) => {
    const wrapper = mount(Checkbox, { attachTo: document.body, props: { defaultChecked } })
    const input = wrapper.find<HTMLInputElement>('input')

    input.element.click()
    await nextTick()
    expect(input.element.checked).toBe(!defaultChecked)
    expect(wrapper.classes('vc-checkbox-checked')).toBe(!defaultChecked)
  })

  it('does not emit changes for disabled inputs', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const wrapper = mount(Checkbox, {
      attachTo: document.body,
      props: {
        'checked': false,
        'disabled': true,
        onChange,
        'onUpdate:checked': onUpdate,
      },
    })
    const input = wrapper.find<HTMLInputElement>('input')

    input.element.click()
    await nextTick()
    expect(input.element.checked).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('handles unmounting before restoration', async () => {
    const visible = ref(true)
    const wrapper = mount(() => (
      <div>
        {visible.value && <Checkbox checked={false} onChange={() => { visible.value = false }} />}
      </div>
    ), { attachTo: document.body })

    wrapper.find<HTMLInputElement>('input').element.click()
    await nextTick()
    expect(wrapper.find('input').exists()).toBe(false)
  })
})

describe('native radio groups', () => {
  it.each(['group', 'group"[special]\\name'])('restores the previous selection for name=%s', async (name) => {
    const wrapper = mount(() => (
      <div>
        <Checkbox type="radio" name={name} checked />
        <Checkbox type="radio" name={name} checked={false} />
      </div>
    ), { attachTo: document.body })
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    for (let attempt = 0; attempt < 2; attempt++) {
      inputs[1].element.click()
      await nextTick()
      expect(inputs.map(input => input.element.checked)).toEqual([true, false])
    }
  })

  it('restores radios in a detached tree', async () => {
    const wrapper = mount(() => (
      <div>
        <Checkbox type="radio" name="detached" checked />
        <Checkbox type="radio" name="detached" checked={false} />
      </div>
    ))
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    inputs[1].element.click()
    // jsdom 22 toggles detached radios but does not dispatch their change event.
    await inputs[1].trigger('change')
    await nextTick()
    expect(inputs.map(input => input.element.checked)).toEqual([true, false])
  })

  it('accepts a new selection from the parent', async () => {
    const value = ref('a')
    const wrapper = mount(() => (
      <div>
        {['a', 'b'].map(option => (
          <Checkbox
            type="radio"
            name="model"
            value={option}
            checked={value.value === option}
            onChange={() => { value.value = option }}
          />
        ))}
      </div>
    ), { attachTo: document.body })
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    inputs[1].element.click()
    await nextTick()
    expect(value.value).toBe('b')
    expect(inputs.map(input => input.element.checked)).toEqual([false, true])
  })

  it('leaves uncontrolled radio groups uncontrolled', async () => {
    const wrapper = mount(() => (
      <div>
        <Checkbox type="radio" name="uncontrolled" defaultChecked />
        <Checkbox type="radio" name="uncontrolled" />
      </div>
    ), { attachTo: document.body })
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    inputs[1].element.click()
    await nextTick()
    expect(inputs.map(input => input.element.checked)).toEqual([false, true])
  })

  it('does not restore another form or radio name', async () => {
    const wrapper = mount(() => (
      <div>
        <form>
          <Checkbox type="radio" name="scoped" checked />
          <Checkbox type="radio" name="scoped" checked={false} />
          <Checkbox type="radio" name="other" checked />
        </form>
        <form>
          <Checkbox type="radio" name="scoped" checked />
        </form>
      </div>
    ), { attachTo: document.body })
    const inputs = wrapper.findAll<HTMLInputElement>('input')
    // These unrelated native changes must not be restored by another group.
    inputs[2].element.checked = false
    inputs[3].element.checked = false

    inputs[1].element.click()
    await nextTick()
    expect(inputs.map(input => input.element.checked)).toEqual([true, false, false, false])
  })

  it('includes radios associated through the form attribute', async () => {
    const wrapper = mount(() => (
      <div>
        <form id="external-radio-form">
          <Checkbox type="radio" name="external" checked />
        </form>
        <Checkbox type="radio" name="external" form="external-radio-form" checked={false} />
      </div>
    ), { attachTo: document.body })
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    inputs[1].element.click()
    await nextTick()
    expect(inputs.map(input => input.element.checked)).toEqual([true, false])
  })

  it('uses the current radio name after it changes', async () => {
    const name = ref('before')
    const wrapper = mount(() => (
      <div>
        <Checkbox type="radio" name={name.value} checked />
        <Checkbox type="radio" name={name.value} checked={false} />
      </div>
    ), { attachTo: document.body })
    const inputs = wrapper.findAll<HTMLInputElement>('input')

    name.value = 'after'
    await nextTick()
    inputs[1].element.click()
    await nextTick()
    expect(inputs.map(input => input.element.checked)).toEqual([true, false])
  })

  it('restores shadow-root radios without affecting the document group', async () => {
    const outside = mount(() => <Checkbox type="radio" name="shadow" checked />, { attachTo: document.body })
    const outsideInput = outside.find<HTMLInputElement>('input').element
    outsideInput.checked = false
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    const target = document.createElement('div')
    shadow.appendChild(target)

    try {
      const wrapper = mount(() => (
        <div>
          <Checkbox type="radio" name="shadow" checked />
          <Checkbox type="radio" name="shadow" checked={false} />
        </div>
      ), { attachTo: target })
      const inputs = wrapper.findAll<HTMLInputElement>('input')

      inputs[1].element.click()
      await nextTick()
      expect(inputs.map(input => input.element.checked)).toEqual([true, false])
      expect(outsideInput.checked).toBe(false)
    }
    finally {
      host.remove()
    }
  })
})
