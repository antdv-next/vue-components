<script setup lang="ts">
import { createApp, onMounted } from 'vue'
import ShadowChild from './shadow-child.vue'

onMounted(() => {
  const wrapperHost = document.createElement('div')
  wrapperHost.textContent = 'wrapper host'
  const wrapperShadowRoot = wrapperHost.attachShadow({
    mode: 'open',
    delegatesFocus: false,
  })
  document.body.appendChild(wrapperHost)

  const host = document.createElement('div')
  wrapperShadowRoot.appendChild(host)
  host.style.background = 'rgba(255,0,0,0.1)'
  const shadowRoot = host.attachShadow({
    mode: 'open',
    delegatesFocus: false,
  })

  const container = document.createElement('div')
  container.id = 'popup-container'
  shadowRoot.appendChild(container)
  const app = createApp(ShadowChild)
  app.mount(container)
})
</script>

<template>
  shadow demo
</template>

<style scoped>

</style>
