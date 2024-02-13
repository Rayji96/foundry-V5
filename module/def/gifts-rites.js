/* global game */

export class GiftsRites {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  // Optional string can be provided to filter by type
  static getList(type) {
    return Object.entries(this)
      .filter(([key, value]) => typeof value === 'object' && value !== null && !Array.isArray(value) && (!type || value.type === type))
      .map(([key, value]) => ({ [key]: value }));
  }

  // Localize the labels
  static initializeLabels() {
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        value.label = game.i18n.localize(value.label)
      }
    }
  }
  
  // Run any necessary compilation on ready
  static onReady() {
    GiftsRites.initializeLabels()
  }
  
}

// Hook to call onReady when the game is ready
Hooks.once('ready', GiftsRites.onReady)