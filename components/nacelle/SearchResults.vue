<template>
  <div>
    <transition name="fade" mode="out-in">
      <div
        v-if="searchResults && searchResults.length == 0"
        key="no-results"
        class="no-results"
      >
        <slot name="no-results"></slot>
      </div>
      <div key="results" class="search-results" v-else>
        <slot name="result" :result="searchResults"></slot>
      </div>
    </transition>
  </div>
</template>

<script>
import Fuse from 'fuse.js'
import { mapActions } from 'vuex'

export default {
  props: {
    searchKeys: {
      type: Array,
      default: () => {
        return ['title']
      }
    },
    searchData: {
      type: Array
    },
    searchQuery: {
      type: Object
    },
    relevanceThreshold: {
      type: Number,
      default: 0.5
    }
  },
  data() {
    return {
      searchRes: null
    }
  },
  computed: {
    searchResults() {
      if (
        this.searchData &&
        this.searchQuery &&
        this.searchQuery.value &&
        String(this.searchQuery.value) !== ''
      ) {
        const options = {
          keys: this.searchKeys,
          threshold: this.relevanceThreshold
        }
        const results = new Fuse(this.searchData, options)
          .search(String(this.searchQuery.value))
          .filter(result => typeof result.item !== 'undefined')
          .map(result => result.item)

        this.$emit('results')

        const trackSearchEvent = this.debounce(this.search, 500)
        trackSearchEvent({
          query: this.searchQuery.value,
          resultCount: results.length
        })

        return results
      }

      this.$emit('no-query')

      return this.searchData
    }
  },
  methods: {
    ...mapActions('events', ['search']),
    debounce(fn, debounceTime) {
      return (...args) => {
        if (this.timeout !== null) {
          clearTimeout(this.timeout)
        }

        this.timeout = setTimeout(() => fn(...args), debounceTime)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-results,
.no-results {
  min-height: 400px;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
