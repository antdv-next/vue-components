<script setup lang="ts">
import { Trigger } from '../_src'
import './assets/index.less'
</script>

<template>
  <Trigger
    arrow
    action="click"
    :popup-style="{ boxShadow: '0 0 5px red', position: 'absolute' }"
    :get-popup-container="(item) => item.parentElement!"
    :popup-align="{
      points: ['bc', 'tc'],
      overflow: {
        shiftX: 50,
        adjustY: true,
      },
      offset: [0, -10],
    }"
    stretch="minWidth"
    auto-destroy
  >
    <span
      style="
          background: green;
          color: #FFF;
          padding-block: 30px;
          padding-inline: 70px;
          opacity: 0.9;
          display: inline-block;
          margin-left: 500px;
          margin-top: 200px;
        "
    >
      Target
    </span>
    <template #popup>
      <div
        style="
            background: yellow;
            border: 1px solid blue;
            width: 200px;
            height: 60px;
            opacity: 0.9;
          "
      >
        Popup
      </div>
    </template>
  </Trigger>
</template>

<style scoped>

</style>
