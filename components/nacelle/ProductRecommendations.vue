<template>
  <div class="product-recommendations" :class="orientation">
    <div
      v-for="handle in recommendations"
      :key="handle"
      @click="onClick(handle)"
    >
      <slot :product="getProduct(handle)">
        <product-card :productHandle="handle"></product-card>
      </slot>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProductCard from '~/components/nacelle/ProductCard'

export default {
  components: {
    ProductCard
  },
  props: {
    productHandle: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 0
    },
    orientation: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['horizontal', 'vertical'].includes(value)
      }
    }
  },
  computed: {
    ...mapGetters('products', ['getRecommendations', 'getProduct']),
    recommendations() {
      const recommendations = this.getRecommendations(this.productHandle, {
        limit: this.limit
      })
      const handles = recommendations.map(r => r.handle)
      return handles
    }
  },
  methods: {
    ...mapActions('products', ['loadProductRecommendations']),
    ...mapActions('events', ['productRecommendation']),
    onClick(handle) {
      this.productRecommendation({
        sourceHandles: [this.productHandle],
        recommendedHandles: this.recommendations,
        clickedHandle: handle
      })
    }
  },
  created() {
    this.loadProductRecommendations({ productHandle: this.productHandle })
  }
}
</script>

<style lang="scss" scoped>
.product-recommendations {
  display: grid;
  grid-gap: 1rem;
}
.product-recommendations.horizontal {
  grid-auto-flow: column;
  grid-template-rows: 1fr;
}
.product-recommendations.vertical {
  grid-auto-flow: row;
  grid-template-columns: 1fr;
}
</style>
