/* global game */

export class Edges {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  static getList() {
    return Object.entries(this)
      .filter(([key, value]) => typeof value === 'object' && value !== null && !Array.isArray(value))
      .map(([key, value]) => ({ [key]: value }));
  }

  // Function to help with quick localization
  static localize (edge) {
    return game.i18n.localize(this[edge].label)
  }
  
  static arsenal = {
    label: "WOD5E.HTR.Arsenal"
  }

  static fleet = {
    label: "WOD5E.HTR.Fleet"
  }

  static ordnance = {
    label: "WOD5E.HTR.Ordnance"
  }

  static library = {
    label: "WOD5E.HTR.Library"
  }

  static improvisedgear = {
    label: "WOD5E.HTR.ImprovisedGear"
  }

  static globalaccess = {
    label: "WOD5E.HTR.GlobalAccess"
  }

  static dronejockey = {
    label: "WOD5E.HTR.DroneJockey"
  }

  static beastwhisperer = {
    label: "WOD5E.HTR.BeastWhisperer"
  }

  static sensetheunnatural = {
    label: "WOD5E.HTR.SenseTheUnnatural"
  }

  static repeltheunnatural = {
    label: "WOD5E.HTR.RepelTheUnnatural"
  }

  static thwarttheunnatural = {
    label: "WOD5E.HTR.ThwartTheUnnatural"
  }

  static artifact = {
    label: "WOD5E.HTR.Artifact"
  }
}