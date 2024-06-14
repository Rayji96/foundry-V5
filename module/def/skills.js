/* global game, Hooks */

export class Skills {
  // Function to help with quickly grabbing all the listed values;
  // Will only retrieve objects (definitions)
  // Optional string can be provided to filter by type
  static getList (type) {
    return Object.entries(this)
      .filter(([, value]) => typeof value === 'object' && value !== null && !Array.isArray(value) && (!type || value.type === type))
      .reduce((accumulator, [key, value]) => {
        accumulator[key] = value
        return accumulator
      }, {})
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
    const customSkills = [] //game.settings.get('vtm5e', 'customSkills')

    if (customSkills) {
      Skills.addCustom(customSkills)
    }

    Skills.initializeLabels()
  }

  static athletics = {
    label: 'WOD5E.Skills.Athletics',
    type: 'physical'
  }

  static animalken = {
    label: 'WOD5E.Skills.AnimalKen',
    type: 'social'
  }

  static academics = {
    label: 'WOD5E.Skills.Academics',
    type: 'mental'
  }

  static brawl = {
    label: 'WOD5E.Skills.Brawl',
    type: 'physical'
  }

  static etiquette = {
    label: 'WOD5E.Skills.Etiquette',
    type: 'social'
  }

  static awareness = {
    label: 'WOD5E.Skills.Awareness',
    type: 'mental'
  }

  static craft = {
    label: 'WOD5E.Skills.Craft',
    type: 'physical'
  }

  static insight = {
    label: 'WOD5E.Skills.Insight',
    type: 'social'
  }

  static finance = {
    label: 'WOD5E.Skills.Finance',
    type: 'mental'
  }

  static drive = {
    label: 'WOD5E.Skills.Drive',
    type: 'physical'
  }

  static intimidation = {
    label: 'WOD5E.Skills.Intimidation',
    type: 'social'
  }

  static investigation = {
    label: 'WOD5E.Skills.Investigation',
    type: 'mental'
  }

  static firearms = {
    label: 'WOD5E.Skills.Firearms',
    type: 'physical'
  }

  static leadership = {
    label: 'WOD5E.Skills.Leadership',
    type: 'social'
  }

  static medicine = {
    label: 'WOD5E.Skills.Medicine',
    type: 'mental'
  }

  static larceny = {
    label: 'WOD5E.Skills.Larceny',
    type: 'physical'
  }

  static performance = {
    label: 'WOD5E.Skills.Performance',
    type: 'social'
  }

  static occult = {
    label: 'WOD5E.Skills.Occult',
    type: 'mental'
  }

  static melee = {
    label: 'WOD5E.Skills.Melee',
    type: 'physical'
  }

  static persuasion = {
    label: 'WOD5E.Skills.Persuasion',
    type: 'social'
  }

  static politics = {
    label: 'WOD5E.Skills.Politics',
    type: 'mental'
  }

  static stealth = {
    label: 'WOD5E.Skills.Stealth',
    type: 'physical'
  }

  static streetwise = {
    label: 'WOD5E.Skills.Streetwise',
    type: 'social'
  }

  static science = {
    label: 'WOD5E.Skills.Science',
    type: 'mental'
  }

  static survival = {
    label: 'WOD5E.Skills.Survival',
    type: 'physical'
  }

  static subterfuge = {
    label: 'WOD5E.Skills.Subterfuge',
    type: 'social'
  }

  static technology = {
    label: 'WOD5E.Skills.Technology',
    type: 'mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Skills.onReady)
