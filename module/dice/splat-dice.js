/* global Die */

// Import dice face-related variables for icon paths
import { mortalDiceLocation, vampireDiceLocation, werewolfDiceLocation, hunterDiceLocation, normalDiceFaces, hungerDiceFaces, rageDiceFaces, desperationDiceFaces } from './icons.js'

/**
 * Extend the basic Die for the Mortal (m) dice
 * @extends {Die}
 */
export class MortalDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 'm'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${mortalDiceLocation + normalDiceFaces.failure}" />`,
      2: `<img src="${mortalDiceLocation + normalDiceFaces.failure}" />`,
      3: `<img src="${mortalDiceLocation + normalDiceFaces.failure}" />`,
      4: `<img src="${mortalDiceLocation + normalDiceFaces.failure}" />`,
      5: `<img src="${mortalDiceLocation + normalDiceFaces.failure}" />`,
      6: `<img src="${mortalDiceLocation + normalDiceFaces.success}" />`,
      7: `<img src="${mortalDiceLocation + normalDiceFaces.success}" />`,
      8: `<img src="${mortalDiceLocation + normalDiceFaces.success}" />`,
      9: `<img src="${mortalDiceLocation + normalDiceFaces.success}" />`,
      10: `<img src="${mortalDiceLocation + normalDiceFaces.critical}" />`
    }[result]
  }
}

/**
 * Extend the basic Die for the Vampire (v) dice
 * @extends {Die}
 */
export class VampireDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 'v'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${vampireDiceLocation + normalDiceFaces.failure}" />`,
      2: `<img src="${vampireDiceLocation + normalDiceFaces.failure}" />`,
      3: `<img src="${vampireDiceLocation + normalDiceFaces.failure}" />`,
      4: `<img src="${vampireDiceLocation + normalDiceFaces.failure}" />`,
      5: `<img src="${vampireDiceLocation + normalDiceFaces.failure}" />`,
      6: `<img src="${vampireDiceLocation + normalDiceFaces.success}" />`,
      7: `<img src="${vampireDiceLocation + normalDiceFaces.success}" />`,
      8: `<img src="${vampireDiceLocation + normalDiceFaces.success}" />`,
      9: `<img src="${vampireDiceLocation + normalDiceFaces.success}" />`,
      10: `<img src="${vampireDiceLocation + normalDiceFaces.critical}" />`
    }[result]
  }
}

/**
 * Extend the basic Die for the Hunger (g) dice
 * @extends {Die}
 */
export class VampireHungerDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 'g'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${vampireDiceLocation + hungerDiceFaces.bestial}" />`,
      2: `<img src="${vampireDiceLocation + hungerDiceFaces.failure}" />`,
      3: `<img src="${vampireDiceLocation + hungerDiceFaces.failure}" />`,
      4: `<img src="${vampireDiceLocation + hungerDiceFaces.failure}" />`,
      5: `<img src="${vampireDiceLocation + hungerDiceFaces.failure}" />`,
      6: `<img src="${vampireDiceLocation + hungerDiceFaces.success}" />`,
      7: `<img src="${vampireDiceLocation + hungerDiceFaces.success}" />`,
      8: `<img src="${vampireDiceLocation + hungerDiceFaces.success}" />`,
      9: `<img src="${vampireDiceLocation + hungerDiceFaces.success}" />`,
      10: `<img src="${vampireDiceLocation + hungerDiceFaces.critical}" />`
    }[result]
  }
}

/**
 * Extend the basic Die for the Hunter (h) dice
 * @extends {Die}
 */
