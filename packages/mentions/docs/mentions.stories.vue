<script setup lang="ts">
import AllowClear from './allow-clear'
import Basic from './basic'
import Debug from './debug'
import Dynamic from './dynamic'
import Filter from './filter'
import MultiplePrefix from './multiple-prefix'
import OnScroll from './on-scroll'
import Split from './split'
import Textarea from './textarea'

import './assets/index.less'
</script>

<template>
  <Story title="Mentions">
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="allow-clear">
      <AllowClear />
    </Variant>
    <Variant title="filter">
      <Filter />
    </Variant>
    <Variant title="split">
      <Split />
    </Variant>
    <Variant title="multiple-prefix">
      <MultiplePrefix />
    </Variant>
    <Variant title="dynamic">
      <Dynamic />
    </Variant>
    <Variant title="on-scroll">
      <OnScroll />
    </Variant>
    <Variant title="textarea">
      <Textarea />
    </Variant>
    <Variant title="debug">
      <Debug />
    </Variant>
  </Story>
</template>
