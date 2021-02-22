<template>
  <div class="product columns">
    <div class="column is-6">
      <product-media-select-view
        v-if="product && product.featuredMedia && product.media"
        :featuredMedia="product.featuredMedia"
        :media="product.media"
      />
    </div>
    <div class="column is-5 is-offset-1">
      <product-title :title="product.title" />
      <product-category
        v-if="product.productType"
        :category="product.productType"
      />
      <p class="price">
        <product-price v-if="selectedVariant" :price="displayPrice" />
      </p>
      <product-description :description="product.description" />
      <product-variant-select
        v-if="selectedVariant"
        :productHandle="productHandle"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from 'vuex'
import ProductCategory from '~/components/nacelle/ProductCategory'
import ProductMediaSelectView from '~/components/nacelle/ProductMediaSelectView'
import ProductTitle from '~/components/nacelle/ProductTitle'
import ProductPrice from '~/components/nacelle/ProductPrice'
import ProductDescription from '~/components/nacelle/ProductDescription'
import ProductVariantSelect from '~/components/nacelle/ProductVariantSelect'

export default {
  components: {
    ProductCategory,
    ProductMediaSelectView,
    ProductTitle,
    ProductPrice,
    ProductDescription,
    ProductVariantSelect
  },
  data() {
    return {}
  },
  props: {
    productHandle: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState('user', ['locale']),
    ...mapGetters('products', [
      'getProductData',
      'getSelectedVariant',
      'getPriceForCurrency'
    ]),
    product() {
      return this.getProductData(this.productHandle).product
    },
    displayPrice() {
      return this.getPriceForCurrency({
        productHandle: this.productHandle,
        fallbackPrice: this.selectedVariant.price
      })
    },
    selectedVariant() {
      return this.getSelectedVariant(this.productHandle)
    }
  },
  methods: {
    ...mapMutations('cart', ['showCart']),
    ...mapMutations('products', ['setSelectedVariant'])
  }
}
</script>

<style lang="scss" scoped>
.price {
  margin-bottom: 1rem;
}
</style>
