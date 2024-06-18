/* global game, Hooks */

export class Features {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList () {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .reduce((accumulator, [key, value]) => {
        accumulator[key] = value
        return accumulator
      }, {})
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
    Features.initializeLabels()
  }

  static background = {
    label: 'WOD5E.ItemsList.Background'
  }

  static merit = {
    label: 'WOD5E.ItemsList.Merit'
  }

  static flaw = {
    label: 'WOD5E.ItemsList.Flaw'
  }

  static boon = {
    label: 'WOD5E.ItemsList.Boon'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Features.onReady)
