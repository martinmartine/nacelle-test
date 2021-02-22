import storeConfig from '../storeConfig'
import { mount, createLocalVue } from '@vue/test-utils'
import EventDispatcher from '@/components/nacelle/EventDispatcher'
import Vuex from 'vuex'
import products from '../mocks/static-products'

const localVue = createLocalVue()

localVue.use(Vuex)

const store = new Vuex.Store(storeConfig())

const wrapper = mount(EventDispatcher, {
  localVue,
  store
})

const product = products[0]

const { handle, image, metafields, id, title } = product

const lineItem = {
  variant: product.variants[0],
  handle,
  image,
  title,
  quantity: 1,
  productId: id,
  metafields
}

describe('Event Dispatcher', () => {
  it('tracks a page view event', () => {
    store.dispatch('events/pageView', {
      url: 'https://www.example.com/blog/some-article'
    })

    expect(wrapper.vm.logEntry.eventType).toEqual('pageView')

    expect(wrapper.vm.logEntry.url).toEqual(
      'https://www.example.com/blog/some-article'
    )
  })

  it('tracks a product view event', () => {
    store.dispatch('events/productView', product)

    expect(wrapper.vm.logEntry.eventType).toEqual('productView')

    expect(wrapper.vm.logEntry.product.title).toEqual(product.title)

    expect(wrapper.vm.logEntry.product.id).toEqual(product.id)
  })

  it('tracks an add-to-cart event', () => {
    store.dispatch('events/addToCart', {
      product: lineItem,
      cart: store.state.cart.lineItems
    })

    expect(wrapper.vm.logEntry.eventType).toEqual('cartAdd')

    expect(wrapper.vm.logEntry.product.variant.title).toEqual(
      lineItem.variant.title
    )

    expect(
      wrapper.vm.decodeBase64VariantId(wrapper.vm.logEntry.product.variant.id)
    ).toEqual(wrapper.vm.decodeBase64VariantId(lineItem.variant.id))
  })

  it('tracks an remove-from-cart event', () => {
    store.dispatch('events/removeFromCart', {
      product: lineItem,
      cart: store.state.cart.lineItems
    })

    expect(wrapper.vm.logEntry.eventType).toEqual('cartRemove')

    expect(wrapper.vm.logEntry.product.variant.title).toEqual(
      lineItem.variant.title
    )

    expect(
      wrapper.vm.decodeBase64VariantId(wrapper.vm.logEntry.product.variant.id)
    ).toEqual(wrapper.vm.decodeBase64VariantId(lineItem.variant.id))
  })

  it('tracks an checkout initiation event', () => {
    const cart = product.variants.map(variant => {
      return {
        variant,
        handle,
        image,
        title,
        quantity: 1,
        productId: id,
        metafields
      }
    })

    cart.forEach(item => {
      store.dispatch('cart/addLineItem', item)
    })

    store.dispatch('events/checkoutInit', cart)

    expect(wrapper.vm.logEntry.eventType).toEqual('checkoutInit')

    expect(wrapper.vm.productIDs).toEqual(
      cart.map(item => wrapper.vm.decodeBase64VariantId(item.id))
    )

    expect(
      store.state.cart.lineItems.reduce((acc, item) => acc + item.quantity, 0)
    ).toEqual(cart.length)
  })
})
