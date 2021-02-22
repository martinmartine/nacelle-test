import axios from 'axios'
import Vue from 'vue'
import deepmerge from 'deepmerge'
import uniqWith from 'lodash.uniqwith'
import isEqual from 'lodash.isequal'

const defaultProductData = {
  product: {
    priceRange: {
      min: '0.0',
      max: '0.00',
      currencyCode: 'USD'
    },
    title: null,
    media: [],
    featuredMedia: {
      src: undefined
    },
    id: null,
    handle: '',
    variants: []
  },
  recommendations: [],
  selectedVariantId: undefined,
  selectedOptions: [],
  metafields: [],
  quantity: 1
}

export const state = () => ({
  products: {},
  currentProductHandle: ''
})

export const getters = {
  getCurrentProductData: state => {
    const productData =
      state.products[state.currentProductHandle] || defaultProductData
    return productData
  },
  getProduct: state => handle => {
    const productData = state.products[handle] || defaultProductData
    return productData.product || defaultProductData.product
  },
  getCartProduct: state => handle => {
    const productData = state.products[handle] || defaultProductData
    const product = productData.product
    return {
      image: product.featuredMedia,
      title: product.title,
      productId: product.id,
      price: productData.currentPrice,
      handle: product.handle,
      variant: productData.selectedVariant
    }
  },
  getPriceForCurrency: (state, getters, rootState) => ({
    productHandle,
    fallbackPrice
  }) => {
    const productData = state.products[productHandle]
    if (!productData || !productData.product) {
      return
    }

    const { product } = productData
    const { variants, priceRange } = product
    const { locale, currency } = rootState.user.locale

    if (priceRange.currencyCode === currency) {
      return new Intl.NumberFormat(product.locale, {
        style: 'currency',
        currency: priceRange.currencyCode
      }).format(fallbackPrice)
    }

    const priceForCurrency = Math.max(
      0,
      ...variants
        .filter(!!variant.priceRules)
        .map(variant =>
          variant.priceRules
            .filter(priceRule.priceCurrency === currency)
            .map(priceRule => priceRule.price)
        )
        .flat()
    )

    const currencyToDisplay = {
      locale: priceForCurrency ? locale : product.locale,
      currency: priceForCurrency ? currency : priceRange.currencyCode,
      price: priceForCurrency || fallbackPrice
    }

    const formattedCurrency = new Intl.NumberFormat(currencyToDisplay.locale, {
      style: 'currency',
      currency: currencyToDisplay.currency
    }).format(currencyToDisplay.price)

    return priceForCurrency
      ? `${formattedCurrency} ${currency}`
      : formattedCurrency
  },
  getSelectedOptions: state => handle => {
    const productData = state.products[handle]
    if (!productData) {
      return []
    }

    return productData.selectedOptions || []
  },
  getAllOptions: state => handle => {
    const productData = state.products[handle]
    if (!productData) {
      return []
    }

    const {
      product: { variants }
    } = productData

    if (!variants) {
      return
    }

    const flattenedOptions = variants
      .filter(v => !!v.selectedOptions)
      .flatMap(v =>
        v.selectedOptions.map(option =>
          option.name === 'Color'
            ? {
                name: option.name,
                value: option.value
              }
            : option
        )
      )

    const optionNames = [...new Set(flattenedOptions.map(o => o.name))]

    const optionValuesByName = optionNames.map(name => {
      const values = uniqWith(
        flattenedOptions
          .filter(o => o.name === name)
          .map(option => ({
            value: option.value
          })),
        isEqual
      )

      return {
        name,
        values
      }
    })

    return optionValuesByName
  },
  onlyOneOption: (state, getters) => handle => {
    const allOptions = getters.getAllOptions(handle)
    return (
      allOptions && allOptions.length === 1 && allOptions[0].values.length === 1
    )
  },
  allOptionsSelected: (state, getters) => handle => {
    const productData = state.products[handle]
    if (!productData) {
      return false
    }
    const {
      product: { variants },
      selectedOptions
    } = productData

    if (variants && variants.length === 1) {
      return true
    }

    const allOptions = getters.getAllOptions(handle)
    if (
      allOptions &&
      selectedOptions &&
      selectedOptions.length === allOptions.length
    ) {
      return true
    }

    if (
      allOptions &&
      allOptions.length === 1 &&
      allOptions[0].values.length === 1
    ) {
      return true
    }

    return false
  },
  getProductData: state => handle => {
    const productData = state.products[handle] || defaultProductData
    return productData
  },
  getSelectedVariant: state => handle => {
    const productData = state.products[handle] || defaultProductData
    const {
      product: { variants },
      selectedVariantId
    } = productData

    if (selectedVariantId) {
      return variants.find(
        variant => variant.id === productData.selectedVariantId
      )
    }

    if (variants && variants.length) {
      return productData.product.variants[0]
    }
  },

  /**
   * @param {string} handle - Product handle to get recommendations for.
   * @param {string} options.limit - Default is 0 (all). Max number of recommendtations to get. 0 gets all.
   * @param {string} options.source - Default is 'rule'. Source of recommendations. Possible values: 'all', 'rule', or 'generated'.
   * @param {boolean} options.cascade - Default is true. Use alternate source if no recommendations available?
   */
  getRecommendations: state => (handle, options = {}) => {
    const defaultOptions = {
      limit: 0,
      source: 'rule',
      cascade: true
    }
    const { limit, source, cascade } = { ...defaultOptions, ...options }
    const productData = state.products[handle] || defaultProductData
    const recommendationsData = productData.recommendations
    const sourceRecommendations = recommendationsData.filter(
      r => r.source === source
    )
    const recommendations =
      sourceRecommendations.length || !cascade
        ? sourceRecommendations
        : recommendationsData

    return recommendations.slice(0, limit || recommendations.length)
  }
}

