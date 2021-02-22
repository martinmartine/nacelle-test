import cart from '../store/cart'
import checkout from '../store/checkout'
import menu from '../store/menu'
import modal from '../store/modal'
import events from '../store/events'
import products from '../store/products'
import user from '../store/user'
import space from '../store/space'
import search from '../store/search'
import collections from '../store/collections'
import wishlist from '../store/wishlist'

export default () => {
  return {
    modules: {
      cart,
      checkout,
      menu,
      modal,
      events,
      products,
      user,
      space,
      search,
      collections,
      wishlist
    }
  }
}
