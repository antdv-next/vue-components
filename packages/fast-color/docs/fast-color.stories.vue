<script setup lang="ts">
import { FastColor } from '../src'
// input
const shortHex = new FastColor('#666') // short hex
const hex = new FastColor('#66ccff') // hex
const hexWithAlpha = new FastColor('#66ccffaa') // hex with alpha
const oldRgb = new FastColor('rgba(102, 204, 255, .5)') // old css rgb syntax
const newRgb = new FastColor('rgb(102 204 255 / .5)') // new css rgb syntax
const oldHsl = new FastColor('hsl(270, 60, 40, .5)') // old css hsl syntax, with or without unit
const newHsl = new FastColor('hsl(270deg 60% 40% / 50%)') // new css hsl syntax, with or without unit
const rgbObj = new FastColor({ r: 102, g: 204, b: 255, a: 0.5 }) // rgb object
const hslObj = new FastColor({ h: 270, s: 0.6, l: 0.4, a: 0.5 }) // hsl object
const hsvObj = new FastColor({ h: 270, s: 0.6, v: 0.4, a: 0.5 }) // hsv object

// clone
const color = new FastColor('#66ccff')
const color2 = new FastColor(color) // clone via constructor
const color3 = color2.clone() // call clone method

// output
const color2Str = color.toHexString() // #66ccff
const color2Rgb = color.toRgb() // Object { r: 102, g: 204, b: 255, a: 1 }
const color2RgbStr = color.toRgbString() // rgb(102,204,255)
const color2Hsl = color.toHsl() // Object { h: 200, s: 0.6, l: 0.7, a: 1 }
const color2HslStr = color.toHslString() // hsl(200,60%,70%)
const color2Hsv = color.toHsv() // Object { h: 200, s: 0.6, v: 1, a: 1 }
</script>

<template>
  <Story title="FastColor">
    <Variant title="simple">
      <div>{{ "new FastColor('#666');" }} {{ '=>' }} {{ shortHex }}</div>
      <div>{{ "new FastColor('#66ccff');" }} {{ '=>' }} {{ hex }}</div>
      <div>{{ "new FastColor('#66ccffaa');" }} {{ '=>' }} {{ hexWithAlpha }}</div>
      <div>{{ "new FastColor('rgba(102, 204, 255, .5)');" }} {{ '=>' }} {{ oldRgb }}</div>
      <div>{{ "new FastColor('rgb(102 204 255 / .5)');" }} {{ '=>' }} {{ newRgb }}</div>
      <div>{{ "new FastColor('hsl(270, 60, 40, .5)');" }} {{ '=>' }} {{ oldHsl }}</div>
      <div>{{ "new FastColor('hsl(270deg 60% 40% / 50%)');" }} {{ '=>' }} {{ newHsl }}</div>
      <div>{{ "new FastColor({ r: 102, g: 204, b: 255, a: 0.5 });" }} {{ '=>' }} {{ rgbObj }}</div>
      <div>{{ "new FastColor({ h: 270, s: 0.6, l: 0.4, a: 0.5 });" }} {{ '=>' }} {{ hslObj }}</div>
      <div>{{ "new FastColor({ h: 270, s: 0.6, v: 0.4, a: 0.5 });" }} {{ '=>' }} {{ hsvObj }}</div>
      <hr>
      <div>
        {{
          `const color = new FastColor('#66ccff')`
        }}
      </div>
      <div>
        {{
          `const color2 = new FastColor(color)`
        }}
      </div>
      <div>
        {{
          `const color3 = color2.clone()`
        }}
      </div>
      <br>
      <div>{{ "color.toHexString()" }} {{ `=>${color2Str}` }}</div>
      <div>{{ "color.toRgb()" }} {{ `=>${color2Rgb}` }}</div>
      <div>{{ "color.toRgbString()" }} {{ `=>${color2RgbStr}` }}</div>
      <div>{{ "color.toHsl()" }} {{ `=>${color2Hsl}` }}</div>
      <div>{{ "color.toHslString()" }} {{ `=>${color2HslStr}` }}</div>
      <div>{{ "color.toHsv()" }} {{ `=>${color2Hsv}` }}</div>
    </Variant>
  </Story>
</template>

<style scoped>

</style>
