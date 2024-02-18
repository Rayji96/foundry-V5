/* global ChatMessage, game, ui */

import { WOD5eDice } from '../scripts/system-rolls.js'

export class wod5eAPI {
  /**
   * Class that handles all WOD5e rolls.
   *
   * @param basicDice                 (Optional, default 0) The number of 'basic' dice to roll, such as v, w, and h
   * @param advancedDice              (Optional, default 0) The number of 'advanced' dice to roll, such as g, r and s
   * @param actor                     (Optional, default to speaker actor) The actor that the roll is coming from
   * @param data                      (Optional, default actor.system) Actor or item data to pass along with the roll
   * @param title                     (Optional, default "Rolling") Title of the roll for the dialog/chat message
   * @param disableBasicDice          (Optional, default false) Whether to disable basic dice on this roll
   * @param disableAdvancedDice       (Optional, default false) Whether to disable advanced dice on this roll
   * @param damageWillpower           (Optional, default false) Whether to damage willpower after the roll is complete
   * @param increaseHunger            (Optional, default false) Whether to increase hunger on failures
   * @param decreaseRage              (Optional, default false) Whether to reduce rage on failures
   * @param difficulty                (Optional, default 0) The number that the roll must succeed to count as a success
   * @param flavor                    (Optional, default '') Text that appears in the description of the roll
   * @param callback                  (Optional) A callable function for determining the chat message flavor given parts and data
   * @param quickRoll                 (Optional, default false) Whether the roll was called to bypass the roll dialog or not
   * @param rollMode                  (Optional, default FVTT's current roll mode) Which roll mode the message should default as
   * @param rerollHunger              (Optional, default false) Whether to reroll failed hunger dice
   * @param selectors                 (Optional, default []) Any selectors to use when compiling situational modifiers,
   * @param macro                     (Optional, default '') A macro to run after the roll has been made
   *
   */
  static async Roll ({
    basicDice = 0,
    advancedDice = 0,
    actor = game.actors.get(ChatMessage.getSpeaker().actor),
    data = game.actors.get(ChatMessage.getSpeaker().actor)?.system || {},
    title = 'Rolling',
    disableBasicDice = false,
    disableAdvancedDice = false,
    damageWillpower = false,
    increaseHunger = false,
    decreaseRage = false,
    difficulty = 0,
    flavor = '',
    callback,
    quickRoll = false,
    rollMode = game.settings.get('core', 'rollMode'),
    rerollHunger = false,
    selectors = [],
    macro = ''
  }) {
    if (!actor || !data) {
      ui.notifications.error('Error: No actor defined.')

      return
    }

    // Send the roll to the system
    await WOD5eDice.Roll({
      basicDice,
      advancedDice,
      actor,
      data,
      title,
      disableBasicDice,
      disableAdvancedDice,
      damageWillpower,
      difficulty,
      flavor,
      callback,
      quickRoll,
      rollMode,
      rerollHunger,
      increaseHunger,
      decreaseRage,
      selectors,
      macro
    })
  }
}
