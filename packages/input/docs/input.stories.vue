<script setup lang="ts">
import Addon from './addon'
import AllowClear from './allow-clear'
import Basic from './basic'
import PrefixSuffix from './prefix-suffix'
import ShowCount from './show-count'

import './assets/index.less'
</script>

<template>
  <Story title="Input">
    <Variant title="addon">
      <Addon />
    </Variant>
    <Variant title="allow-clear">
      <AllowClear />
    </Variant>
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="prefix-suffix">
      <PrefixSuffix />
    </Variant>
    <Variant title="show-count">
      <ShowCount />
    </Variant>
  </Story>
</template>

<style scoped>

</style>

<docs lang="md">
| Property              | Type                                                                               | Default  | Description                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prefixCls             | string                                                                             | vc-input |                                                                                                                                                                     |
| affixWrapperClassName | string                                                                             | -        | className with 'vc-input-affix-wrapper'                                                                                                                             |
| groupClassName        | string                                                                             | -        | className with 'vc-input-group-wrapper'                                                                                                                             |
| wrapperClassName      | string                                                                             | -        | className with 'vc-input-wrapper'                                                                                                                                   |
| addonAfter            | Slot                                                                          | -        | The label text displayed after (on the right side of) the input field                                                                                               |
| addonBefore           | Slot                                                                          | -        | The label text displayed before (on the left side of) the input field                                                                                               |
| allowClear            | boolean &#124; { clearIcon: Slot }                                                                            | false    | If allow to remove input content with clear icon                                                                                                                    |
| bordered              | boolean                                                                            | true     | Whether has border style                                                                                                                                            |
| defaultValue          | string                                                                             | -        | The initial input content                                                                                                                                           |
| disabled              | boolean                                                                            | false    | Whether the input is disabled                                                                                                                                       |
| id                    | string                                                                             | -        | The ID for input                                                                                                                                                    |
| maxLength             | number                                                                             | -        | The max length                                                                                                                                                      |
| showCount             | boolean &#124; { formatter: ({ value: string, count: number, maxLength?: number }) => Slot } | false    | Whether show text count                                                                                                                                             |
| prefix                | Slot                                                                          | -        | The prefix icon for the Input                                                                                                                                       |
| suffix                | Slot                                                                          | -        | The suffix icon for the Input                                                                                                                                       |
| type                  | string                                                                             | `text`   | The type of input, see: [MDN](https://developer.mozilla.org/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types)( use `Input.TextArea` instead of `type="textarea"`) |
| value                 | string                                                                             | -        | The input content value                                                                                                                                             |
| onChange              | function(e)                                                                        | -        | Callback when user input                                                                                                                                            |
| onPressEnter          | function(e)                                                                        | -        | The callback function that is triggered when Enter key is pressed                                                                                                   |
</docs>
