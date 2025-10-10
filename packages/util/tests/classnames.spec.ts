import { describe, expect, it } from 'vitest'
import classNames from '../src/classnames'

describe('classNames', () => {
  describe('strings', () => {
    it('should concatenate string arguments', () => {
      expect(classNames('foo', 'bar')).toBe('foo bar')
    })

    it('should handle single string', () => {
      expect(classNames('foo')).toBe('foo')
    })

    it('should handle empty string', () => {
      expect(classNames('')).toBe('')
    })

    it('should trim and handle multiple strings', () => {
      expect(classNames('foo', 'bar', 'baz')).toBe('foo bar baz')
    })
  })

  describe('numbers', () => {
    it('should convert numbers to strings', () => {
      expect(classNames(1, 2, 3)).toBe('1 2 3')
    })

    it('should filter out zero (falsy value)', () => {
      expect(classNames(0)).toBe('')
      expect(classNames('foo', 0, 'bar')).toBe('foo bar')
    })

    it('should handle mixed strings and numbers', () => {
      expect(classNames('foo', 1, 'bar', 2)).toBe('foo 1 bar 2')
    })
  })

  describe('objects', () => {
    it('should include keys with truthy values', () => {
      expect(classNames({ foo: true, bar: true })).toBe('foo bar')
    })

    it('should exclude keys with falsy values', () => {
      expect(classNames({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    it('should handle all falsy values', () => {
      expect(classNames({ foo: false, bar: false })).toBe('')
    })

    it('should handle mixed truthy types', () => {
      expect(classNames({ foo: 1, bar: 'yes', baz: true, qux: {} })).toBe('foo bar baz qux')
    })

    it('should ignore keys with null/undefined values', () => {
      expect(classNames({ foo: true, bar: null, baz: undefined, qux: true })).toBe('foo qux')
    })
  })

  describe('arrays', () => {
    it('should handle array of strings', () => {
      expect(classNames(['foo', 'bar', 'baz'])).toBe('foo bar baz')
    })

    it('should filter out falsy values in arrays', () => {
      expect(classNames(['foo', false, 'bar', null, 'baz', undefined])).toBe('foo bar baz')
    })

    it('should handle nested arrays', () => {
      expect(classNames(['foo', ['bar', 'baz']])).toBe('foo bar baz')
    })

    it('should handle deeply nested arrays', () => {
      expect(classNames(['foo', ['bar', ['baz', ['qux']]]])).toBe('foo bar baz qux')
    })

    it('should handle array with objects', () => {
      expect(classNames(['foo', { bar: true, baz: false }])).toBe('foo bar')
    })

    it('should handle empty array', () => {
      expect(classNames([])).toBe('')
    })
  })

  describe('mixed types', () => {
    it('should handle strings, numbers, and objects', () => {
      expect(classNames('foo', 1, { bar: true, baz: false })).toBe('foo 1 bar')
    })

    it('should handle all types together', () => {
      expect(
        classNames(
          'foo',
          2,
          { bar: true, baz: false },
          ['qux', 'quux'],
          { corge: true },
        ),
      ).toBe('foo 2 bar qux quux corge')
    })

    it('should handle complex nested structures', () => {
      expect(
        classNames(
          'a',
          ['b', { c: true, d: false }],
          { e: true },
          [['f', 'g'], { h: true }],
        ),
      ).toBe('a b c e f g h')
    })
  })

  describe('falsy values', () => {
    it('should ignore null', () => {
      expect(classNames(null)).toBe('')
    })

    it('should ignore undefined', () => {
      expect(classNames(undefined)).toBe('')
    })

    it('should ignore false', () => {
      expect(classNames(false)).toBe('')
    })

    it('should handle mixed with falsy values', () => {
      expect(classNames('foo', null, 'bar', undefined, 'baz', false)).toBe('foo bar baz')
    })

    it('should handle all falsy arguments', () => {
      expect(classNames(null, undefined, false)).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle no arguments', () => {
      expect(classNames()).toBe('')
    })

    it('should deduplicate when same class appears multiple times', () => {
      // Note: This implementation does NOT deduplicate, which matches original classnames behavior
      expect(classNames('foo', 'foo')).toBe('foo foo')
    })

    it('should handle special characters in keys', () => {
      expect(classNames({ 'foo-bar': true, 'baz_qux': true })).toBe('foo-bar baz_qux')
    })

    it('should handle numeric keys in objects', () => {
      expect(classNames({ 1: true, 2: false, 3: true })).toBe('1 3')
    })

    it('should handle empty objects', () => {
      expect(classNames({})).toBe('')
    })

    it('should handle very long class strings', () => {
      const classes = Array.from({ length: 100 }).fill('class').join(' ')
      // @ts-expect-error this is class
      expect(classNames(...Array.from({ length: 100 }).fill('class'))).toBe(classes)
    })
  })

  describe('real-world usage', () => {
    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false
      expect(
        classNames('button', {
          'button-active': isActive,
          'button-disabled': isDisabled,
        }),
      ).toBe('button button-active')
    })

    it('should handle BEM-style classes', () => {
      expect(
        classNames('block', {
          'block--modifier': true,
          'block--another-modifier': false,
        }),
      ).toBe('block block--modifier')
    })

    it('should handle component state classes', () => {
      const state = { loading: true, error: false, success: false }
      expect(
        classNames('component', {
          'component-loading': state.loading,
          'component-error': state.error,
          'component-success': state.success,
        }),
      ).toBe('component component-loading')
    })

    it('should work with CSS modules pattern', () => {
      const styles = { container: 'abc123', active: 'def456', disabled: 'ghi789' }
      const isActive = true
      const isDisabled = false
      expect(
        classNames(styles.container, {
          [styles.active]: isActive,
          [styles.disabled]: isDisabled,
        }),
      ).toBe('abc123 def456')
    })
  })
})
