<script setup lang="ts">
import { computed, shallowRef, watchEffect } from 'vue'
import Dialog from '../src'
import { clearPath, getSvg } from './icon'
import './assets/index.less'

const visible1 = shallowRef(true)
const visible2 = shallowRef(false)
const visible3 = shallowRef(false)
const width = shallowRef(600)
const destroyOnClose = shallowRef(false)
const center = shallowRef(false)
const mousePosition = shallowRef({ x: 0, y: 0 })

const useIcon = shallowRef(false)
const forceRender = shallowRef(false)

function onClick(e: MouseEvent) {
  mousePosition.value = { x: e.pageX, y: e.pageY }
  visible1.value = true
}

function onClose() {
  visible1.value = false
}
function onClose2() {
  visible2.value = false
}
function onClose3() {
  visible3.value = false
}

function closeAll() {
  visible1.value = false
  visible2.value = false
  visible3.value = false
}

function onDestroyOnCloseChange(e: any) {
  destroyOnClose.value = e.target?.checked
}

function onForceRenderChange(e: any) {
  forceRender.value = e.target?.checked
}

function changeWidth() {
  width.value = width.value === 600 ? 800 : 600
}

function centerEvent(e: any) {
  center.value = e.target?.checked
}

function toggleCloseIcon() {
  useIcon.value = !useIcon.value
}

const style = computed(() => ({ width: `${width.value}px` }))

const wrapperClassName = shallowRef('')
watchEffect(() => {
  if (center.value) {
    wrapperClassName.value = 'center'
  }
})
</script>

<template>
  <div style="width: 90%; margin: 0 auto; height: 150vh;">
    <p>
      <button class="btn btn-primary" @click="onClick">
        show dialog
      </button>

    &nbsp;
      <label>
        destroy on close:
        <input type="checkbox" :checked="destroyOnClose" @change="onDestroyOnCloseChange">
      </label>
    &nbsp;
      <label>
        center
        <input type="checkbox" :checked="center" @change="centerEvent">
      </label>
    &nbsp;
      <label>
        force render
        <input type="checkbox" :checked="forceRender" @change="onForceRenderChange">
      </label>
      <input placeholder="Useless Input" @click="onClick">
    </p>

    <div style="height: 100vh;width: 200px; background-color: #0a53be" />

    <Dialog
      :visible="visible1"
      :wrap-class-name="wrapperClassName"
      animation="zoom"
      mask-animation="fade"
      :style="style"
      title="dialog1"
      :mouse-position="mousePosition"
      :destroy-on-hidden="destroyOnClose"
      :close-icon="useIcon ? getSvg(clearPath, {}, true) : undefined"
      :force-render="forceRender"
      :focus-trigger-after-close="false"
      @close="onClose"
    >
      <input autofocus>
      <p>basic modal</p>
      <button
        @click="() => {
          visible1 = false;
          visible2 = true;
        }"
      >
        打开第二个并关闭当前的
      </button>
      <button
        @click="() => {
          visible2 = true;
        }"
      >
        打开第二个
      </button>
      <button @click="changeWidth">
        change width
      </button>
      <button @click="toggleCloseIcon">
        use custom icon, is using icon: {{ useIcon ? 'true' : 'false' }}.
      </button>
    <!--    <div style="height: 200px;"> -->
    <!--      <Select :dropdown-style="{ zIndex: 9999999 }"> -->
    <!--        <Select.Option value="light"> -->
    <!--          Light -->
    <!--        </Select.Option> -->
    <!--      </Select> -->
    <!--    </div> -->
    </Dialog>

    <Dialog
      :visible="visible2"
      title="dialog2"
      @close="onClose2"
    >
      <input autofocus>
      <p>basic modal</p>
      <button
        @click="() => {
          visible3 = true;
        }"
      >
        打开第三个
      </button>
      <button
        @click="() => {
          visible2 = false;
        }"
      >
        关闭当前
      </button>
      <button @click="closeAll">
        关闭所有
      </button>
      <button @click="changeWidth">
        change width
      </button>
      <button @click="toggleCloseIcon">
        use custom icon, is using icon: {{ useIcon ? 'true' : 'false' }}.
      </button>
      <div style="height: 200px;" />
    </Dialog>

    <Dialog
      :force-render="true"
      title="dialog3"
      :visible="visible3"
      @close="onClose3"
    >
      <p>initialized with forceRender and visible true</p>
      <button
        @click="() => {
          visible3 = false;
        }"
      >
        关闭当前
      </button>
      <button @click="closeAll">
        关闭所有
      </button>
      <button @click="changeWidth">
        change width
      </button>
      <button @click="toggleCloseIcon">
        use custom icon, is using icon: {{ useIcon ? 'true' : 'false' }}.
      </button>
      <div style="height: 200px;" />
    </Dialog>
  </div>
</template>

<style scoped>
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
