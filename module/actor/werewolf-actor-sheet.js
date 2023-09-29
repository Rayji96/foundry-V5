/* global game, mergeObject */

import { MortalActorSheet } from './mortal-actor-sheet.js'
import { rollDice } from './roll-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {MortalActorSheet}
 */

export class WerewolfActorSheet extends MortalActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'werewolf-sheet', 'actor', 'sheet', 'werewolf']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/werewolf-sheet.html',
      width: 940,
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
    this.rage = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/werewolf-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    data.sheetType = `${game.i18n.localize('VTM5E.Werewolf')}`

    // Prepare items.
    if (this.actor.type === 'werewolf' ||
      this.actor.type === 'character'
    ) {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * set Blood Potency for Vampire sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)

    const actorData = sheetData.actor
    actorData.system.gamesystem = 'werewolf'

    console.log(actorData.system.gifts)

    if (actorData.system.activeForm === "homid") {
      //actorData.system.health.max = actorData.system.health.max + actorData.system.ciranosHealth.max
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Make Gift visible
    html.find('.gift-create').click(this._onShowGift.bind(this))

    // Make Gift hidden
    html.find('.gift-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`system.gifts.${data.gift}.visible`]: false })
    })

    // Post Edge description to the chat
    html.find('.gift-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const gift = this.actor.system.gifts[data.gift]

      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
        name: game.i18n.localize(gift.name),
        img: 'icons/svg/dice-target.svg',
        description: gift.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this))
  }

  /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
  _onRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const subtractWillpower = dataset.subtractWillpower
    const numDice = dataset.roll

    //rollRageDice(numDice, this.actor, `${dataset.label}`, 0, subtractWillpower)
  }

  /**
     * Handle making a gift visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowGift (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.system.gifts)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectGift')}</label>
              <select id="giftSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const gift = html.find('#giftSelect')[0].value
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddGift'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }
}