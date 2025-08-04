import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Upload from '../src'

describe('upload', () => {
  it('with id', () => {
    const wrapper = mount(Upload, {
      props: {
        id: 'bamboo',
      },
    })
    expect(wrapper.find('input').element.id).toBe('bamboo')
  })
  it('with name', () => {
    const wrapper = mount(Upload, {
      props: {
        name: 'bamboo',
      },
    })
    expect(wrapper.find('input').element.name).toBe('bamboo')
  })
  it('should pass through data & aria attributes', () => {
    const wrapper = mount(Upload, {
      props: {
        'data-testid': 'data-testid',
        'data-my-custom-attr': 'custom data attribute',
        'aria-label': 'Upload a file',
      },
    })
    const input = wrapper.find('input').element
    expect(input.getAttribute('data-testid')).toBe('data-testid')
    expect(input.getAttribute('data-my-custom-attr')).toBe('custom data attribute')
    expect(input.getAttribute('aria-label')).toBe('Upload a file')
  })
  it('should pass through role attributes', () => {
    const wrapper = mount(Upload, {
      props: {
        role: 'button',
      },
    })
    const input = wrapper.find('input').element
    expect(input.getAttribute('role')).toBe('button')
  })
})
