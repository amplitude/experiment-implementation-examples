<template>
  <p>variants: {{ experiments }}</p>
</template>

<script>
  export default {
    data() {
      console.log('data', this.$isServer, this.$experiments)
      return {
        experiments: this.$experiments
      }
    },
  }
</script>
