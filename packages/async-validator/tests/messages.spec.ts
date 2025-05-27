import { describe, expect, it } from 'vitest'
import Schema from '../src'

describe('messages', () => {
  it('can call messages', () => {
    const messages = {
      required(f: unknown) {
        return `${f} required!`
      },
    }
    const schema = new Schema({
      v: {
        required: true,
      },
      v2: {
        type: 'array',
      },
    })
    schema.messages(messages)
    schema.validate(
      {
        v: '',
        v2: '1',
      },
      (errors) => {
        expect(errors?.length).toBe(2)
        expect(errors?.[0].message).toBe('v required!')
        expect(errors?.[1].message).toBe('v2 is not an array')
        expect(Object.keys(messages).length).toBe(1)
      },
    )
  })

  it('can use options.messages', () => {
    const messages = {
      required(f: unknown) {
        return `${f} required!`
      },
    }
    const schema = new Schema({
      v: {
        required: true,
      },
      v2: {
        type: 'array',
      },
    })
    schema.validate(
      {
        v: '',
        v2: '1',
      },
      {
        messages,
      },
      (errors) => {
        expect(errors?.length).toBe(2)
        expect(errors?.[0].message).toBe('v required!')
        expect(errors?.[1].message).toBe('v2 is not an array')
        expect(Object.keys(messages).length).toBe(1)
      },
    )
  })

  it('messages with parameters', () => {
    const messages = {
      required: 'Field %s required!',
    }
    const schema = new Schema({
      v: {
        required: true,
      },
    })
    schema.messages(messages)
    schema.validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors).toBeTruthy()
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('Field v required!')
        expect(Object.keys(messages).length).toBe(1)
      },
    )
  })

  it('messages can be without parameters', () => {
    const messages = {
      required: 'required!',
    }
    const schema = new Schema({
      v: {
        required: true,
      },
    })
    schema.messages(messages)
    schema.validate(
      {
        v: '',
      },
      (errors) => {
        expect(errors).toBeTruthy()
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe('required!')
        expect(Object.keys(messages).length).toBe(1)
        expect(messages.required).toBe('required!')
      },
    )
  })

  it('message can be a function', () => {
    const message = 'this is a function'
    new Schema({
      v: {
        required: true,
        message: () => message,
      },
    }).validate(
      {
        v: '', // provide empty value, this will trigger the message.
      },
      (errors) => {
        expect(errors).toBeTruthy()
        expect(errors?.length).toBe(1)
        expect(errors?.[0].message).toBe(message)
      },
    )
  })
})
