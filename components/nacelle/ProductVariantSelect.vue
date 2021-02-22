<template>
  <div class="variant-select nacelle">
    <product-options
      v-show="showProductOptions"
      :productHandle="productHandle"
    />
    <slot name="above-button"></slot>
    <div class="columns is-mobile">
      <div v-if="displayQuantitySelect" class="column auto">
        <quantity-selector :quantity.sync="quantity" />
      </div>
      <div class="column auto">
        <product-add-to-cart-button
          :quantity="quantity"
          :productHandle="product.handle"
          :allOptionsSelected="allOptionsSelected(productHandle)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import ProductOptions from '~/components/nacelle/ProductOptions'
import QuantitySelector from '~/components/nacelle/QuantitySelector'
import ProductAddToCartButton from '~/components/nacelle/ProductAddToCartButton'

export default {
  props: {
    productHandle: {
      type: String,
      default: ''
    },
    showQuantitySelect: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      quantity: 0
    }
  },
  components: {
    ProductOptions,
    QuantitySelector,
    ProductAddToCartButton
  },
  computed: {
    ...mapGetters('products', [
      'getProduct',
      'getSelectedVariant',
      'allOptionsSelected',
      'getAllOptions'
    ]),
    product() {
      return this.getProduct(this.productHandle)
    },
    allOptions() {
      return this.getAllOptions(this.productHandle)
    },
    selectedVariant() {
      return this.getSelectedVariant(this.productHandle)
    },
    showProductOptions() {
      return (
        Array.isArray(this.allOptions) &&
        this.allOptions.length >= 1 &&
        this.allOptions[0].values.length > 1 &&
        this.product.availableForSale
      )
    },
    displayQuantitySelect() {
      return (
        this.allOptionsSelected(this.productHandle) &&
        this.selectedVariant &&
        this.selectedVariant.availableForSale &&
        this.showQuantitySelect
      )
    }
  }
}
</script>

<style></style>
