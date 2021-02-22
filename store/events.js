import Vue from 'vue'

const eventProperties = rootState => {
  const { user, space, cart } = rootState || {}
  const spaceId = space ? space.id : null
  const userId = user && user.userID ? user.userID : null
  const anonymousId = user && user.anonymousId ? user.anonymousId : null
  return {
    spaceId,
    ...(cart && cart.lineItems && { cart: cart.lineItems }),
    user: {
      ...user,
      userId,
      anonymousId
    }
  }
}
export const state = () => ({
  log: []
})

export const mutations = {
  addEvent(state, event) {
    state.log.push(event)
  }
}

export const actions = {
  sendEvent({ commit, rootState }, payload) {
    const event = {
      ...eventProperties(rootState),
      ...payload
    }
    try {
      Vue.prototype.$nuxt.$nacelle.events.log(event)
    } catch (error) {
      console.error(error)
    }
    commit('addEvent', event)
  },

  pageView({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'pageView',
      ...payload
    })
  },

  productView({ dispatch }, product) {
    dispatch('sendEvent', {
      eventType: 'productView',
      product
    })
  },

  collectionView({ dispatch }, collection) {
    dispatch('sendEvent', {
      eventType: 'collectionView',
      collection
    })
  },

  blogView({ dispatch }, blog) {
    dispatch('sendEvent', {
      eventType: 'blogView',
      blog
    })
  },

  articleView({ dispatch }, article) {
    dispatch('sendEvent', {
      eventType: 'articleView',
      article
    })
  },

  addToCart({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'cartAdd',
      ...payload
    })
  },

  removeFromCart({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'cartRemove',
      ...payload
    })
  },

  checkoutInit({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'checkoutInit',
      ...payload
    })
  },

  checkoutComplete({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'checkoutComplete',
      ...payload
    })
  },

  emailSignup({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'emailSignup',
      ...payload
    })
  },

  search({ dispatch, commit }, payload) {
    commit('setSearchResults', payload)
    dispatch('sendEvent', {
      eventType: 'search',
      ...payload
    })
  },

  searchSelected({ dispatch, state }, payload) {
    dispatch('sendEvent', {
      eventType: 'searchSelected',
      ...state.searchResults,
      ...payload
    })
  },

  productRecommendation({ dispatch }, payload) {
    dispatch('sendEvent', {
      eventType: 'productRecommendation',
      ...payload
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
