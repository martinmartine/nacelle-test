import storeConfig from '../storeConfig'
import Vue from 'vue'
import Vuex from 'vuex'

import { defaultProduct } from '../mocks/defaultObjects'
Vue.use(Vuex)

describe('Event Store', () => {
  it('sets the product in vuex store', () => {
    const store = new Vuex.Store(storeConfig())
    store.commit('products/upsertProducts', [{ product: defaultProduct }])

    expect(
      store.state.products.products[defaultProduct.handle].product.id
    ).toEqual(defaultProduct.id)
  })

  it('gets first variant if no variant selected', () => {
    const store = new Vuex.Store(storeConfig())
    store.commit('products/upsertProducts', [{ product: defaultProduct }])

    expect(
      store.getters['products/getSelectedVariant'](defaultProduct.handle).id
    ).toEqual(defaultProduct.variants[0].id)
  })

  it('sets the selected variant by id', () => {
    const store = new Vuex.Store(storeConfig())
    const variantId =
      'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8yODU2ODgyMDAyMzQwMQ=='

    store.commit('products/upsertProducts', [{ product: defaultProduct }])
    store.commit('products/setSelectedVariant', {
      productHandle: defaultProduct.handle,
      variantId
    })

    expect(
      store.state.products.products[defaultProduct.handle].selectedVariantId
    ).toEqual(variantId)
  })
})
