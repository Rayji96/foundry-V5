/* global game, Hooks */

export class Attributes {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  // Optional string can be provided to filter by type
  static getList (type) {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value) && (!type || value.type === type))
      .map(([key, value]) => ({ [key]: value }))
  }

  // Method to add extra attributes
  static addCustom(customAttributes) {
    for (const [key, value] of Object.entries(customAttributes)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this[value.id] = value
      }
    }
  }

  // Localize the labels
  static initializeLabels () {
    const modifications = game.settings.get('vtm5e', 'modifiedAttributes')

    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const checkModification = modifications.filter(attribute => attribute.id === key)

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
    const customAttributes = game.settings.get('vtm5e', 'customAttributes')

    if (customAttributes) {
      Attributes.addCustom(customAttributes)
    }

    Attributes.initializeLabels()
  }

  static strength = {
    label: 'WOD5E.Attributes.Strength',
    type: 'physical'
  }

  static charisma = {
    label: 'WOD5E.Attributes.Charisma',
    type: 'social'
  }

  static intelligence = {
    label: 'WOD5E.Attributes.Intelligence',
    type: 'mental'
  }

  static dexterity = {
    label: 'WOD5E.Attributes.Dexterity',
    type: 'physical'
  }

  static manipulation = {
    label: 'WOD5E.Attributes.Manipulation',
    type: 'social'
  }

  static wits = {
    label: 'WOD5E.Attributes.Wits',
    type: 'mental'
  }

  static stamina = {
    label: 'WOD5E.Attributes.Stamina',
    type: 'physical'
  }

  static composure = {
    label: 'WOD5E.Attributes.Composure',
    type: 'social'
  }

  static resolve = {
    label: 'WOD5E.Attributes.Resolve',
    type: 'mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Attributes.onReady)
