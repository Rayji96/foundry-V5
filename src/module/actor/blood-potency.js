/* global game */

// NOTE: The blood potency table uses the updated rules from the v5 Companion

// surge: Amount of dice added on a blood surge
// mend: Amount mended on expenditure of vitae
// power: Bonus to discipline powers
// rouse: Max level of powers that can be rouse-rerolled
// bane: Bane severity number
export function getBloodPotencyValues (level) {
  const BLOOD_POTENCY_VALUES = [
    // Potency 0
    {
      surge: 1,
      mend: 1,
      power: 0,
      rouse: 0,
      bane: 0
    },
    // Potency 1
    {
      surge: 2,
      mend: 1,
      power: 0,
      rouse: 1,
      bane: 2
    },
    // Potency 2
    {
      surge: 2,
      mend: 2,
      power: 1,
      rouse: 1,
      bane: 2
    },
    // Potency 3
    {
      surge: 3,
      mend: 2,
      power: 1,
      rouse: 2,
      bane: 3
    },
    // Potency 4
    {
      surge: 3,
      mend: 3,
      power: 2,
      rouse: 2,
      bane: 3
    },
    // Potency 5
    {
      surge: 4,
      mend: 3,
      power: 2,
      rouse: 3,
      bane: 4
    },
    // Potency 6
    {
      surge: 4,
      mend: 3,
      power: 3,
      rouse: 3,
      bane: 4
    },
    // Potency 7
    {
      surge: 5,
      mend: 3,
      power: 3,
      rouse: 4,
      bane: 5
    },
    // Potency 8
    {
      surge: 5,
      mend: 4,
      power: 4,
      rouse: 4,
      bane: 5
    },
    // Potency 9
    {
      surge: 6,
      mend: 4,
      power: 4,
      rouse: 5,
      bane: 6
    },
    // Potency 10
    {
      surge: 6,
      mend: 5,
      power: 5,
      rouse: 5,
      bane: 6
    }
  ]
  return BLOOD_POTENCY_VALUES[level]
}

export function getBloodPotencyText (level) {
  // TODO : Some of this could be deducted from previous array.
  const BLOOD_POTENCY_TEXT = [
    {
      surge: game.i18n.localize('VTM5E.Add1Dice'),
      mend: game.i18n.localize('VTM5E.1SuperficialDamage'),
      power: game.i18n.localize('VTM5E.None'),
      rouse: game.i18n.localize('VTM5E.None'),
      bane: '0',
      feeding: game.i18n.localize('VTM5E.NoEffect')
    },
    {
      surge: game.i18n.localize('VTM5E.Add2Dice'),
      mend: game.i18n.localize('VTM5E.1SuperficialDamage'),
      power: game.i18n.localize('VTM5E.None'),
      rouse: game.i18n.localize('VTM5E.Level1'),
      bane: '2',
      feeding: game.i18n.localize('VTM5E.NoEffect')
    },
    {
      surge: game.i18n.localize('VTM5E.Add2Dice'),
      mend: game.i18n.localize('VTM5E.2SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add1Dice'),
      rouse: game.i18n.localize('VTM5E.Level1'),
      bane: '2',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty1')
    },
    {
      surge: game.i18n.localize('VTM5E.Add3Dice'),
      mend: game.i18n.localize('VTM5E.2SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add1Dice'),
      rouse: game.i18n.localize('VTM5E.Level2'),
      bane: '3',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty2')
    },
    {
      surge: game.i18n.localize('VTM5E.Add3Dice'),
      mend: game.i18n.localize('VTM5E.3SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add2Dice'),
      rouse: game.i18n.localize('VTM5E.Level2'),
      bane: '3',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty3')
    },
    {
      surge: game.i18n.localize('VTM5E.Add4Dice'),
      mend: game.i18n.localize('VTM5E.3SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add2Dice'),
      rouse: game.i18n.localize('VTM5E.Level3'),
      bane: '4',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty4')
    },
    {
      surge: game.i18n.localize('VTM5E.Add4Dice'),
      mend: game.i18n.localize('VTM5E.3SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add3Dice'),
      rouse: game.i18n.localize('VTM5E.Level3'),
      bane: '4',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty5')
    },
    {
      surge: game.i18n.localize('VTM5E.Add5Dice'),
      mend: game.i18n.localize('VTM5E.3SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add3Dice'),
      rouse: game.i18n.localize('VTM5E.Level4'),
      bane: '5',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty5')
    },
    {
      surge: game.i18n.localize('VTM5E.Add5Dice'),
      mend: game.i18n.localize('VTM5E.4SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add4Dice'),
      rouse: game.i18n.localize('VTM5E.Level4'),
      bane: '5',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty6')
    },
    {
      surge: game.i18n.localize('VTM5E.Add6Dice'),
      mend: game.i18n.localize('VTM5E.4SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add4Dice'),
      rouse: game.i18n.localize('VTM5E.Level5'),
      bane: '6',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty6')
    },
    {
      surge: game.i18n.localize('VTM5E.Add6Dice'),
      mend: game.i18n.localize('VTM5E.5SuperficialDamage'),
      power: game.i18n.localize('VTM5E.Add5Dice'),
      rouse: game.i18n.localize('VTM5E.Level5'),
      bane: '6',
      feeding: game.i18n.localize('VTM5E.FeedingPenalty7')
    }
  ]

  return BLOOD_POTENCY_TEXT[level]
}
