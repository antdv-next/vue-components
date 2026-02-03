<script setup lang="ts">
import { ref } from 'vue'
import motionProps from '../../drawer/docs/assets/motion'
import Drawer from '../../drawer/src'
import Dialog from '../src'
import './assets/index.less'
import '../../drawer/docs/assets/index.less'

const drawerOpen = ref(false)
const dialogOpen = ref(false)

function openDrawer() {
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

function openDialog() {
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
}
</script>

<template>
  <Story title="Dialog Focus Trap">
    <Variant title="Drawer + Dialog">
      <div style="padding: 24px; min-height: 60vh;">
        <button id="open-drawer" @click="openDrawer">
          Open Drawer
        </button>

        <button>
          test1
        </button>
        <button>
          test2
        </button>
        <button>
          test3
        </button>
        <Drawer
          :open="drawerOpen"
          placement="right"
          width="50%"
          v-bind="motionProps"
          @close="closeDrawer"
        >
          <div style="padding: 16px;">
            <input id="drawer-input" placeholder="Drawer input">
            <div style="margin-top: 12px;">
              <button id="open-dialog" @click="openDialog">
                Open Dialog
              </button>
            </div>

            <Dialog
              :visible="dialogOpen"
              title="Dialog"
              @close="closeDialog"
            >
              <input id="dialog-input" autofocus placeholder="Dialog input">
              <div style="margin-top: 12px;">
                <button id="dialog-close" @click="closeDialog">
                  Close Dialog
                </button>
              </div>
            </Dialog>
          </div>
        </Drawer>
      </div>
    </Variant>
  </Story>
</template>
