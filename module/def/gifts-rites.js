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

  // Function to help with quick localization
  static localize (gift) {
    return game.i18n.localize(this[gift].label)
  }
  
}