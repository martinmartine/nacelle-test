<template>
  <div
    @click="toggle"
    class="add-to-wishlist"
    :class="isSavedInWishlist ? 'saved' : 'not-saved'"
  >
    <slot name="icon"></slot>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  props: {
    productHandle: {
      type: String,
      default: ''
    }
  },
  methods: {
    ...mapActions('wishlist', ['addToWishlist', 'removeFromWishlist']),
    toggle() {
      const { variant, product } = this
      this.isSavedInWishlist
        ? this.removeFromWishlist({ variantId: variant.id })
        : this.addToWishlist({ product, variant })
    }
  },
  computed: {
    ...mapGetters('products', ['getProduct', 'getSelectedVariant']),
    ...mapGetters('wishlist', ['getItemByVariantId']),
    product() {
      return this.getProduct(this.productHandle)
    },
    variant() {
      return this.getSelectedVariant(this.productHandle)
    },
    isSavedInWishlist() {
      return this.variant && !!this.getItemByVariantId(this.variant.id)
    }
  }
}
</script>

<style scoped>
.add-to-wishlist svg {
  stroke: currentColor;
  stroke-width: 36px;
  width: 18px;
  height: 18px;
}
.add-to-wishlist.saved svg {
  fill: currentColor;
}
.add-to-wishlist.not-saved svg {
  fill: transparent;
}
</style>
