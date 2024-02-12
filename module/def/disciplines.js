/* global game */

export class Disciplines {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList() {
    return Object.entries(this)
      .filter(([key, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .map(([key, value]) => ({ [key]: value }));
  }

  // Function to help with quick localization
  static localize (discipline) {
    return game.i18n.localize(this[discipline].label)
  }

  static animalism = {
    label: "WOD5E.VTM.Animalism"
  }

  static auspex = {
    label: "WOD5E.VTM.Auspex"
  }

  static celerity = {
    label: "WOD5E.VTM.Celerity"
  }

  static dominate = {
    label: "WOD5E.VTM.Dominate"
  }

  static fortitude = {
    label: "WOD5E.VTM.Fortitude"
  }

  static obfuscate = {
    label: "WOD5E.VTM.Obfuscate"
  }

  static potence = {
    label: "WOD5E.VTM.Potence"
  }

  static presence = {
    label: "WOD5E.VTM.Presence"
  }

  static protean = {
    label: "WOD5E.VTM.Protean"
  }

  static sorcery = {
    label: "WOD5E.VTM.BloodSorcery"
  }

  static oblivion = {
    label: "WOD5E.VTM.Oblivion"
  }

  static alchemy = {
    label: "WOD5E.VTM.ThinBloodAlchemy"
  }

  static rituals = {
    label: "WOD5E.VTM.Rituals"
  }

  static ceremonies = {
    label: "WOD5E.VTM.Ceremonies"
  }
}