<script setup lang="ts">
import Input from '../src'

const sharedHeadStyle = {
  margin: 0,
  padding: 0,
}
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: start;
    "
  >
    <h3 :style="sharedHeadStyle">
      Native
    </h3>
    <Input prefix-cls="vc-input" show-count default-value="👨‍👩‍👧‍👦" />
    <Input prefix-cls="vc-input" show-count default-value="👨‍👩‍👧‍👦" :max-length="20" />
    <h3 :style="sharedHeadStyle">
      Count
    </h3>
    <h4 :style="sharedHeadStyle">
      Only Max
    </h4>
    <Input
      placeholder="count.max"
      prefix-cls="vc-input"
      default-value="🔥"
      :count="{
        show: true,
        max: 5,
      }"
    />
    <h4 :style="sharedHeadStyle">
      Customize strategy
    </h4>
    <Input
      placeholder="Emoji count 1"
      prefix-cls="vc-input"
      default-value="🔥"
      :count="{
        show: true,
        max: 5,
        strategy: (val) => [...new Intl.Segmenter().segment(val)].length,
      }"
    />
    <h4 :style="sharedHeadStyle">
      Customize exceedFormatter
    </h4>
    <Input
      placeholder="Emoji count 1"
      prefix-cls="vc-input"
      default-value="🔥"
      :count="{
        show: true,
        max: 5,
        exceedFormatter: (val, { max }) => {
          const segments = [...new Intl.Segmenter().segment(val)];

          return segments
            .filter((seg) => seg.index + seg.segment.length <= max)
            .map((seg) => seg.segment)
            .join('');
        },
      }"
    />
  </div>
</template>

<style scoped>

</style>
