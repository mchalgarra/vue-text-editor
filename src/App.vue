<template>
  <v-app>
    <v-main>
      <VueTextEditor />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import VueTextEditor from './components/VueTextEditor.vue'

export default Vue.extend({
  name: 'App',

  components: {
    VueTextEditor,
  },

  data: () => ({
    //
  }),
})
</script>
