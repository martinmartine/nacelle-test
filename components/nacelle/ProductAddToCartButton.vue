<template>
  <div>
    <button
      :disabled="disableAtcButton"
      @click="addToCart"
      class="button is-primary"
    >
      <slot>
        <span v-if="showAddToCart">Add to Cart</span>
        <span v-else-if="showSelectOptions">Select Options</span>
        <span v-else-if="variantInLineItems">Added!</span>
        <span v-else-if="showOutOfStock">Out of Stock</span>
      </slot>
    </button>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'

export default {
  props: {
    productHandle: {
      type: String,
      default: ''
    },
    metafields: {
      type: Array,
      default: () => {
        return []
      }
    },

    quantity: { type: Number, default: 1 },
    confirmedSelection: { type: Boolean, default: false }
  },

  computed: {
    ...mapState('cart', ['lineItems']),
    ...mapGetters('products', [
      'getProduct',
      'getSelectedVariant',
      'onlyOneOption',
      'allOptionsSelected'
    ]),

    product() {
      return this.getProduct(this.productHandle)
    },

    variant() {
      return this.getSelectedVariant(this.productHandle)
    },

    variantInLineItems() {
      return (
        !!this.variant &&
        this.lineItems.map(l => l.variant.id).includes(this.variant.id)
      )
    },

    isProductVariantSelectChild() {
      return this.$parent.$options._componentTag === 'product-variant-select'
    },

    showSelectOptions() {
      console.log()
      return this.isProductVariantSelectChild
        ? !this.variantInLineItems &&
            !this.allOptionsSelected(this.productHandle) &&
            this.product.availableForSale
        : !this.onlyOneOption(this.productHandle) &&
            this.product.availableForSale
    },

    disableAtcButton() {
      return (
        !this.allOptionsSelected(this.productHandle) ||
        (this.allOptionsSelected(this.productHandle) &&
          this.variant === undefined) ||
        (!this.variantInLineItems &&
          this.allOptionsSelected(this.productHandle) &&
          !this.variant.availableForSale)
      )
    },

    showOutOfStock() {
      return (
        (!this.variantInLineItems &&
          this.allOptionsSelected &&
          this.variant &&
          !this.variant.availableForSale) ||
        !this.product.availableForSale
      )
    },

    showAddToCart() {
      return (
        (this.isProductVariantSelectChild
          ? this.allOptionsSelected(this.productHandle)
          : this.onlyOneOption(this.productHandle)) &&
        !this.variantInLineItems &&
        this.variant &&
        this.variant.availableForSale
      )
    }
  },

  watch: {
    confirmedSelection() {
      this.addToCart()
    }
  },

  methods: {
    ...mapActions('cart', [
      'addLineItem',
      'removeLineItem',
      'incrementLineItem',
      'decrementLineItem'
    ]),

    ...mapMutations('cart', ['showCart']),

    addToCart() {
      if (
        this.allOptionsSelected(this.productHandle) &&
        this.product.availableForSale
      ) {
        const lineItem = {
          image: this.product.featuredMedia,
          title: this.product.title,
          variant: this.variant,
          quantity: this.quantity || 1,
          productId: this.product.id,
          handle: this.product.handle,
          vendor: this.product.vendor,
          tags: this.product.tags,
          metafields: this.metafields
        }
        this.addLineItem(lineItem)
        this.showCart()
      }
    }
  }
}
</script>