export const mutations = {
  // insert/add or update products in state
  upsertProducts: (state, products) =>
    (products || []).forEach(productData => {
      if (!productData.product || !productData.product.handle) {
        return
      }

      const {
        product: { handle }
      } = productData

      const existingProductData = state.products[handle] || defaultProductData

      state.products = {
        ...state.products,
        [handle]: deepmerge(existingProductData, productData, {
          arrayMerge: (dest, source) => source
        })
      }
    }),

  setCurrentProductHandle: (state, handle) =>
    (state.currentProductHandle = handle),

  clearSelectedOptions(state, productHandle) {
    const productData = state.products[productHandle]
    if (!productData) {
      return
    }

    state.products = {
      ...state.products,
      [productHandle]: {
        ...state.products[productHandle],
        selectedOptions: []
      }
    }
  },

  setSelectedOption(state, { productHandle, option }) {
    const productData = state.products[productHandle]
    if (!productData) {
      return
    }

    const {
      product: { variants },
      selectedOptions
    } = productData

    const isValidOption = option && option.name

    const newSelectedOptions = isValidOption
      ? [...selectedOptions.filter(o => o.name !== option.name), option]
      : selectedOptions

    state.products = {
      ...state.products,
      [productHandle]: {
        ...state.products[productHandle],
        selectedOptions: newSelectedOptions
      }
    }

    const stringifiedOptions = newSelectedOptions.map(o => JSON.stringify(o))

    const variantMatch = variants.find(v =>
      v.selectedOptions.every(o =>
        stringifiedOptions.includes(JSON.stringify(o))
      )
    )

    state.products = {
      ...state.products,
      [productHandle]: {
        ...state.products[productHandle],
        ...(variantMatch && { selectedVariantId: variantMatch.id })
      }
    }
  },

  setSelectedVariant(state, { productHandle, variantId }) {
    const productData = state.products[productHandle]
    if (
      !productData ||
      !productData.product ||
      !productData.product.variants ||
      !variantId ||
      !productData.product.variants.map(v => v.id).includes(variantId)
    ) {
      return
    }

    state.products = {
      ...state.products,
      [productHandle]: {
        ...state.products[productHandle],
        selectedVariantId: variantId
      }
    }
  }
}

export const actions = {
  loadProduct: async ({ rootState, commit }, { productHandle }) => {
    const locale = rootState.user.locale.locale
    const loadFromFile = () => {
      const fs = require('fs')
      const file = fs.readFileSync(
        `./static/data/products/${productHandle}--${locale}/static.json`,
        'utf-8'
      )
      return JSON.parse(file)
    }

    const loadFromNacelle = async () => {
      return await Vue.prototype.$nuxt.$nacelle.data.product({
        handle: productHandle,
        locale: locale
      })
    }

    const product = process.server ? loadFromFile() : await loadFromNacelle()

    commit('upsertProducts', [{ product }])
  },

  loadProductRecommendations: async (
    { rootState, state, dispatch, commit },
    { productHandle }
  ) => {
    if (!productHandle) {
      return
    }

    const existingProduct = state.products[productHandle]
    if (
      existingProduct &&
      existingProduct.recommendations &&
      existingProduct.recommendations.length
    ) {
      return
    }

    const locale = (rootState.user.locale.locale || 'en-us').toLowerCase()
    const nacelleStaticUrl = 'nacellestatic.s3.amazonaws.com'

    let generatedRecommendations
    try {
      const recommendationsData = await axios.get(
        `https://${nacelleStaticUrl}/${process.env.nacelleSpaceID}/merchandising/products/${productHandle}--${locale}.json`
      )
      generatedRecommendations = JSON.parse(recommendationsData.data)
    } catch (error) {
      console.log(
        `Unable to load generated product recommendations for ${productHandle}.`
      )
    }

    let rulesRecommendations
    try {
      const merchandisingRulesData = await axios.get(
        `https://${nacelleStaticUrl}/${process.env.nacelleSpaceID}/merchandising-rules.json`
      )
      const merchandisingRules = merchandisingRulesData.data.rules.find(rule =>
        rule.inputs.includes(productHandle)
      )
      rulesRecommendations = merchandisingRules
        ? merchandisingRules.outputs
        : []
    } catch (error) {
      console.log(
        `Unable to load product recommendation rules for ${productHandle}.`
      )
    }

    const recommendations = [
      ...(generatedRecommendations || []).map(handle => ({
        handle,
        source: 'generated'
      })),
      ...(rulesRecommendations || []).map(handle => ({
        handle,
        source: 'rule'
      }))
    ]

    if (!recommendations || !recommendations.length) {
      return
    }

    recommendations.map(({ handle }) => {
      dispatch('loadProduct', { productHandle: handle })
    })

    const productUpdate = {
      product: {
        handle: productHandle
      },
      recommendations
    }

    commit('upsertProducts', [productUpdate])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
