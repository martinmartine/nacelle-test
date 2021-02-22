import storeConfig from '../storeConfig'
import products from '../mocks/static-products'
import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const product = products[0]

const { handle, image, metafields, productId, title } = product

const lineItem = {
  variant: product.variants[0],
  handle,
  image,
  title,
  quantity: 1,
  productId,
  metafields
}

describe('Event Store', () => {
  let store
  beforeEach(() => {
    store = new Vuex.Store(storeConfig())
  })

  it('adds a page view event to log array', () => {
    store.dispatch('events/pageView', { payload: 'New Page' })
    expect(store.state.events.log.length).toEqual(1)
    expect(store.state.events.log[0].eventType).toEqual('pageView')
    expect(store.state.events.log[0].payload).toEqual('New Page')
  })

  it('adds a product view event to log array', () => {
    store.dispatch('events/productView', product)
    expect(store.state.events.log.length).toEqual(1)
    expect(store.state.events.log[0].eventType).toEqual('productView')
    expect(store.state.events.log[0]).toEqual(
      expect.objectContaining({ product })
    )
  })

  it('adds an add-to-cart event to log array', () => {
    store.dispatch('events/addToCart', lineItem)
    expect(store.state.events.log.length).toEqual(1)
    expect(store.state.events.log[0].eventType).toEqual('cartAdd')
    expect(store.state.events.log[0]).toEqual(expect.objectContaining(lineItem))
  })

  it('adds an remove-from-cart event to log array', () => {
    store.dispatch('events/removeFromCart', lineItem)
    expect(store.state.events.log.length).toEqual(1)
    expect(store.state.events.log[0].eventType).toEqual('cartRemove')
    expect(store.state.events.log[0]).toEqual(expect.objectContaining(lineItem))
  })

  it('adds a checkout-init event to log array', () => {
    store.dispatch('events/addToCart', lineItem)
    store.dispatch('events/checkoutInit', { cart: [lineItem] })
    expect(store.state.events.log.length).toEqual(2)
    expect(store.state.events.log[1].eventType).toEqual('checkoutInit')
    expect(store.state.events.log[1].cart[0]).toEqual(lineItem)
  })

  it('adds a search products event to log array', () => {
    const searchQuery = { query: 'fitness' }

    store.dispatch('events/search', searchQuery)
    expect(store.state.events.log.length).toEqual(1)
    expect(store.state.events.log[0].eventType).toEqual('search')
    expect(store.state.events.log[0]).toEqual(
      expect.objectContaining(searchQuery)
    )
  })
})
