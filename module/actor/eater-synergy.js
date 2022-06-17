/* global game */

// NOTE: The blood potency table uses the updated rules from the v5 Companion

// surge: Amount of dice added on a blood surge
// mend: Amount mended on expenditure of vitae
// power: Bonus to discipline powers
// rouse: Max level of powers that can be rouse-rerolled
// bane: Bane severity number
export function getSynergyValues (level) {
    const SYNERGY_VALUES = [
      // Potency 0
      {
        power: 0,
        rouse: 0
      },
      // Potency 1
      {
        power: 1,
        rouse: 1
      },
      // Potency 2
      {
        power: 2,
        rouse: 1
      },
      // Potency 3
      {
        power: 3,
        rouse: 2
      },
      // Potency 4
      {
        power: 4,
        rouse: 2
      },
      // Potency 5
      {
        power: 5,
        rouse: 3
      },
      // Potency 6
      {
        power: 6,
        rouse: 3
      },
      // Potency 7
      {
        power: 7,
        rouse: 4
      },
      // Potency 8
      {
        power: 8,
        rouse: 4
      },
      // Potency 9
      {
        power: 9,
        rouse: 5
      },
      // Potency 10
      {
        power: 10,
        rouse: 5
      }
    ]
    return SYNERGY_VALUES[level]
  }

  export function getSynergyText (level) {
    // TODO : Some of this could be deducted from previous array.
    const SYNERGY_TEXT = [
      {
        power: game.i18n.localize('VTM5E.None'),
        rouse: game.i18n.localize('VTM5E.None')
      },
      {
        power: game.i18n.localize('VTM5E.Add1Dice'),
        rouse: game.i18n.localize('VTM5E.Level1')
      },
      {
        power: game.i18n.localize('VTM5E.Add2Dice'),
        rouse: game.i18n.localize('VTM5E.Level1')
      },
      {
        power: game.i18n.localize('VTM5E.Add3Dice'),
        rouse: game.i18n.localize('VTM5E.Level2')
      },
      {
        power: game.i18n.localize('VTM5E.Add4Dice'),
        rouse: game.i18n.localize('VTM5E.Level2')
      },
      {
        power: game.i18n.localize('VTM5E.Add5Dice'),
        rouse: game.i18n.localize('VTM5E.Level3')
      },
      {
        power: game.i18n.localize('VTM5E.Add6Dice'),
        rouse: game.i18n.localize('VTM5E.Level3')
      },
      {
        power: game.i18n.localize('VTM5E.Add7Dice'),
        rouse: game.i18n.localize('VTM5E.Level4')
      },
      {
        power: game.i18n.localize('VTM5E.Add8Dice'),
        rouse: game.i18n.localize('VTM5E.Level4')
      },
      {
        power: game.i18n.localize('VTM5E.Add9Dice'),
        rouse: game.i18n.localize('VTM5E.Level5')
      },
      {
        power: game.i18n.localize('VTM5E.Add10Dice'),
        rouse: game.i18n.localize('VTM5E.Level5')
      }
    ]
  
    return SYNERGY_TEXT[level]
  }
  