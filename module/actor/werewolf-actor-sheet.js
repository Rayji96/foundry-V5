/* global game, mergeObject */

import { MortalActorSheet } from './mortal-actor-sheet.js'

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

  /** Prepare important data for the werewolf actor */
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)

    const actorData = sheetData.actor
    actorData.system.gamesystem = 'werewolf'

    const gifts_list = structuredClone(actorData.system.gifts)
    const rites_list = structuredClone(actorData.system.rites)

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      if (i.type === 'gift') {
        if (i.system.giftType === "rite") {
          // Append to the rites list.
          rites_list.push(i)
        } else {
          // Append to each of the gift types.
          if (i.system.giftType !== undefined) {
            gifts_list[i.system.giftType].powers.push(i)
          }
        }
      }
    }

    actorData.system.gifts_list = gifts_list;
    actorData.system.rites_list = rites_list;

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

    // Rollable abilities.
    html.find('.rollable').click(this._onWerewolfRoll.bind(this))

    // Frenzy buttons
    html.find('.begin-frenzy').click(this._onBeginFrenzy.bind(this))
    html.find('.end-frenzy').click(this._onEndFrenzy.bind(this))

    // Form change buttons
    html.find('.change-form').click(this._onShiftForm.bind(this))

    // Make Gift visible
    html.find('.gift-create').click(this._onCreateGift.bind(this))

    // Make Gift visible
    html.find('.rite-create').click(this._onCreateRite.bind(this))

    // Make Gift hidden
    html.find('.gift-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`system.gifts.${data.gift}.powers`]: [] })
    })

    // Post Gift description to the chat
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
  }

  /**
     * Handle clickable rolls within the Werewolf system
     * @param {Event} event   The originating click event
     * @private
     */
  _onWerewolfRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const subtractWillpower = dataset.subtractWillpower
    const numDice = dataset.roll

    //rollRageDice(numDice, this.actor, `${dataset.label}`, 0, subtractWillpower)
  }

  /**
     * Handle making a new gift
     * @param {Event} event   The originating click event
     * @private
     */
  _onCreateGift (event) {
    event.preventDefault()

    const header = event.currentTarget

    // If the type of gift is already set, we don't need to ask for it
    if (header.dataset.gift) {
        // Prepare the item object.
        const itemData = {
          name: game.i18n.localize('VTM5E.NewGift'),
          type: "gift",
          system: {
            "giftType": header.dataset.gift
          }
        }
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system.type

        // Finally, create the item!
        return this.actor.createEmbeddedDocuments('Item', [itemData])
    } else {
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

            // Prepare the item object.
            const itemData = {
              name: game.i18n.localize('VTM5E.NewGift'),
              type: "gift",
              system: {
                "giftType": gift
              }
            }
            // Remove the type from the dataset since it's in the itemData.type prop.
            delete itemData.system.type

            // Finally, create the item!
            return this.actor.createEmbeddedDocuments('Item', [itemData])
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

  /**
     * Handle making a new rite
     * @param {Event} event   The originating click event
     * @private
     */
  _onCreateRite (event) {
    event.preventDefault()

    // Prepare the item object.
    const itemData = {
      name: game.i18n.localize('VTM5E.NewRite'),
      type: "gift",
      system: {
        "giftType": "rite"
      }
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system.type

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments('Item', [itemData])
  }

  // Handle when an actor goes into a frenzy
  _onBeginFrenzy (event) {
    event.preventDefault()
    this.actor.update({ 'system.frenzyActive': true})

    this.actor.update({ 'system.rage.value': 5 })
  }

  // Handle when an actor ends their frenzy
  _onEndFrenzy (event) {
    event.preventDefault()
    this.actor.update({ 'system.frenzyActive': false})
  }

  // Handle form changes
  _onShiftForm (event) {
    event.preventDefault()

    const header = event.currentTarget
    const newForm = header.dataset.newForm

    // Switch statement to make it easy to see which form does what.
    switch (newForm) {
      case "homid":
        console.log("Homid!")
        this.actor.update({ 'system.activeForm': "homid"})

        break;
      case "glabro":
        console.log("Glabro")
        this.actor.update({ 'system.activeForm': "glabro"})

        this._onDeductRageDice(1)
        break;
      case "crinos":
        console.log("Big scary werewoof")
        this.actor.update({ 'system.activeForm': "crinos"})

        this._onDeductRageDice(2)
        break;
      case "hispo":
        console.log("Hispo")
        this.actor.update({ 'system.activeForm': "hispo"})

        this._onDeductRageDice(1)
        break;
      case "lupus":
        console.log("Lupus")
        this.actor.update({ 'system.activeForm': "lupus"})

        break;
      default:
        console.log("No form selected. Resetting to human.")
        this.actor.update({ 'system.activeForm': "homid"})
    }
  }

  _onDeductRageDice (rageCost) {
    const currentRageDice = this.actor.system.rage.value
    const newRageDice = currentRageDice - rageCost

    this.actor.update({ 'system.rage.value': newRageDice})
  }
}