/* global game, Hooks */

export class Skills {
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

  // Method to add extra skills
  static addCustom (customSkills) {
    for (const [, value] of Object.entries(customSkills)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Note this feature as being a custom feature
        value.custom = true

        this[value.id] = value
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
    const customSkills = game.settings.get('vtm5e', 'customSkills')

    if (customSkills) {
      Skills.addCustom(customSkills)
    }

    Skills.initializeLabels()
  }

  static athletics = {
    label: 'WOD5E.SkillsList.Athletics',
    type: 'physical'
  }

  static animalken = {
    label: 'WOD5E.SkillsList.AnimalKen',
    type: 'social'
  }

  static academics = {
    label: 'WOD5E.SkillsList.Academics',
    type: 'mental'
  }

  static brawl = {
    label: 'WOD5E.SkillsList.Brawl',
    type: 'physical'
  }

  static etiquette = {
    label: 'WOD5E.SkillsList.Etiquette',
    type: 'social'
  }

  static awareness = {
    label: 'WOD5E.SkillsList.Awareness',
    type: 'mental'
  }

  static craft = {
    label: 'WOD5E.SkillsList.Craft',
    type: 'physical'
  }

  static insight = {
    label: 'WOD5E.SkillsList.Insight',
    type: 'social'
  }

  static finance = {
    label: 'WOD5E.SkillsList.Finance',
    type: 'mental'
  }

  static drive = {
    label: 'WOD5E.SkillsList.Drive',
    type: 'physical'
  }

  static intimidation = {
    label: 'WOD5E.SkillsList.Intimidation',
    type: 'social'
  }

  static investigation = {
    label: 'WOD5E.SkillsList.Investigation',
    type: 'mental'
  }

  static firearms = {
    label: 'WOD5E.SkillsList.Firearms',
    type: 'physical'
  }

  static leadership = {
    label: 'WOD5E.SkillsList.Leadership',
    type: 'social'
  }

  static medicine = {
    label: 'WOD5E.SkillsList.Medicine',
    type: 'mental'
  }

  static larceny = {
    label: 'WOD5E.SkillsList.Larceny',
    type: 'physical'
  }

  static performance = {
    label: 'WOD5E.SkillsList.Performance',
    type: 'social'
  }

  static occult = {
    label: 'WOD5E.SkillsList.Occult',
    type: 'mental'
  }

  static melee = {
    label: 'WOD5E.SkillsList.Melee',
    type: 'physical'
  }

  static persuasion = {
    label: 'WOD5E.SkillsList.Persuasion',
    type: 'social'
  }

  static politics = {
    label: 'WOD5E.SkillsList.Politics',
    type: 'mental'
  }

  static stealth = {
    label: 'WOD5E.SkillsList.Stealth',
    type: 'physical'
  }

  static streetwise = {
    label: 'WOD5E.SkillsList.Streetwise',
    type: 'social'
  }

  static science = {
    label: 'WOD5E.SkillsList.Science',
    type: 'mental'
  }

  static survival = {
    label: 'WOD5E.SkillsList.Survival',
    type: 'physical'
  }

  static subterfuge = {
    label: 'WOD5E.SkillsList.Subterfuge',
    type: 'social'
  }

  static technology = {
    label: 'WOD5E.SkillsList.Technology',
    type: 'mental'
  }
}

// Hook to call onReady when the game is ready
Hooks.once('ready', Skills.onReady)
