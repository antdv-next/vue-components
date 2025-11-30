import { computed } from 'vue'
import type { Component, VNode } from 'vue'
import type { SelectInputProps, SelectInputRef } from '../SelectInput'
import type { BaseSelectProps } from '../BaseSelect'

export interface ComponentsConfig {
  root?: Component | VNode | string
  input?: Component | VNode | string
}

export interface FilledComponentsConfig {
  root: any
  input: any
}

export default function useComponents(
  components?: ComponentsConfig,
  getInputElement?: BaseSelectProps['getInputElement'],
  getRawInputElement?: BaseSelectProps['getRawInputElement'],
) {
  return computed<ComponentsConfig>(() => {
    let { root, input } = components || {}

    if (getRawInputElement) {
      root = getRawInputElement()
    }

    if (getInputElement) {
      input = getInputElement()
    }

    return {
      root,
      input,
    }
  })
}
