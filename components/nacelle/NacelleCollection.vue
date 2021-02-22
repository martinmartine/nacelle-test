<template>
  <div class="nacelle collection-data-load">
    <slot v-if="collection" :collection="collection" :products="products" />
    <button v-if="showButton" @click="fetchMore" class="nacelle button">
      {{ buttonText }}
    </button>
    <observe-emitter v-else v-on:observe="fetchMore" />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import ObserveEmitter from '~/components/nacelle/ObserveEmitter'

export default {
  components: {
    ObserveEmitter
  },
  props: {
    handle: {
      type: String,
      default: ''
    },
    locale: {
      type: String,
      default: ''
    },
    paginate: {
      type: Boolean,
      default: false
    },
    productsPerPage: {
      type: Number,
      default: 30
    },
    selectedList: {
      type: String,
      default: 'default'
    },
    useButtonLoadMore: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: 'Load More'
    }
  },
  data() {
    return {
      collection: null,
      noCollectionData: false,
      products: [],
      productIndex: 0,
      isLoadingProducts: false,
    }
  },
  computed: {
    ...mapGetters('collections', ['getCollection']),
    showButton() {
      if (
        this.useButtonLoadMore &&
        this.collection &&
        this.productIndex < this.selectedProductList.length
      ) {
        return true
      }

      return false
    },
    useLocale() {
      if (this.locale && this.locale !== '') {
        return this.locale
      }

      if (this.$nacelle && this.$nacelle.locale) {
        return this.$nacelle.locale
      }

      return 'en-us'
    },
    selectedProductList() {
      if (this.collection && Array.isArray(this.collection.productLists)) {
        const list = this.collection.productLists.find(collection => {
          return collection.slug === this.selectedList
        })

        if (list && Array.isArray(list.handles)) {
          return list.handles
        }
      }

      return []
    },
    collectionObject() {
      return {
        collectionHandle: this.handle,
        collection: this.collection,
        products: this.products,
        productIndex: this.productIndex,
        selectedList: this.selectedList,
        locale: this.useLocale
      }
    },
    collectionPageOptions() {
      return {
        collection: this.collection,
        list: this.selectedList || 'default',
        paginate: true,
        index: this.productIndex,
        itemsPerPage: this.productsPerPage || 12,
        locale: this.locale || this.$nacelle.locale
      }
    }
  },
  async fetch() {
    // Check if collection saved in vuex store
    // Loading from store will allow for restoring scroll position
    const storeCollection = this.getCollection(this.handle)
    if (storeCollection) {
      this.collection = storeCollection.collection
      this.products = storeCollection.products
      this.productIndex = storeCollection.productIndex
      return
    }

    // If Nuxt Server, use fs to read static json files rather than using
    // Nacelle SDK method
    if (process.server) {
      const fs = require('fs')
      try {
        const file = fs.readFileSync(
          `./static/data/collections/${this.handle}--${this.useLocale}/static.json`,
          'utf-8'
        )
        this.collection = JSON.parse(file)
      } catch (err) {
        this.noCollectionData = true
      }

      if (this.selectedProductList.length) {
        const productList = this.collection.productLists
          .find(list => list.slug === this.selectedList)

        const handles = productList.handles.slice(0, this.itemsPerPage)
        const products = []
        handles.forEach(handle => {
          const productFile = fs.readFileSync(
            `./static/data/products/${handle}--${this.useLocale}/static.json`,
            'utf-8'
          )
          products.push(JSON.parse(productFile))
        })
        this.products = products
      }
    } else {
      await this.fetchData()
    }

    // Update the product index
    this.productIndex = this.products.length
    // Store the collection data in Vuex
    this.addCollection(this.collectionObject)
  },
  async created() {
    // Wait for fetch, if nothing try again (needed for vue testing)
    this.$nextTick(async () => {
      if (!this.collection) {
        await this.fetchData()
      }
    })
    
    // Fetch locale specific collection data if user's locale prefer
    this.unsubscribe = this.$store.subscribe(async (mutation, state) => {
      if (mutation.type === 'user/setLocale') {
        this.isLoadingProducts = true

        await this.fetchCollection()

        if (this.selectedProductList.length) {
          this.products = await this.fetchCollectionProducts(this.collectionPageOptions)
          this.productIndex = this.products.length

          this.updateCollectionProducts({
            handle: this.handle,
            products: this.products,
            productIndex: this.productIndex
          })
        }

        this.isLoadingProducts = false
      }
    })
  },
  beforeDestroy() {
    this.unsubscribe()
  },
  methods: {
    ...mapActions('collections', ['addCollection', 'updateCollectionProducts']),
    async fetchData() {
      if (process.browser || process.client) {
        const storeCollection = this.getCollection(this.handle)

        if (storeCollection) {
          this.collection = storeCollection.collection
          this.products = storeCollection.products
        } else {
          // Use Nacelle SDK methods for loading collection and product data
          await this.fetchCollection()

          if (this.selectedProductList.length) {
            this.products = await this.$nacelle.data.collectionPage(this.collectionPageOptions)
          }

          // Update the product index
          this.productIndex = this.products.length

          // Store the collection data in Vuex
          this.addCollection(this.collectionObject)
        }
      }
    },
    async fetchCollection() {
      this.collection = await this.$nacelle.data
        .collection({
          handle: this.handle,
          locale: this.useLocale
        })
        .catch(() => {
          this.noCollectionData = true
        })
    },
    // Load a new "page" of products
    async fetchMore() {
      if (
        !this.isLoadingProducts &&
        this.collection &&
        this.productIndex < this.selectedProductList.length
      ) {
        this.isLoadingProducts = true

        const nextPageProducts = await this.$nacelle.data.collectionPage(this.collectionPageOptions)

        this.products = [...this.products, ...nextPageProducts]
        this.productIndex += this.productsPerPage
        this.isLoadingProducts = false

        this.updateCollectionProducts({
          handle: this.handle,
          products: this.products,
          productIndex: this.productIndex
        })
      }
    }
  }
}
</script>

<style></style>
