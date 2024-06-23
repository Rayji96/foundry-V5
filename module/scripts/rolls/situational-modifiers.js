/**
 * Function to help collect any situational modifiers
 *
 * @param actor                     The actor that the modifiers are being looked up from
 * @param selectors                 All selectors that the function will look for
 */
export async function getSituationalModifiers ({
  actor,
  selectors
}) {
  // Variables
  const data = actor.system
  const allModifiers = getModifiers(data, selectors)
  const activeModifiers = filterModifiers(data, allModifiers)

  // Return the array of modifiers to whatever called for it
  return activeModifiers

  // Function to parse through the actor's data and retrieve any bonuses
  // that match any of the selectors given
  function getModifiers (data, selectors) {
    const modifiers = []

    // Run a search for bonuses within the actor's data
    searchBonuses(data, '')
    function searchBonuses (obj, path) {
      // Ensure that we're receiving a valid object
      if (typeof obj !== 'object' || obj === null) {
        return
      }

      // Check if there's a "bonuses" path that is an array
      if (obj.bonuses && Array.isArray(obj.bonuses)) {
        // Check for matching bonuses, or 'all'
        const matchingBonuses = obj.bonuses.filter(bonus =>
          selectors.some(selector => bonus.paths.includes(selector)) || bonus.paths.includes('all')
        )

        // If there are any matching bonuses, push it to the modifiers list
        if (matchingBonuses.length > 0) {
          modifiers.push(...matchingBonuses)
        }
      }

      // If there are further objects to search, search those for bonuses as well
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key

        if (typeof value === 'object' && value !== null) {
          searchBonuses(value, currentPath)
        }
      })
    }

    return modifiers
  }

  // Filter out only modifiers that apply to the roll we're doing
  function filterModifiers (data, modifiers) {
    return modifiers.filter(modifier => {
      const { check, path, value } = modifier?.activeWhen || {}
      const displayWhenInactive = modifier?.displayWhenInactive || ''
      const unless = modifier?.unless || ''
      let showModifier = false

      // Check if any 'unless' strings are present in the 'selectors' array
      if (unless && unless.some(value => selectors.indexOf(value) !== -1)) {
        modifier.isActive = false
        return false
      }

      // As long as the path is found, the modifier will be active
      if (check === 'always') {
        modifier.isActive = true
        showModifier = true
      }

      // If the path has a qualifier, it's checked for here
      if (check === 'isEqual') {
        const pathValue = path.split('.').reduce((obj, key) => obj[key], data)
        modifier.isActive = true
        showModifier = String(pathValue) === value
      }

      // If the qualifier is the path, the modifier will be active
      if (check === 'isPath' && selectors.indexOf(path) > -1) {
        modifier.isActive = true
        showModifier = true
      }

      // If the modifier should be shown no matter what, still show it but don't make it active
      if (displayWhenInactive && !modifier.isActive) {
        modifier.isActive = false
        showModifier = true
      }

      return showModifier
    })
  }
}

/**
 * A function that wraps around getSituationalModifiers, but returns
 * the total active bonuses amount as a number instead of an array
 * of all the bonuses as objects
 *
 * @param actor                     The actor that the modifiers are being looked up from
 * @param selectors                 All selectors that the function will look for
 */
export async function getActiveBonuses ({
  actor,
  selectors
}) {
  const situationalModifiers = await getSituationalModifiers({
    actor,
    selectors
  })
  const activeModifiers = situationalModifiers.filter(modifier => modifier.isActive === true)
  let totalValue = 0
  let totalACDValue = 0

  activeModifiers.forEach((modifier) => {
    totalValue += parseInt(modifier.value)
    totalACDValue += parseInt(modifier.advancedCheckDice)
  })

  return {
    totalValue,
    totalACDValue
  }
}
