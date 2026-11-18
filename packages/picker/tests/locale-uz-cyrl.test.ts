import { describe, expect, it } from 'vitest'
import enUS from '../src/locale/en_US'
import uzCyrlUZ from '../src/locale/uz_Cyrl_UZ'

describe('locale uz_Cyrl_UZ', () => {
  it('provides every key of en_US', () => {
    expect(uzCyrlUZ.locale).toBe('uz_Cyrl_UZ')
    Object.keys(enUS).forEach((key) => {
      expect(uzCyrlUZ).toHaveProperty(key)
    })
  })

  it('translates panel texts', () => {
    expect(uzCyrlUZ.today).toBe('Бугун')
    expect(uzCyrlUZ.now).toBe('Ҳозир')
    expect(uzCyrlUZ.ok).toBe('ОК')
  })
})
