<script setup lang="ts">
import { shallowRef } from 'vue'
import Dialog from '../src'
import 'bootstrap/dist/css/bootstrap.css'
import './assets/bootstrap.less'

const visible = shallowRef(false)
const destroyOnClose = shallowRef(false)

function onClick() {
  visible.value = true
}

function onClose() {
  visible.value = false
}

function onDestroyOnCloseChange(e: any) {
  destroyOnClose.value = e.target.checked
}

function InnterRender() {
  console.log('updated...', Date.now())
  return null
}
</script>

<template>
  <div style="margin: 20px">
    <p>
      <button type="button" class="btn btn-primary" @click="onClick">
        show dialog
      </button>
    </p>
    <div style="height: 100vh;width: 200px; background-color: #0a53be" />
    <label>
      destroy on close:
      <input type="checkbox" :checked="destroyOnClose" @change="onDestroyOnCloseChange">
    </label>

    <Dialog
      style="width: 600px;"
      :destroy-on-close="destroyOnClose"
      :visible="visible"
      animation="slide-fade"
      mask-animation="fade"
      title="第二个弹框"
      @close="onClose"
    >
      <InnterRender />
      <h4>Text in a modal</h4>
      <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
      <hr>
      <h4>Overflowing text to show scroll behavior</h4>
      <p>
        Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in,
        egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
      </p>
      <p>
        <button type="button" class="btn btn-primary">
          Primary
        </button>
        <button type="button" class="btn btn-secondary">
          Secondary
        </button>
        <button type="button" class="btn btn-success">
          Success
        </button>
        <button type="button" class="btn btn-danger">
          Danger
        </button>
        <button type="button" class="btn btn-warning">
          Warning
        </button>
        <button type="button" class="btn btn-info">
          Info
        </button>
      </p>
      <p>
        Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus
        vel augue laoreet rutrum faucibus dolor auctor.
      </p>
      <div>
        <p>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </p>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </p>
        <p>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus
          vel augue laoreet rutrum faucibus dolor auctor.
        </p>
        <p>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </p>
        <p>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </p>
        <p>
          Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus
          vel augue laoreet rutrum faucibus dolor auctor.
        </p>
        <p>
          Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
          scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
          auctor fringilla.
        </p>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>

</style>
