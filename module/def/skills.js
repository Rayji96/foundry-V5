/* global game, Hooks */

export class Skills {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  // Optional string can be provided to filter by type
  static getList (type) {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value) && (!type || value.type === type))
      .map(([key, value]) => ({ [key]: value }))
  }

  // Method to add extra skills
  static addCustom(customSkills) {
    for (const [key, value] of Object.entries(customSkills)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this[key] = value
      }
    }
  }

  // Localize the labels
  static initializeLabels () {
    const modifications = game.settings.get('vtm5e', 'modifiedSkills')

    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const checkModification = modifications.filter(skill => skill.id === key)

        value.label = game.i18n.localize(value.label)

        if (checkModification.length > 0) {
          value.rename = checkModification[0].rename
          value.hidden = checkModification[0].hidden
        }
      }

      // Handle which label to display
      if (value.rename) {
        value.displayName = value.rename
      } else {
        value.displayName = value.label
      }
    }
  }

  // Run any necessary compilation on ready
  static onReady () {
    const customSkills = game.settings.get('vtm5e', 'customSkills')

    if (customSkills) {
      Skills.addCustom(customSkills)
    }

    Skills.initializeLabels()
  }

  static athletics = {
    label: 'WOD5E.Skills.Athletics',
    type: 'physical'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Skills.onReady)
