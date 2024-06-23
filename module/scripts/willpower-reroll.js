/* global game, Dialog, WOD5E */

// Import modules
import { WOD5eDice } from './system-rolls.js'
import { generateRollMessage } from './rolls/roll-message.js'

/**
 * Initalise willpower rerolls and its functions
**/

export const willpowerReroll = async (roll) => {
  // Variables
  const dice = roll.find('.rerollable')
  const diceRolls = []
  const message = game.messages.get(roll.attr('data-message-id'))
  const actor = game.actors.get(message.speaker.actor)

  // Define the actor's gamesystem, defaulting to 'mortal' if it's not in the systems list
  const system = actor.system.gamesystem in WOD5E.Systems.getList() ? actor.system.gamesystem : 'mortal'

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
    const diceSelected = $('.willpower-reroll .selected')
    const rageDiceSelected = $('.willpower-reroll .selected .rage-dice')
    const selectors = ['willpower', 'willpower-reroll']

    // Get the actor associated with the message
    // Theoretically I should error-check this, but there shouldn't be any
    // messages that call for a WillpowerReroll without an associated actor
    const message = game.messages.get(roll.attr('data-message-id'))
    const actor = game.actors.get(message.speaker.actor)

    // If there is at least 1 die selected and aren't any more than 3 die selected, reroll the total number of die and generate a new message.
    if ((diceSelected.length > 0) && (diceSelected.length < 4)) {
      WOD5eDice.Roll({
        basicDice: diceSelected.length - rageDiceSelected.length,
        advancedDice: rageDiceSelected.length,
        title: game.i18n.localize('WOD5E.Chat.WillpowerReroll'),
        actor,
        willpowerDamage: 1,
        quickRoll: true,
        selectors,
        disableMessageOutput: true,
        callback: async (reroll) => {
          const messageRolls = message.rolls

          diceSelected.each(function (index) {
            const dieHTML = diceSelected.eq(index)
            const imgElement = dieHTML.find('img')

            if (!imgElement.length) {
              console.error('Image element not found in dieHTML:', dieHTML)
              return // Skip this iteration if image element is not found
            }

            const dieIndex = imgElement.data('index')

            if (imgElement.hasClass('rage-dice')) {
              const die = messageRolls[0].terms[2].results.find(die => die.index === dieIndex)

              if (die) {
                die.discarded = true
                die.active = false
              } else {
                console.error('Die not found in rage diceset:', dieIndex)
              }
            } else {
              const die = messageRolls[0].terms[0].results.find(die => die.index === dieIndex)

              if (die) {
                die.discarded = true
                die.active = false
              } else {
                console.error('Die not found in base diceset:', dieIndex)
              }
            }
          })

          // Merge "results" arrays
          messageRolls[0].terms[0].results = messageRolls[0].terms[0].results.concat(reroll.terms[0].results)
          // Only merge the 2nd dicepool if one even exists
          if (messageRolls[0].terms[2]) messageRolls[0].terms[2].results = messageRolls[0].terms[2].results.concat(reroll.terms[2].results)

          // Update the "content" field
          const newContent = await generateRollMessage({
            difficulty: message.flags.difficulty,
            system: message.flags.system,
            roll: messageRolls[0],
            data: message.flags.data,
            title: message.flags.title,
            flavor: message.flags.flavor,
            activeModifiers: message.flags.activeModifiers
          })

          message.update({
            content: newContent,
            rolls: messageRolls
          })
        }
      })
    }
  }
}
