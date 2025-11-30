import type { Component, MaybeRefOrGetter, VNode } from 'vue'
import type { BaseSelectProps } from '../BaseSelect'
import { computed, toValue } from 'vue'

export interface ComponentsConfig {
  root?: Component | VNode | string
  input?: Component | VNode | string
}

export interface FilledComponentsConfig {
  root: any
  input: any
}

export default function useComponents(
  components?: MaybeRefOrGetter<ComponentsConfig | undefined>,
  getInputElement?: MaybeRefOrGetter<BaseSelectProps['getInputElement']>,
  getRawInputElement?: MaybeRefOrGetter<BaseSelectProps['getRawInputElement']>,
) {
  return computed<ComponentsConfig>(() => {
    const componentsValue = toValue(components)
    const getInputElementValue = toValue(getInputElement)
    const getRawInputElementValue = toValue(getRawInputElement)

    let { root, input } = componentsValue || {}

    if (getRawInputElementValue) {
      root = getRawInputElementValue()
    }

    if (getInputElementValue) {
      input = getInputElementValue()
    }

    return {
      root,
      input,
    }
  })
}
