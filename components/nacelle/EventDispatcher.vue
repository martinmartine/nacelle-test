<template>
  <div></div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState('events', ['log']),
    ...mapState(['facebookCatalogID']),
    ...mapGetters('cart', ['quantityTotal']),
    ...mapState('cart', ['lineItems']),
    productIDs() {
      const productIDs = this.lineItems.map(item => {
        return this.decodeBase64VariantId(item.id)
      })
      return productIDs
    },
    logEntry() {
      return JSON.parse(JSON.stringify(this.log)).pop()
    },
    fbq() {
      return process.browser ? window.fbq : undefined
    },
    ga() {
      return process.browser ? window.ga : undefined
    }
  },
  watch: {
    log(log) {
      if (process.client) {
        switch (this.logEntry.eventType) {
          case 'pageView':
            this.facebookPageView()
            this.googleAnalyticsPageView()
            break
          case 'productView':
            this.facebookProductView()
            this.googleAnalyticsProductView()
            break
          case 'cartAdd':
            this.facebookAddToCart()
            this.googleAnalyticsAddToCart()
            break
          case 'cartRemove':
            this.googleAnalyticsRemoveFromCart()
            break
          case 'checkoutInit':
            this.facebookCheckoutInitiate()
            break
        }
      }
    }
  },
  methods: {
    decodeBase64ProductId(encodedId) {
      const variantIdBase64 = encodedId.split('::')[0]
      const variantIdString = Buffer.from(variantIdBase64, 'base64').toString(
        'ascii'
      )
      const variantId = variantIdString.split('gid://shopify/Product/')[1]

      return variantId
    },
    decodeBase64VariantId(encodedId) {
      const variantIdBase64 = encodedId.split('::')[0]
      const variantIdString = Buffer.from(variantIdBase64, 'base64').toString(
        'ascii'
      )
      const variantId = variantIdString.split(
        'gid://shopify/ProductVariant/'
      )[1]

      return variantId
    },
    /// / PAGE VIEW METHODS /////////////////////////////////
    facebookPageView() {
      if (typeof this.fbq !== 'undefined') {
        this.fbq('track', 'PageView')
      }
    },
    googleAnalyticsPageView() {
      if (typeof this.ga !== 'undefined') {
        this.ga('send', 'pageview', this.logEntry.path)
      }
    },

    /// / PRODUCT VIEW METHODS //////////////////////////////
    facebookProductView() {
      if (typeof this.fbq !== 'undefined') {
        this.fbq('track', 'ViewContent', {
          content_ids: this.decodeBase64ProductId(this.logEntry.product.id),
          content_name: this.logEntry.product.title,
          content_type: 'product',
          product_catalog_id: this.facebookCatalogID
        })
      }
    },
    googleAnalyticsProductView() {
      if (typeof this.ga !== 'undefined') {
        this.ga('ec:addProduct', {
          id: this.decodeBase64ProductId(this.logEntry.product.id),
          name: this.logEntry.product.title
        })
        this.ga('ec:setAction', 'detail')
        this.ga('send', 'pageview')
      }
    },

    /// / ADD TO CART METHODS ///////////////////////////////
    facebookAddToCart() {
      if (typeof this.fbq !== 'undefined') {
        this.fbq('track', 'AddToCart', {
          content_ids: this.decodeBase64VariantId(
            this.logEntry.product.variant.id
          ),
          content_name: this.logEntry.product.variant.title,
          content_type: 'product',
          value: this.logEntry.product.variant.price,
          currency: 'USD',
          product_catalog_id: this.facebookCatalogID
        })
      }
    },
    googleAnalyticsAddToCart() {
      if (typeof this.ga !== 'undefined') {
        this.ga('ec:addProduct', {
          id: this.decodeBase64ProductId(this.logEntry.product.variant.id),
          name: this.logEntry.product.variant.title
        })
        this.ga('ec:setAction', 'add')
        this.ga('send', 'event', 'UX', 'click', 'add to cart')
      }
    },

    /// / REMOVE FROM CART METHODS ///////////////////////////////
    googleAnalyticsRemoveFromCart() {
      if (typeof this.ga !== 'undefined') {
        this.ga('ec:addProduct', {
          id: this.logEntry.product.variant.id,
          name: this.logEntry.product.variant.title
        })
        this.ga('ec:setAction', 'remove')
        this.ga('send', 'event', 'UX', 'click', 'remove from cart')
      }
    },

    /// / CHECKOUT INITIATION METHODS ///////////////////////////////
    facebookCheckoutInitiate() {
      if (typeof this.fbq !== 'undefined') {
        this.fbq('track', 'InitiateCheckout', {
          content_ids: this.productIDs.map(id => {
            return this.decodeBase64ProductId(id)
          }),
          content_type: 'product',
          num_items: this.quantityTotal,
          product_catalog_id: this.facebookCatalogID
        })
      }
    }
  }
}
</script>
