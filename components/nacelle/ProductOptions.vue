<template>
  <div v-if="options" class="options nacelle">
    <div class="option" v-for="option in options" :key="option.name">
      <h3 class="option-label">{{ option.name }}</h3>
      <product-option-swatches
        v-on:optionSet="(option) => setSelectedOption({productHandle, option})"
        :option="option"
        :variants="variants"
        :selectedOptions="selectedOptions"
        :clearOptionValue="clearOptionValue"
      />
    </div>
    <button
      class="button is-primary"
      :disabled="
        !allOptionsSelected(productHandle) || (allOptionsSelected(productHandle) && variant == undefined)
      "
      v-if="isChildOfModal"
      @click="confirmSelection"
    >
      <span v-if="allOptionsSelected(productHandle) && variant != undefined"
        >Confirm Selection</span
      >
      <span v-if="allOptionsSelected(productHandle) && variant == undefined"
        >Select other options</span
      >
      <span v-if="!allOptionsSelected(productHandle)">Select your options</span>
    </button>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ProductOptionSwatches from '~/components/nacelle/ProductOptionSwatches'
export default {
  props: {
    productHandle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      clearOptionValue: false
    }
  },
  components: {
    ProductOptionSwatches
  },
  watch: {
    clearOptionValue(val) {
      if (val == true) {
        setTimeout(() => {
          this.clearOptionValue = false
          this.$emit('clear')
        }, 100)
      }
    }
  },
  computed: {
    ...mapGetters('products', [
      'getProduct',
      'getSelectedVariant',
      'getAllOptions',
      'allOptionsSelected',
      'getSelectedOptions'
    ]),

    selectedOptions() {
      return this.getSelectedOptions(this.productHandle)
    },
    options() {
      return this.getAllOptions(this.productHandle)
    },
    variants() {
      return this.getProduct(this.productHandle).variants
    },

    variant() {
      return this.getSelectedVariant(this.productHandle)
    },
    isChildOfModal() {
      if (this.$parent.$options._componentTag == 'interface-modal') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    ...mapMutations('products', ['setSelectedOption', 'clearSelectedOptions']),
    confirmSelection() {
      this.$emit('confirmedSelection')
    }
  },
  created() {
    this.clearSelectedOptions(this.productHandle)
  }
}
</script>

<style lang="scss" scoped>
.option {
  margin-bottom: 1rem;
}

.swatches {
  display: flex;
}

.reset-options {
  margin-bottom: 2rem;
}

.option-label {
  font-weight: 600;
  text-transform: uppercase;
}

.selected {
  background: red;
}
</style>
