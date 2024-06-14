/* global game, Hooks */

export class WereForms {
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
        value.nickname = game.i18n.localize(value.nickname)
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
    WereForms.initializeLabels()
  }

  static homid = {
    label: 'WOD5E.WTA.HomidName',
    nickname: 'WOD5E.WTA.HomidTitle',
    cost: 0,
    abilities: ['Silver Immunity']
  }

  static lupus = {
    label: 'WOD5E.WTA.LupusName',
    nickname: 'WOD5E.WTA.LupusTitle',
    cost: 0,
    abilities: ['Silver Immunity', 'Social Tests: Limited to wolves and Garou']
  }

  static hispo = {
    label: 'WOD5E.WTA.HispoName',
    nickname: 'WOD5E.WTA.HispoTitle',
    cost: 1,
    abilities: [
      '(Non-Stealth) Physical Tests: +2',
      'Stealth Tests: -2',
      'Social Tests: Limited to wolves and Garou',
      'Regenerate: 1/Rage Check',
      'Bite: +1 Aggravated'
    ],
    bonuses: [
      {
        source: 'WOD5E.WTA.HispoName',
        value: 2,
        paths: ['abilities.strength', 'abilities.dexterity', 'abilities.stamina'],
        unless: ['skills.stealth'],
        activeWhen: {
          check: 'isEqual',
          path: 'activeForm',
          value: 'hispo'
        }
      },
      {
        source: 'WOD5E.WTA.HispoName',
        value: -2,
        paths: ['skills.stealth'],
        activeWhen: {
          check: 'isEqual',
          path: 'activeForm',
          value: 'hispo'
        }
      }
    ]
  }

  static glabro = {
    label: 'WOD5E.WTA.GlabroName',
    nickname: 'WOD5E.WTA.GlabroTitle',
    cost: 1,
    abilities: ['Physical Tests: +2', 'Social Tests: -2', 'Regenerate: 1/Rage Check'],
    bonuses: [
      {
        source: 'WOD5E.WTA.GlabroName',
        value: 2,
        paths: ['abilities.strength', 'abilities.dexterity', 'abilities.stamina'],
        activeWhen: {
          check: 'isEqual',
          path: 'activeForm',
          value: 'glabro'
        }
      },
      {
        source: 'WOD5E.WTA.GlabroName',
        value: -2,
        paths: ['abilities.charisma', 'abilities.manipulation', 'abilities.composure'],
        activeWhen: {
          check: 'isEqual',
          path: 'activeForm',
          value: 'glabro'
        }
      }
    ]
  }

  static crinos = {
    label: 'WOD5E.WTA.CrinosName',
    nickname: 'WOD5E.WTA.CrinosTitle',
    cost: 2,
    abilities: [
      'Frenzy Risk, 1 Willpower/turn',
      'Physical Tests: +4',
      'Health: +4',
      'Social Tests: Auto-failure',
      'Mental Tests: Auto-failure',
      'Regenerate: 2/Rage Check',
      'Claws: +3',
      'Bite: +1 Aggravated',
      'Causes Delirium'
    ],
    bonuses: [
      {
        source: 'WOD5E.WTA.CrinosName',
        value: 4,
        paths: ['abilities.strength', 'abilities.dexterity', 'abilities.stamina'],
        activeWhen: {
          check: 'isEqual',
          path: 'activeForm',
          value: 'crinos'
        }
      }
    ]
  }
}

Hooks.once('ready', WereForms.onReady)
