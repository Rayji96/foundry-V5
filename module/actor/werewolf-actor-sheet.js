/* global game, foundry, renderTemplate, ChatMessage, Dialog */

import { WOD5eDice } from '../scripts/system-rolls.js'
import { getActiveBonuses } from '../scripts/rolls/situational-modifiers.js'
import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {Wov5DActorSheet}
 */

export class WerewolfActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'werewolf-sheet', 'actor', 'sheet', 'werewolf']

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/werewolf-sheet.hbs',
      width: 1050,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'stats'
      }]
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/werewolf-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    this._prepareItems(data)

    return data
  }

  /** Prepare important data for the werewolf actor */
  async _prepareItems (sheetData) {
    super._prepareItems(sheetData)

    const actorData = sheetData.actor

    const giftsList = structuredClone(actorData.system.gifts)
    let ritesList = structuredClone(actorData.system.rites)

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      if (i.type === 'gift') {
        if (i.system.giftType === 'rite') {
          // Append to the rites list.
          ritesList.push(i)
        } else {
          // Append to each of the gift types.
          if (i.system.giftType !== undefined) {
            giftsList[i.system.giftType].powers.push(i)
          }
        }
      }
    }

    // Sort the gift containers by the level of the power instead of by creation date
    for (const giftType in giftsList) {
      giftsList[giftType].powers = giftsList[giftType].powers.sort(function (power1, power2) {
        // If the levels are the same, sort alphabetically instead
        if (power1.system.level === power2.system.level) {
          return power1.name.localeCompare(power2.name)
        }

        // Sort by level
        return power1.system.level - power2.system.level
      })
    }

    // Sort the rite containers by the level of the power instead of by creation date
    ritesList = ritesList.sort(function (power1, power2) {
      // If the levels are the same, sort alphabetically instead
      if (power1.system.level === power2.system.level) {
        return power1.name.localeCompare(power2.name)
      }

      // Sort by level
      return power1.system.level - power2.system.level
    })

    actorData.system.giftsList = giftsList
    actorData.system.ritesList = ritesList

    // If the actor's rage is above 0, make sure they aren't in "lost the wolf" form
    if (actorData.system.rage.value > 0 && actorData.system.lostTheWolf) {
      this.actor.update({ 'system.lostTheWolf': false })
    }

    // Check if the actor's rage is 0, they're in a supernatural form, and they haven't already lost the wolf
    const supernaturalForms = ['glabro', 'crinos', 'hispo']
    if ((actorData.system.rage.value === 0) && (supernaturalForms.indexOf(actorData.system.activeForm) > -1)) {
      this._onLostTheWolf()
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Top-level variables
    const actor = this.actor

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Rollable gift buttons
    html.find('.gift-rollable').click(this._onGiftRoll.bind(this))

    // Frenzy buttons
    html.find('.begin-frenzy').click(this._onBeginFrenzy.bind(this))
    html.find('.end-frenzy').click(this._onEndFrenzy.bind(this))

    // Form change buttons
    html.find('.change-form').click(this._onShiftForm.bind(this))

    // Harano buttons
    html.find('.harano-roll').click(this._onHaranoRoll.bind(this))
    // Hauglosk buttons
    html.find('.hauglosk-roll').click(this._onHaugloskRoll.bind(this))

    // Form to chat buttons
    html.find('.were-form-chat').click(this._onFormToChat.bind(this))

    // Form edit buttons
    html.find('.were-form-edit').click(this._onFormEdit.bind(this))

    // Post Gift description to the chat
    html.find('.gift-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const gift = actor.system.gifts[data.gift]

      renderTemplate('systems/vtm5e/templates/chat/chat-message.hbs', {
        name: game.i18n.localize(gift.name),
        img: 'icons/svg/dice-target.svg',
        description: gift.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })
  }

  /**
     * Handle rolling gifts
     * @param {Event} event   The originating click event
     * @private
     */
  async _onGiftRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const element = event.currentTarget
    const dataset = Object.assign({}, element.dataset)
    const item = actor.items.get(dataset.id)

    // Secondary variables
    const rageDice = Math.max(actor.system.rage.value, 0)
    const itemRenown = item.system.renown
    const renownValue = actor.system.renown[itemRenown].value
    const macro = item.system.macroid

    // Variables yet to be defined
    const selectors = ['gift']

    // Handle dice1 as either renown or an ability
    const dice1 = item.system.dice1 === 'renown' ? renownValue : actor.system.abilities[item.system.dice1].value

    // Add ability to selector if dice1 is not renown
    if (item.system.dice1 !== 'renown') {
      selectors.push(...['abilities', `abilities.${item.system.dice1}`])
    }

    // Add Renown to the list of selectors if dice1 or dice2 is renown
    if (item.system.dice1 === 'renown' || item.system.dice2 === 'renown') {
      selectors.push(...['renown', `renown.${itemRenown}`])
    }

    // Handle figuring out what dice2 is and push their selectors
    let dice2
    if (item.system.dice2 === 'renown') {
      dice2 = renownValue
    } else if (item.system.skill) {
      dice2 = actor.system.skills[item.system.dice2].value
      selectors.push(...['skills', `skills.${item.system.dice2}`])
    } else {
      dice2 = actor.system.abilities[item.system.dice2].value
      selectors.push(...['abilities', `abilities.${item.system.dice2}`])
    }

    // Handle getting any situational modifiers
    const activeBonuses = await getActiveBonuses({
      actor,
      selectors
    })

    // Add all values together
    const dicePool = dice1 + dice2 + activeBonuses.totalValue

    // Send the roll to the system
    WOD5eDice.Roll({
      basicDice: Math.max(dicePool - rageDice, 0),
      advancedDice: Math.min(dicePool, rageDice),
      title: item.name,
      actor,
      data: item.system,
      selectors,
      macro
    })
  }

  // Handle when an actor goes into a frenzy
  _onBeginFrenzy (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Enable frenzy
    actor.update({ 'system.frenzyActive': true })

    // Set rage to 5
    actor.update({ 'system.rage.value': 5 })
  }

  // Handle when an actor ends their frenzy
  _onEndFrenzy (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Disable frenzy
    actor.update({ 'system.frenzyActive': false })

    // Set rage to 0
    actor.update({ 'system.rage.value': 0 })
  }

  // Handle when the actor has Lost the Wolf
  _onLostTheWolf () {
    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    let buttons = {}

    // If automatedRage is disabled, we don't wat to show this dialogue
    if (!game.settings.get('vtm5e', 'automatedRage')) return

    // If the actor has already lost the wolf, we don't need to show this prompt again
    if (actor.system.lostTheWolf) return

    // Update the listTheWolf key
    actor.update({ 'system.lostTheWolf': true })

    // Define the template to be used
    const template = `
    <form>
        <div class="form-group">
            <label>${game.i18n.localize('WOD5E.WTA.LostWolfShiftDown')}</label>
        </div>
    </form>`

    // Define the buttons and push them to the buttons variable
    buttons = {
      homid: {
        label: 'Homid',
        callback: async () => {
          actor.update({ 'system.activeForm': 'homid' })
        }
      },
      lupus: {
        label: 'Lupus',
        callback: async () => {
          actor.update({ 'system.activeForm': 'lupus' })
        }
      }
    }

    new Dialog({
      title: 'Lost the Wolf',
      content: template,
      buttons,
      default: 'homid'
    },
    {
      classes: ['wod5e', 'werewolf-dialog', 'werewolf-sheet']
    }).render(true)
  }

  // Switch function to direct data to form change functions
  _onShiftForm (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const element = event.currentTarget
    const dataset = Object.assign({}, element.dataset)
    const form = dataset.form

    switch (form) {
      case 'glabro':
        this.handleFormChange('glabro', 1)
        break
      case 'crinos':
        this.handleFormChange('crinos', 2)
        break
      case 'hispo':
        this.handleFormChange('hispo', 1)
        break
      case 'lupus':
        actor.update({ 'system.activeForm': 'lupus' })
        this._onFormToChat(event)
        break
      default:
        actor.update({ 'system.activeForm': 'homid' })
        this._onFormToChat(event)
    }
  }

  // Function to handle rolling the dice and updating the actor
  async handleFormChange (form, diceCount) {
    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    const selectors = []

    // If automatedRage is turned on and the actor's rage is 0, present a warning
    if (game.settings.get('vtm5e', 'automatedRage') && actor.system.rage.value === 0) {
      this._onInsufficientRage(form)
    } else {
      // Variables
      const formData = actor.system.forms[form]
      const flavor = formData.description

      // Handle getting any situational modifiers
      const activeBonuses = await getActiveBonuses({
        actor,
        selectors
      })

      // Roll the rage dice necessary
      WOD5eDice.Roll({
        advancedDice: diceCount + activeBonuses.totalValue,
        title: form,
        actor,
        data: actor.system,
        flavor,
        quickRoll: true,
        disableBasicDice: true,
        decreaseRage: true,
        selectors,
        callback: (rollData) => {
          // Calculate the number of rage dice the actor has left
          const failures = rollData.terms[2].results.filter(result => !result.success).length
          const newRageAmount = Math.max(actor.system.rage.value - failures, 0)

          // If rolling rage dice didn't reduce the actor to 0 rage, then update the current form
          if (newRageAmount > 0) {
            actor.update({ 'system.activeForm': form })
          }
        }
      })
    }
  }

  // Handle rolling the Harano dice
  async _onHaranoRoll (event) {
    event.preventDefault()

    const actor = this.actor
    const harano = actor.system.balance.harano.value
    const hauglosk = actor.system.balance.hauglosk.value

    const dicePool = Math.max((harano + hauglosk), 1)

    WOD5eDice.Roll({
      basicDice: dicePool,
      title: game.i18n.localize('WOD5E.WTA.HaranoTest'),
      actor,
      data: actor.system,
      quickRoll: false,
      disableAdvancedDice: true
    })
  }

  // Handle rolling the Harano dice
  async _onHaugloskRoll (event) {
    event.preventDefault()

    const actor = this.actor
    const harano = actor.system.balance.harano.value
    const hauglosk = actor.system.balance.hauglosk.value

    const dicePool = Math.max((harano + hauglosk), 1)

    WOD5eDice.Roll({
      basicDice: dicePool,
      title: game.i18n.localize('WOD5E.WTA.HaugloskTest'),
      actor,
      data: actor.system,
      quickRoll: false,
      disableAdvancedDice: true
    })
  }

  // Handle posting an actor's form to the chat.
  _onFormToChat (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const header = event.currentTarget
    const form = header.dataset.form

    // Secondary variables
    const formData = actor.system.forms[form]
    const formName = formData.name
    const formDescription = formData.description ? `<p>${formData.description}</p>` : ''
    const formAbilities = formData.abilities

    // Define the chat message
    let chatMessage = `<p class="roll-label uppercase">${game.i18n.localize(formName)}</p>${formDescription}`
    if (formAbilities.length > 0) {
      chatMessage = chatMessage + '<ul>'
      formAbilities.forEach((ability) => {
        chatMessage = chatMessage + `<li>${ability}</li>`
      })
      chatMessage = chatMessage + '</ul>'
    }

    // Post the message to the chat
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: chatMessage
    })

    // Remove focus once the chat message is posted
    event.currentTarget.blur()
  }

  // Handle editing an actor's form.
  _onFormEdit (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const header = event.currentTarget
    const form = header.dataset.form

    // Secondary variables
    const formData = actor.system.forms[form]
    const formName = formData.name
    const formDescription = formData.description

    // Variables yet to be defined
    let buttons = {}

    // Define the template to be used
    const template = `
      <form>
          <div class="flexrow">
            <textarea id="formDescription">${formDescription}</textarea>
          </div>
      </form>`

    // Define the buttons to be used and push them to the buttons variable
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Submit'),
        callback: async (html) => {
          const newDescription = html.find('#formDescription')[0].value

          actor.update({ [`system.forms.${form}.description`]: newDescription })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    // Display the dialog
    new Dialog({
      title: game.i18n.localize('WOD5E.Edit') + ' ' + game.i18n.localize(formName),
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', 'werewolf-dialog', 'werewolf-sheet']
    }).render(true)
  }

  _onInsufficientRage (form) {
    // Top-level variables
    const actor = this.actor

    // Variables yet to be defined
    let buttons = {}

    // Define the template to be used
    const template = `
    <form>
        <div class="form-group">
            <label>${game.i18n.localize('WOD5E.WTA.LostWolfShiftAnyway')}</label>
        </div>
    </form>`

    // Define the buttons and push them to the buttons variable
    buttons = {
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Shift Anyway',
        callback: async () => {
          actor.update({ 'system.activeForm': form })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    new Dialog({
      title: 'Can\'t Transform: Lost the Wolf',
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', 'werewolf-dialog', 'werewolf-sheet']
    }).render(true)
  }
}
