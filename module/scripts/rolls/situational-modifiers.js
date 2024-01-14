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
  
      function searchBonuses (obj, path) {
          if (typeof obj !== 'object' || obj === null) {
              return
          }
  
          if (obj.bonuses && Array.isArray(obj.bonuses)) {
              const matchingBonuses = obj.bonuses.filter(bonus =>
                  selectors.some(selector => bonus.paths.includes(selector))
              )
  
              if (matchingBonuses.length > 0) {
                  modifiers.push(...matchingBonuses)
              }
          }
  
          Object.entries(obj).forEach(([key, value]) => {
              const currentPath = path ? `${path}.${key}` : key
  
              if (typeof value === 'object' && value !== null) {
                  searchBonuses(value, currentPath)
              }
          })
      }
  
      searchBonuses(data, '')
  
      return modifiers
    }

    function filterModifiers (data, modifiers) {
      return modifiers.filter(modifier => {
        const { check, path, value } = modifier.activeWhen
    
        if (check === 'always') {
          return true
        }
    
        if (check === 'isEqual') {
          const pathValue = path.split('.').reduce((obj, key) => obj[key], data)
          return pathValue === value
        }
    
        return false
      })
    }
  }