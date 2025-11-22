import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import Tooltip from '../src'
import defaultPlacements from '../src/placements'

const triggerPropsSpy = vi.fn()

vi.mock('@v-c/trigger', () => {
  const MockTrigger = defineComponent({
    name: 'MockTrigger',
    inheritAttrs: false,
    props: {
      builtinPlacements: Object,
    },
    setup(props, { slots }) {
      return () => {
        triggerPropsSpy(props)
        return slots.default?.()
      }
    },
  })

  return {
    Trigger: MockTrigger,
    default: MockTrigger,
  }
})

describe('@v-c/tooltip placements', () => {
  beforeEach(() => {
    triggerPropsSpy.mockClear()
  })

  it('forwards custom builtinPlacements into trigger', () => {
    const customPlacements = {
      custom: {
        points: ['tl', 'bl'],
        offset: [0, 0],
      },
    }

    mount(Tooltip, {
      props: {
        builtinPlacements: customPlacements as any,
        overlay: 'content',
      },
      slots: {
        default: () => <button>trigger</button>,
      },
    })

    expect(triggerPropsSpy).toHaveBeenCalled()
    const lastCall = triggerPropsSpy.mock.calls.at(-1)?.[0] ?? {}
    expect(lastCall.builtinPlacements).toStrictEqual(customPlacements)
  })

  it('falls back to default placements when prop missing', () => {
    mount(Tooltip, {
      props: {
        overlay: 'content',
      },
      slots: {
        default: () => <button>trigger</button>,
      },
    })

    const lastCall = triggerPropsSpy.mock.calls.at(-1)?.[0] ?? {}
    expect(lastCall.builtinPlacements).toBe(defaultPlacements)
  })
})