export class HunterDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 'h'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${hunterDiceLocation + normalDiceFaces.failure}" />`,
      2: `<img src="${hunterDiceLocation + normalDiceFaces.failure}" />`,
      3: `<img src="${hunterDiceLocation + normalDiceFaces.failure}" />`,
      4: `<img src="${hunterDiceLocation + normalDiceFaces.failure}" />`,
      5: `<img src="${hunterDiceLocation + normalDiceFaces.failure}" />`,
      6: `<img src="${hunterDiceLocation + normalDiceFaces.success}" />`,
      7: `<img src="${hunterDiceLocation + normalDiceFaces.success}" />`,
      8: `<img src="${hunterDiceLocation + normalDiceFaces.success}" />`,
      9: `<img src="${hunterDiceLocation + normalDiceFaces.success}" />`,
      10: `<img src="${hunterDiceLocation + normalDiceFaces.critical}" />`
    }[result]
  }
}

/**
 * Extend the basic Die for the Desperation (s) dice
 * @extends {Die}
 */
export class HunterDesperationDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 's'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${hunterDiceLocation + desperationDiceFaces.criticalFailure}" />`,
      2: `<img src="${hunterDiceLocation + desperationDiceFaces.failure}" />`,
      3: `<img src="${hunterDiceLocation + desperationDiceFaces.failure}" />`,
      4: `<img src="${hunterDiceLocation + desperationDiceFaces.failure}" />`,
      5: `<img src="${hunterDiceLocation + desperationDiceFaces.failure}" />`,
      6: `<img src="${hunterDiceLocation + desperationDiceFaces.success}" />`,
      7: `<img src="${hunterDiceLocation + desperationDiceFaces.success}" />`,
      8: `<img src="${hunterDiceLocation + desperationDiceFaces.success}" />`,
      9: `<img src="${hunterDiceLocation + desperationDiceFaces.success}" />`,
      10: `<img src="${hunterDiceLocation + desperationDiceFaces.critical}" />`
    }[result]
  }
}

/**
 * Extend the basic Die for the Werewolf (w) dice
 * @extends {Die}
 */
export class WerewolfDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 'w'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${werewolfDiceLocation + normalDiceFaces.failure}" />`,
      2: `<img src="${werewolfDiceLocation + normalDiceFaces.failure}" />`,
      3: `<img src="${werewolfDiceLocation + normalDiceFaces.failure}" />`,
      4: `<img src="${werewolfDiceLocation + normalDiceFaces.failure}" />`,
      5: `<img src="${werewolfDiceLocation + normalDiceFaces.failure}" />`,
      6: `<img src="${werewolfDiceLocation + normalDiceFaces.success}" />`,
      7: `<img src="${werewolfDiceLocation + normalDiceFaces.success}" />`,
      8: `<img src="${werewolfDiceLocation + normalDiceFaces.success}" />`,
      9: `<img src="${werewolfDiceLocation + normalDiceFaces.success}" />`,
      10: `<img src="${werewolfDiceLocation + normalDiceFaces.critical}" />`
    }[result]
  }
}

/**
 * Extend the basic Die for the Rage (r) dice
 * @extends {Die}
 */
export class WerewolfRageDie extends Die {
  constructor (termData) {
    termData.faces = 10
    super(termData)
  }

  /** @override */
  static DENOMINATION = 'r'

  /** @override */
  static getResultLabel (result) {
    return {
      1: `<img src="${werewolfDiceLocation + rageDiceFaces.brutal}" />`,
      2: `<img src="${werewolfDiceLocation + rageDiceFaces.brutal}" />`,
      3: `<img src="${werewolfDiceLocation + rageDiceFaces.failure}" />`,
      4: `<img src="${werewolfDiceLocation + rageDiceFaces.failure}" />`,
      5: `<img src="${werewolfDiceLocation + rageDiceFaces.failure}" />`,
      6: `<img src="${werewolfDiceLocation + rageDiceFaces.success}" />`,
      7: `<img src="${werewolfDiceLocation + rageDiceFaces.success}" />`,
      8: `<img src="${werewolfDiceLocation + rageDiceFaces.success}" />`,
      9: `<img src="${werewolfDiceLocation + rageDiceFaces.success}" />`,
      10: `<img src="${werewolfDiceLocation + rageDiceFaces.critical}" />`
    }[result]
  }
}
