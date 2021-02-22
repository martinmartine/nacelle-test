/**
 * Make sure to test your generated ld+json Structured Data
 * ---
 * https://search.google.com/test/rich-results
 */

import { mapGetters } from 'vuex'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'

export default type => {
  return {
    data() {
      return {
        schema: {}
      }
    },
    computed: {
      ...mapGetters('space', ['getMetatag']),
      content() {
        if (this.article && this.article.source === 'contentful') {
          return documentToPlainTextString(this.article.fields.content)
        }

        if (this.article.content) {
          return this.article.content
        }

        return ''
      }
    },

    created() {
      const image = this.getMetatag('og:image')

      this.schema = {
        /**
         * Product
         */
        ...(this.product && {
          product: {
            '@type': 'Product',
            name: this.product.title,
            url: `https://${this.$store.state.space.domain}${this.$route.path}`,
            ...(this.product.featuredMedia && {
              image: [this.product.featuredMedia.src]
            }),
            description: this.strip(this.product.description),
            brand: {
              '@type': 'Thing',
              name: this.product.vendor
            },
            ...(this.product.variants && {
              offers: {
                '@type': 'AggregateOffer',
                highPrice: this.product.priceRange.max,
                lowPrice: this.product.priceRange.max,
                priceCurrency: this.product.priceRange.currencyCode,
                offerCount: this.product.variants.length,
                offers: this.product.variants.map(variant => ({
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    ...(variant.featuredMedia && {
                      image: [variant.featuredMedia.src]
                    }),
                    ...(variant.title && {
                      name: variant.title
                    }),
                    ...(variant.sku && {
                      sku: variant.sku
                    }),
                    ...(variant.weight && {
                      weight: {
                        '@type': 'QuantitativeValue',
                        ...(variant.weightUnit && {
                          unitCode: variant.weightUnit
                        }),
                        value: `${variant.weight} ${variant.weightUnit}`
                      }
                    }),
                    offers: {
                      '@type': 'Offer',
                      availability: `http://schema.org/${
                        variant.availableForSale ? 'InStock' : 'OutOfStock'
                      }`,
                      price: variant.price,
                      priceCurrency: variant.priceCurrency,
                      url: `https://${this.$store.state.space.domain}${this.$route.path}`
                    }
                  }
                }))
              }
            })
          }
        }),

        /**
         * Article
         */
        ...(this.article && {
          article: {
            '@type': 'Article',
            articleBody: this.strip(this.content),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://${this.$store.state.space.domain}${this.$route.path}`
            },
            headline: this.article.title,
            ...(this.article.excerpt && {
              description: this.article.excerpt
            }),
            ...(this.article.featuredMedia && {
              image: [this.article.featuredMedia.src]
            }),
            ...(this.article.publishDate && {
              datePublished: new Date(
                this.article.publishDate * 1000
              ).toISOString()
            }),
            ...(this.article.createdAt && {
              dateCreated: new Date(this.article.createdAt * 1000).toISOString()
            }),
            ...(this.article.updatedAt && {
              dateModified: new Date(
                this.article.updatedAt * 1000
              ).toISOString()
            }),
            ...(this.article.author && {
              author: {
                '@type': 'Person',
                name: `${this.article.author.firstName} ${this.article.author.lastName}`
              }
            }),
            publisher: {
              '@type': 'Organization',
              name: this.$store.state.space.name,
              ...(image && {
                logo: {
                  '@type': 'ImageObject',
                  url: image.value
                }
              })
            }
          }
        })
      }
    },

    methods: {
      strip(html) {
        return typeof html === 'string' && html.replace(/<[^>]*>?/gm, '')
      }
    },

    jsonld() {
      if (!this.schema[type]) {
        return null
      }

      return {
        '@context': 'http://schema.org',
        ...this.schema[type]
      }
    }
  }
}
