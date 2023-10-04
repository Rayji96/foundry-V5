/* global game, mergeObject */

import { WoDv5Actor } from './wod-v5-sheet.js'
import { rollWerewolfDice } from './roll-werewolf-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {Wov5DActorSheet}
 */

export class WerewolfActorSheet extends WoDv5Actor {
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
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/werewolf-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    data.sheetType = `${game.i18n.localize('VTM5E.Werewolf')}`

    this._prepareItems(data)

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

    // Frenzy buttons
    html.find('.begin-frenzy').click(this._onBeginFrenzy.bind(this))
    html.find('.end-frenzy').click(this._onEndFrenzy.bind(this))

    // Rage buttons
    html.find('.rage-roll').click(this._onRageButton.bind(this))

    // Form change buttons
    html.find('.change-form').click(this._onShiftForm.bind(this))

    // Form to chat buttons
    html.find('.were-form-chat').click(this._onFormToChat.bind(this))

    // Form edit buttons
    html.find('.were-form-edit').click(this._onFormEdit.bind(this))

    // Rollable gift buttons
    html.find('.gift-rollable').click(this._onGiftRoll.bind(this))

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

  _onGiftRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    const rageDice = Math.max(this.actor.system.rage.value, 0)
    const itemRenown = item.system.renown
    const renownValue = this.actor.system.renown[itemRenown].value

    const dice1 = item.system.dice1 === 'renown' ? renownValue : this.actor.system.abilities[item.system.dice1].value

    let dice2
    if (item.system.dice2 === 'renown') {
      dice2 = disciplineValue
    } else if (item.system.skill) {
      dice2 = this.actor.system.skills[item.system.dice2].value
    } else {
      dice2 = this.actor.system.abilities[item.system.dice2].value
    }

    const dicePool = dice1 + dice2
    rollWerewolfDice(dicePool, this.actor, `${item.name}`, 0, rageDice)
  }

  _onRageButton (event) {
    event.preventDefault()

    const element = event.currentTarget
    const dataset = element.dataset
    const consumeRage = dataset.consumeRage
    const subtractWillpower = dataset.subtractWillpower
    const rageDice = dataset.rageDice

    rollWerewolfDice(rageDice, this.actor, dataset.label, 0, rageDice, subtractWillpower, consumeRage)
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

  // Handle posting an actor's form to the chat.
  _onFormToChat (event) {
    const header = event.currentTarget
    const form = header.dataset.form

    const formData = this.actor.system.forms[form]
    const formName = formData.name
    const formDescription = formData.description
    const formAbilities = formData.abilities

    let chatMessage = `<p class="roll-label uppercase">` + game.i18n.localize(formName) + `</p><p>` + formDescription + `</p>`
    chatMessage = chatMessage + `<ul>`
    formAbilities.forEach((ability) =>
      chatMessage = chatMessage + `<li>${ability}</li>`
    )
    chatMessage = chatMessage + `</ul>`

    // Post the message to the chat
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: chatMessage
    })
  }

  // Handle editing an actor's form.
  _onFormEdit (event) {
    const header = event.currentTarget
    const form = header.dataset.form

    const formData = this.actor.system.forms[form]
    const formName = formData.name
    const formDescription = formData.description

    const template = `
      <form>
          <div class="flexrow">
            <textarea id="formDescription">${formDescription}</textarea>
          </div>
      </form>`

      let buttons = {}
      buttons = {
        draw: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('VTM5E.Submit'),
          callback: async (html) => {
            const newDescription = html.find('#formDescription')[0].value

            this.actor.update({ [`system.forms.${form}.description`]: newDescription })
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('VTM5E.Cancel')
        }
      }

    new Dialog({
      title: game.i18n.localize('VTM5E.Edit') + ` ` + game.i18n.localize(formName),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  // Quick function for deducting rage dice
  _onDeductRageDice (rageCost) {
    const currentRageDice = this.actor.system.rage.value
    const newRageDice = currentRageDice - rageCost

    this.actor.update({ 'system.rage.value': newRageDice})
  }
}