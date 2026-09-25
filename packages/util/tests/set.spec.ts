import { describe, expect, it } from 'vitest'
import set from '../src/utils/set'

describe('set', () => {
  it('remove if undefined', () => {
    // Skip not exist path
    expect(set({}, ['notExist'], undefined, true)).toEqual({})

    // Delete value
    const source = { keep: { light: 2333, bamboo: 1 } }
    const target = set(source, ['keep', 'light'], undefined, true)
    expect(target).toEqual({ keep: { bamboo: 1 } })
    expect('light' in target.keep).toBeFalsy()
    expect(source).toEqual({ keep: { light: 2333, bamboo: 1 } })
    expect(target.keep).not.toBe(source.keep)

    // Delete array item without touching the source array
    const listSource = { list: [0, 1, 2] }
    const listTarget = set(listSource, ['list', 1], undefined, true)
    expect(1 in listTarget.list).toBeFalsy()
    expect(listSource.list).toEqual([0, 1, 2])

    // Mid path not exist
    const midTgt = set({ lv1: { lv2: {} } }, ['lv1', 'lv2', 'lv3'], undefined, true)
    expect(midTgt).toEqual({ lv1: { lv2: {} } })
    expect('lv3' in midTgt.lv1.lv2).toBeFalsy()

    // Long path not exist
    const longNotExistTgt = set({ lv1: { lv2: {} } }, ['lv1', 'lv2', 'lv3', 'lv4'], undefined, true)
    expect(longNotExistTgt).toEqual({ lv1: { lv2: {} } })
    expect('lv3' in longNotExistTgt.lv1.lv2).toBeFalsy()

    // Long path remove
    const longTgt = set(
      { lv1: { lv2: { lv3: { lv4: { lv: 5 } } } } },
      ['lv1', 'lv2', 'lv3', 'lv4'],
      undefined,
      true,
    )
    expect(longTgt).toEqual({ lv1: { lv2: { lv3: {} } } })
    expect('lv4' in longTgt.lv1.lv2.lv3).toBeFalsy()
  })

  it.each(['str', 123, true, Symbol('value'), BigInt(1)])(
    'preserves a primitive parent when removing a missing property: %s',
    (value) => {
      const source = { keep: value }
      const target = set(source, ['keep', 'light'], undefined, true)
      expect(target.keep).toBe(value)
      expect(source.keep).toBe(value)
    },
  )
})
