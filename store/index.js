export const state = () => ({
  collectionLimit: 12
})

export const mutations = {}

export const actions = {
  async nuxtClientInit(ctx, context) {
    await this.$nacelle.nacelleNuxtServerInit(ctx, context)
  },
  async nuxtServerInit(ctx, context) {
    await this.$nacelle.nacelleNuxtServerInit(ctx, context)
  }
}
