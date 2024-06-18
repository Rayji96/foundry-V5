/* global game, Hooks */

export class Attributes {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  // Optional string can be provided to filter by type
  static getList ({
    type = '',
    custom = false
  }) {
    return Object.entries(this)
      // Filter out any entries with improper formats
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value) &&
        // Filter based on given filters provided with the function, if any
        (!type || value.type === type) && (!custom || value.custom === custom))
      // Reduce into a format the system can work with
      .reduce((accumulator, [key, value]) => {
        accumulator[key] = value
        return accumulator
      }, {})
  }

  // Method to add extra attributes
  static addCustom (customAttributes) {
    for (const [, value] of Object.entries(customAttributes)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Note this feature as being a custom feature
        value.custom = true

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

        // If there are modifications, update the attribute
        if (checkModification.length > 0) {
          value.rename = checkModification[0].rename
          value.hidden = checkModification[0].hidden
        } else {
          // If there are no modifications, use default values
          value.rename = ''
          value.hidden = false
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
    label: 'WOD5E.AttributesList.Strength',
    type: 'physical'
  }

  static charisma = {
    label: 'WOD5E.AttributesList.Charisma',
    type: 'social'
  }

  static intelligence = {
    label: 'WOD5E.AttributesList.Intelligence',
    type: 'mental'
  }

  static dexterity = {
    label: 'WOD5E.AttributesList.Dexterity',
    type: 'physical'
  }

  static manipulation = {
    label: 'WOD5E.AttributesList.Manipulation',
    type: 'social'
  }

  static wits = {
    label: 'WOD5E.AttributesList.Wits',
    type: 'mental'
  }

  static stamina = {
    label: 'WOD5E.AttributesList.Stamina',
    type: 'physical'
  }

  static composure = {
    label: 'WOD5E.AttributesList.Composure',
    type: 'social'
  }

  static resolve = {
    label: 'WOD5E.AttributesList.Resolve',
    type: 'mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Attributes.onReady)
