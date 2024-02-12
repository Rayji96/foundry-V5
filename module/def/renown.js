/* global game */

export class Renown {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList() {
    return Object.entries(this)
      .filter(([key, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .map(([key, value]) => ({ [key]: value }));
  }

  // Function to help with quick localization
  static localize (renown) {
    return game.i18n.localize(this[renown].label)
  }
  
  static glory = {
    label: 'WOD5E.WTA.Glory'
  }

  static honor = {
    label: 'WOD5E.WTA.Honor'
  }

  static wisdom = {
    label: 'WOD5E.WTA.Wisdom'
  }
}