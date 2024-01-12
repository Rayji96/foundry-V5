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
    const modifiers = getModifiers(data, selectors)

    // Return the array of modifiers to whatever called for it
    return modifiers

    // Function to parse through the actor's data and retrieve any bonuses
    // that match any of the selectors given
    function getModifiers(dataset, selectors) {
      const result = []
    
      Object.values(dataset).forEach((obj) => {
        if (obj && obj.bonuses && Array.isArray(obj.bonuses)) {
          obj.bonuses.forEach((bonus) => {
            if (bonus.instances && Array.isArray(bonus.instances)) {
              const includesSelector = bonus.instances.some((instance) => {
                return selectors.includes(instance)
              })
      
              if (includesSelector) {
                result.push(bonus)
              }
            }
          })
        }
      })
    
      return result
    }
  }