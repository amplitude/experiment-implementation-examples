<template>
  <p>
    variant: {{ experiment.variant('MY-FLAG-KEY') }}
    <br />
    all: {{ experiment.all() }}
  </p>
</template>

<script>
  export default {
    data() {
      return {
        experiment: this.$experiment
      }
    },
  }
</script>
