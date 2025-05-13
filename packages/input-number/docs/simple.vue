<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

const disabled = ref(false)
const readOnly = ref(false)
const keyboard = ref(true)
const wheel = ref(true)
const stringMode = ref(false)
const value = ref<string | number>(93)

function onChange(val: any) {
  console.warn('onChange:', val, typeof val)
  value.value = val
}
</script>

<template>
  <div style="margin: 10px">
    <h3>Controlled</h3>
    <InputNumber
      v-model:value="value"
      aria-label="Simple number input example"
      min="-8"
      max="10"
      style="width: 100px"
      :disabled="disabled"
      :readonly="readOnly"
      :keyboard="keyboard"
      :change-on-whell="wheel"
      :string-mode="stringMode"
      @change="onChange"
    />
    <p>
      <button type="button" @click="() => disabled = !disabled">
        toggle Disabled ({{ String(disabled) }})
      </button>
      <button type="button" @click="() => readOnly = !readOnly">
        toggle readOnly ({{ String(readOnly) }})
      </button>
      <button type="button" @click="() => keyboard = !keyboard">
        toggle keyboard ({{ String(keyboard) }})
      </button>
      <button type="button" @click="() => stringMode = !stringMode">
        toggle stringMode ({{ String(stringMode) }})
      </button>
      <button type="button" @click="() => wheel = !wheel">
        toggle wheel ({{ String(wheel) }})
      </button>
    </p>
    <hr>
    <h3>Uncontrolled</h3>
    <InputNumber
      style="width: 100px"
      :min="-99"
      :max="99"
      :default-value="33"
      @change="onChange"
    />
    <hr>
    <h3>!changeOnBlur</h3>
    <InputNumber
      style="width: 100px"
      :min="-9"
      :max="9"
      :default-value="10"
      :change-on-blur="false"
      @change="onChange"
    />
  </div>
</template>
