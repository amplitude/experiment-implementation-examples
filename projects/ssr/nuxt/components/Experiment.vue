<template>
  <p>variants: {{ experiments }}</p>
</template>

<script>
  export default {
    async asyncData(context) {
      console.log('asyncData', this.$isServer, this.$experiments)
      return {
        experiments: context.$experiments
      }
    },
    data() {
      console.log('data', this.$isServer, this.$experiments)
      return {
        experiments: this.$experiments
      }
    },
  }
</script>
