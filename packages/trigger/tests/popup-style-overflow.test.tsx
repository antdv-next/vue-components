import type { CSSProperties } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import Trigger from '../src'

function createComputedStyle(overrides: Partial<CSSStyleDeclaration> = {}) {
  return {
    position: 'absolute',
    height: '32px',
    width: '120px',
    transformOrigin: '50% 50% 0px',
    overflow: 'visible',
    overflowX: 'visible',
    overflowY: 'visible',
    overflowClipMargin: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    getPropertyValue: () => '',
    ...overrides,
  } as CSSStyleDeclaration
}

async function findPopupElement() {
  await nextTick()
  await nextTick()
  return document.body.querySelector('.vc-trigger-popup') as HTMLDivElement | null
}

describe('trigger popup style overflow normalization', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((node: Element) => {
        return ((node as any).__vcComputedStyle as CSSStyleDeclaration) || createComputedStyle()
      })
  })

  afterEach(() => {
    getComputedStyleSpy.mockRestore()
    document.body.innerHTML = ''
  })

  it('keeps non-overflow styles but strips overflow axis styles', async () => {
    const wrapper = mount(() => (
      <Trigger
        popupVisible
        popupStyle={{
          maxHeight: 200,
          overflowX: 'hidden',
          overflowY: 'scroll',
          'overflow-x': 'clip',
          'overflow-y': 'auto',
        } as any}
        popup={<div>popup</div>}
      >
        <button type="button">trigger</button>
      </Trigger>
    ), {
      attachTo: document.body,
    })

    const popupElement = await findPopupElement()
    expect(popupElement).not.toBeNull()
    expect(popupElement!.style.maxHeight).toBe('200')
    expect(popupElement!.style.overflowX).toBe('')
    expect(popupElement!.style.overflowY).toBe('')
    expect(popupElement!.style.getPropertyValue('overflow-x')).toBe('')
    expect(popupElement!.style.getPropertyValue('overflow-y')).toBe('')

    wrapper.unmount()
  })

  it('keeps overflow shorthand but strips overflow axis styles', async () => {
    const wrapper = mount(() => (
      <Trigger
        popupVisible
        popupStyle={{
          overflow: 'auto',
          overflowX: 'hidden',
          overflowY: 'scroll',
          'overflow-x': 'clip',
          'overflow-y': 'auto',
        } as any}
        popup={<div>popup</div>}
      >
        <button type="button">trigger</button>
      </Trigger>
    ), {
      attachTo: document.body,
    })

    const popupElement = await findPopupElement()
    expect(popupElement).not.toBeNull()
    expect(popupElement!.style.overflow).toBe('auto')
    expect(popupElement!.style.overflowX).toBe('')
    expect(popupElement!.style.overflowY).toBe('')
    expect(popupElement!.style.getPropertyValue('overflow-x')).toBe('')
    expect(popupElement!.style.getPropertyValue('overflow-y')).toBe('')

    wrapper.unmount()
  })

  it('does not re-apply overflow axis styles on reactive popupStyle updates', async () => {
    const popupStyleRef = ref<CSSProperties>({
      maxHeight: 180,
      overflowY: 'scroll',
    })

    const Host = defineComponent(() => {
      return () => (
        <Trigger
          popupVisible
          popupStyle={popupStyleRef.value}
          popup={<div>popup</div>}
        >
          <button type="button">trigger</button>
        </Trigger>
      )
    })

    const wrapper = mount(Host, {
      attachTo: document.body,
    })

    let popupElement = await findPopupElement()
    expect(popupElement).not.toBeNull()
    expect(popupElement!.style.maxHeight).toBe('180')
    expect(popupElement!.style.overflowY).toBe('')

    popupStyleRef.value = {
      maxHeight: 220,
      overflow: 'auto',
      overflowX: 'hidden',
      overflowY: 'scroll',
      'overflow-x': 'clip',
      'overflow-y': 'auto',
    } as any

    popupElement = await findPopupElement()
    expect(popupElement!.style.maxHeight).toBe('220')
    expect(popupElement!.style.overflow).toBe('auto')
    expect(popupElement!.style.overflowX).toBe('')
    expect(popupElement!.style.overflowY).toBe('')
    expect(popupElement!.style.getPropertyValue('overflow-x')).toBe('')
    expect(popupElement!.style.getPropertyValue('overflow-y')).toBe('')

    wrapper.unmount()
  })
})
