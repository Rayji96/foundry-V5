/* global game, Hooks */

export class Systems {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList () {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .map(([key, value]) => ({ [key]: value }))
  }

  // Localize the labels
  static initializeLabels () {
    for (const [, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value.label = game.i18n.localize(value.label)
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
    Systems.initializeLabels()
  }

  static mortal = {
    label: 'WOD5E.Mortal'
  }

  static vampire = {
    label: 'WOD5E.VTM.Label'
  }

  static werewolf = {
    label: 'WOD5E.WTA.Label'
  }

  static hunter = {
    label: 'WOD5E.HTR.Label'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Systems.onReady)
