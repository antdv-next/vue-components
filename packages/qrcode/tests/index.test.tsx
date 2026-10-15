import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { QRCodeCanvas, QRCodeSVG } from '../src'

describe('qrcode render', () => {
  it('basic Render', () => {
    const wrapper = mount({
      render() {
        return <QRCodeCanvas value="https://www.baidu.com" />
      },
    })
    const wrapper2 = mount({
      render() {
        return <QRCodeSVG value="https://www.baidu.com" />
      },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper2.find('svg').exists()).toBe(true)
  })

  it('should pass aria attrs to root svg element', () => {
    const wrapper = mount({
      render() {
        return <QRCodeSVG value="https://www.baidu.com" aria-label="Test QR Code" />
      },
    })
    expect(wrapper.find('svg').attributes('aria-label')).toBe('Test QR Code')
  })

  it('should pass aria attrs to root canvas element', () => {
    const wrapper = mount({
      render() {
        return <QRCodeCanvas value="https://www.baidu.com" aria-label="Test QR Code" />
      },
    })
    expect(wrapper.find('canvas').attributes('aria-label')).toBe('Test QR Code')
  })
})
