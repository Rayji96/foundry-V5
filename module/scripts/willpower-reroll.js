/* global game, Dialog */

// Import modules
import { WOD5eDice } from './system-rolls.js'

/**
 * Initalise willpower rerolls and its functions
**/

export const willpowerReroll = async (roll) => {
  // Variables
  const dice = roll.find('.rerollable')
  const diceRolls = []
  const message = game.messages.get(roll.attr('data-message-id'))
  const actor = game.actors.get(message.speaker.actor)
  const system = actor.system.gamesystem

  // Go through the message's dice and add them to the diceRolls array
  Object.keys(dice).forEach(function (i) {
    // This for some reason returns "prevObject" and "length"
    // Fixes will be attempted, but for now solved by just ensuring the index is a number
    if (i > -1) {
      diceRolls.push(`<div class="die">${dice[i].outerHTML}</div>`)
    }
  })

  // Create dialog for rerolling dice
  // HTML of the dialog
  const template = `
    <form>
        <div class="window-content">
            <label><b>Select dice to reroll (Max 3)</b></label>
            <hr>
            <span class="dice-tooltip">
              <div class="dice-rolls flexrow willpower-reroll">
                ${diceRolls.join('')}
              </div>
            </span>
        </div>
    </form>`

  // Button defining
  let buttons = {}
  buttons = {
    submit: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Reroll',
      callback: () => rerollDie(roll)
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel'
    }
  }

  // Dialog object
  new Dialog({
    title: game.i18n.localize('WOD5E.Chat.WillpowerReroll'),
    content: template,
    buttons,
    render: function () {
      $('.willpower-reroll .die').on('click', dieSelect)
    },
    default: 'submit'
  },
  {
    classes: ['wod5e', `${system}-dialog`, `${system}-sheet`]
  }).render(true)

  // Handles selecting and de-selecting the die
  function dieSelect () {
    // If the die isn't already selected and there aren't 3 already selected, add selected to the die
    if (!($(this).hasClass('selected')) && ($('.willpower-reroll .selected').length < 3)) {
      $(this).addClass('selected')
    } else {
      $(this).removeClass('selected')
    }
  }

  // Handles rerolling the number of dice selected
  // TODO: Make this function duplicate/replace the previous roll with the new results
  // For now this works well enough as "roll three new dice"
  async function rerollDie (roll) {
    // Variables
    const diceSelected = $('.willpower-reroll .selected').length
    const rageDiceSelected = $('.willpower-reroll .selected .rage-dice').length
    const selectors = ['willpower', 'willpower-reroll']

    // Get the actor associated with the message
    // Theoretically I should error-check this, but there shouldn't be any
    // messages that call for a WillpowerReroll without an associated actor
    const message = game.messages.get(roll.attr('data-message-id'))
    const actor = game.actors.get(message.speaker.actor)

    // If there is at least 1 die selected and aren't any more than 3 die selected, reroll the total number of die and generate a new message.
    if ((diceSelected > 0) && (diceSelected < 4)) {
      WOD5eDice.Roll({
        basicDice: diceSelected - rageDiceSelected,
        advancedDice: rageDiceSelected,
        title: game.i18n.localize('WOD5E.Chat.WillpowerReroll'),
        actor,
        damageWillpower: true,
        quickRoll: true,
        selectors
      })
    }
  }
}
