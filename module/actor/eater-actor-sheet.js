/* global game, mergeObject */
import { getSynergyText, getSynergyValues } from './eater-synergy.js'
import { rollDice } from './roll-dice.js'
import { MortalActorSheet } from './mortal-actor-sheet.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {MortalActorSheet}
 */

export class EaterActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'eater']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/eater-sheet.html',
      width: 800,
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
    this.hunger = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/eater-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()

    data.sheetType = `${game.i18n.localize('VTM5E.SinEater')}`

    // Prepare items.
    if (this.actor.data.type === 'eater' ||
    this.actor.data.type === 'character'
    ) {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * set Synergy for Sin-Eater sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)

    const actorData = sheetData.actor
    actorData.synergyValue = parseInt(this.actor.data.data.synergy.value)
    sheetData.synergy_text = getSynergyText(actorData.synergyValue)
    actorData.synergy = getSynergyValues(actorData.synergyValue)

    const haunts = {
      boneyard: [],
      caul: [],
      curse: [],
      dirge: [],
      marionette: [],
      memoria: [],
      oracle: [],
      rage: [],
      shroud: [],
      tomb: [],
      void: [],
      well: []
    }

    const keys = {
      keyBeasts: [],
      keyBlood: [],
      keyChance: [],
      keyColdWind: [],
      keyDeepWaters: [],
      keyDisease: [],
      keyGraveDirt: [],
      keyPyreFlame: [],
      keyStillness: []
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      if (i.type === 'eaterPower') {
        // Append to haunts.
        if (i.data.haunt !== undefined) {
          haunts[i.data.haunt].push(i)
          if (!this.actor.data.data.haunts[i.data.haunt].visible) {
            this.actor.update({ [`data.haunts.${i.data.haunt}.visible`]: true })
          }
        }
      }
      if (i.type === 'keyInstance') {
        //Append to keys.
        if (i.data.key !== undefined) {
          keys[i.data.key].push(i)
          if (!this.actor.data.data.keys[i.data.key].visible) {
            this.actor.update({ [`data.keys.${i.data.key}.visible`]: true })
          }
        }
      }
    }

    // Assign and return
    actorData.haunt_list = haunts
    actorData.key_list = keys
  }

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Make haunt visible
    html.find('.haunt-create').click(this._onShowHaunt.bind(this))

    // Make haunt hidden
    html.find('.haunt-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`data.haunts.${data.haunt}.visible`]: false })
    })

    // Post haunt description to the chat
    html.find('.haunt-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const haunt = this.actor.data.data.haunts[data.haunt]

      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
        name: game.i18n.localize(haunt.name),
        img: 'icons/svg/dice-target.svg',
        description: haunt.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    // Roll a rouse check for an item
    html.find('.item-rouse').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'))
      const level = item.data.data.level
      const potency = this.actor.data.data.synergy.potency

      const dicepool = this.potencyToRouse(potency, level)

      rollDice(dicepool, this.actor, game.i18n.localize('VTM5E.RousingPlasma'), 1, false, true, false)
    })

    // Rollable Eater powers
    html.find('.power-rollable').click(this._onEaterRoll.bind(this))

    // Make key visible
    html.find('.key-create').click(this._onShowKey.bind(this))

    // Make key hidden
    html.find('.key-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`data.keys.${data.key}.visible`]: false })
    })

    // Post key description to the chat
    html.find('.key-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const key = this.actor.data.data.keys[data.key]

      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
        name: game.i18n.localize(key.name),
        img: 'icons/svg/dice-target.svg',
        description: key.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    html.find(".key-unlocked-controls").click(this._keyUnlockedControls.bind(this))
  }

  async _keyUnlockedControls(event) {
    const keyUnlock = $(event.currentTarget).parents(".key-unlock");
    const itemId = keyUnlock.data("id");

    const item = this.actor.getEmbeddedDocument("Item", itemId)
    console.log("eater-actor-sheet.js _keyUnlockedControls", itemId, keyUnlock, { event }, item);
    let unlocked = !item.data.data.unlocked

    await item.update({ 'data.unlocked': unlocked })
  }

  /**
   * Handle making a haunt visible
   * @param {Event} event   The originating click event
   * @private
   * @override
   */
  _onShowHaunt (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.data.data.haunts)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectHaunt')}</label>
              <select id="hauntSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const haunt = html.find('#hauntSelect')[0].value
          this.actor.update({ [`data.haunts.${haunt}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddHaunt'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  /**
  * Handle making a key visible
  * @param {Event} event   The originating click event
  * @private
  * @override
  */
  _onShowKey (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.data.data.keys)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectKey')}</label>
              <select id="keySelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const key = html.find('#keySelect')[0].value
          this.actor.update({ [`data.keys.${key}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddKey'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  /**
  * Handle clickable Vampire rolls.
  * @param {Event} event   The originating click event
  * @override
  */
  _onRollDialog (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    let options = ''

    for (const [key, value] of Object.entries(this.actor.data.data.abilities)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>  
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="0">
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Roll'),
        callback: async (html) => {
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const abilityVal = this.actor.data.data.synergy.value
          const numDice = abilityVal + parseInt(dataset.roll) + modifier
          rollDice(numDice, this.actor, `${dataset.label}`, difficulty, this.hunger)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.Rolling') + ` ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  /** @override */
  _onEaterRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    let hauntValue = this.actor.data.data.haunts[item.data.data.haunt].value

    const dice1 = hauntValue

    const dice2 = this.actor.synergy.power

    const dicePool = dice1 + dice2
    rollDice(dicePool, this.actor, `${item.data.name}`, 0, this.hunger)
  }

  potencyToRouse (potency, level) {
    // Define the number of dice to roll based on the user's blood potency
    // and the power's level
    // Potency 0 never rolls additional rouse dice for haunts
    if (potency === 0) {
      return (1)
    } else
    // Potency of 9 and 10 always roll additional rouse dice for haunts
    if (potency > 8) {
      return (2)
    } else
    // Potency 7 and 8 roll additional rouse dice on haunt powers below 5
    if (potency > 6 && level < 5) {
      return (2)
    } else
    // Potency 5 and 6 roll additional rouse dice on haunt powers below 4
    if (potency > 4 && level < 4) {
      return (2)
    } else
    // Potency 3 and 4 roll additional rouse dice on haunt powers below 3
    if (potency > 2 && level < 3) {
      return (2)
    } else
    // Potency 1 and 2 roll additional rouse dice on haunt powers below 2
    if (potency > 0 && level < 2) {
      return (2)
    }

    // If none of the above are true, just roll 1 dice for the rouse check
    return (1)
  }
}
