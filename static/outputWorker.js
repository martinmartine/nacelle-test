onmessage = function(e) {
  const vm = e.data
  let output = JSON.parse(JSON.stringify(vm.filteredData))

  output = output.filter(item => {
    if (vm.activePriceRange) {
      if (vm.activePriceRange.range[0] === 0) {
        if (
          parseFloat(item.minPrice) < parseFloat(vm.activePriceRange.range[1])
        ) {
          return true
        } else {
          return false
        }
      } else if (vm.activePriceRange.range[1] === 0) {
        if (
          parseFloat(item.minPrice) > parseFloat(vm.activePriceRange.range[0])
        ) {
          return true
        } else {
          return false
        }
      } else if (
        parseFloat(item.minPrice) > parseFloat(vm.activePriceRange.range[0]) &&
        parseFloat(item.minPrice) < parseFloat(vm.activePriceRange.range[1])
      ) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  })

  switch (vm.sortBy) {
    case 'hi-low':
      postMessage(
        output.sort((a, b) => {
          if (parseFloat(a.priceRange.min) < parseFloat(b.priceRange.min)) {
            return 1
          }
          if (parseFloat(a.priceRange.min) > parseFloat(b.priceRange.min)) {
            return -1
          }

          return 0
        })
      )
      break
    case 'low-hi':
      postMessage(
        output.sort((a, b) => {
          if (parseFloat(a.priceRange.min) < parseFloat(b.priceRange.min)) {
            return -1
          }
          if (parseFloat(a.priceRange.min) > parseFloat(b.priceRange.min)) {
            return 1
          }

          return 0
        })
      )
      break
    default:
      postMessage(output)
  }
}
