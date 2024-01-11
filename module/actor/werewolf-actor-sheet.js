/* global game, mergeObject, renderTemplate, ChatMessage, Dialog */

import { WOD5eDice } from '../scripts/system-rolls.js'
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

    data.sheetType = `${game.i18n.localize('WOD5E.Werewolf')}`

    this._prepareItems(data)

    return data
  }

  /** Prepare important data for the werewolf actor */
  _prepareItems (sheetData) {
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
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Rollable gift buttons
    html.find('.gift-rollable').click(this._onGiftRoll.bind(this))

    // Frenzy buttons
    html.find('.begin-frenzy').click(this._onBeginFrenzy.bind(this))
    html.find('.end-frenzy').click(this._onEndFrenzy.bind(this))

    // Form change buttons
    html.find('.change-form').click(this._onShiftForm.bind(this))

    // Form to chat buttons
    html.find('.were-form-chat').click(this._onFormToChat.bind(this))

    // Form edit buttons
    html.find('.were-form-edit').click(this._onFormEdit.bind(this))

    // Create a new Gift
    html.find('.gift-create').click(this._onCreateGift.bind(this))

    // Create a new Rite
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
      dice2 = renownValue
    } else if (item.system.skill) {
      dice2 = this.actor.system.skills[item.system.dice2].value
    } else {
      dice2 = this.actor.system.abilities[item.system.dice2].value
    }

    const dicePool = dice1 + dice2

    WOD5eDice.Roll({
      basicDice: Math.max(dicePool - rageDice, 0),
      advancedDice: Math.min(dicePool, rageDice),
      title: item.name,
      actor: this.actor,
      data: item.system
    })
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
        name: game.i18n.localize('WOD5E.NewGift'),
        type: 'gift',
        img: '/systems/vtm5e/assets/icons/powers/gift.png',
        system: {
          giftType: header.dataset.gift
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
                <label>${game.i18n.localize('WOD5E.SelectGift')}</label>
                <select id="giftSelect">${options}</select>
            </div>
        </form>`

      let buttons = {}
      buttons = {
        draw: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('WOD5E.Add'),
          callback: async (html) => {
            const gift = html.find('#giftSelect')[0].value

            // Prepare the item object.
            const itemData = {
              name: game.i18n.localize('WOD5E.NewGift'),
              type: 'gift',
              img: '/systems/vtm5e/assets/icons/powers/gift.png',
              system: {
                giftType: gift
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
          label: game.i18n.localize('WOD5E.Cancel')
        }
      }

      new Dialog({
        title: game.i18n.localize('WOD5E.AddGift'),
        content: template,
        buttons,
        default: 'draw'
      },
      {
        classes: ['wod5e', `werewolf-dialog`, `werewolf-sheet`]
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
      name: game.i18n.localize('WOD5E.NewRite'),
      type: 'gift',
      img: '/systems/vtm5e/assets/icons/powers/gift.png',
      system: {
        giftType: 'rite'
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

    this.actor.update({ 'system.frenzyActive': true })

    this.actor.update({ 'system.rage.value': 5 })
  }

  // Handle when an actor ends their frenzy
  _onEndFrenzy (event) {
    event.preventDefault()

    this.actor.update({ 'system.frenzyActive': false })
  }

  // Switch function to direct data to form change functions
  _onShiftForm(event) {
    event.preventDefault()

    const element = event.currentTarget
    const dataset = element.dataset
    const newForm = dataset.newForm
  
    switch (newForm) {
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
        this.actor.update({ 'system.activeForm': 'lupus' })
        this._onFormToChat(event)
        break
      default:
        this.actor.update({ 'system.activeForm': 'homid' })
        this._onFormToChat(event)
    }
  }
  
  // Function to handle rolling the dice and updating the actor
  handleFormChange(form, diceCount) {
    // If automatedRage is turned on and the actor's rage is 0, present a warning
    if (game.settings.get('vtm5e', 'automatedRage') && this.actor.system.rage.value === 0) {
      this._onInsufficientRage(form)
    } else {
      // Variables
      const formData = this.actor.system.forms[form]
      const flavor = formData.description

      // Roll the rage dice necessary
      WOD5eDice.Roll({
        advancedDice: diceCount,
        title: form,
        actor: this.actor,
        data: this.actor.system,
        flavor,
        quickRoll: true,
        disableBasicDice: true,
        decreaseRage: true,
        callback: (rollData) => {
          // Calculate the number of rage dice the actor has left
          const failures = rollData.terms[2].results.filter(result => !result.success).length
          const newRageAmount = Math.max(this.actor.system.rage.value - failures, 0)
          
          // If rolling rage dice didn't reduce the actor to 0 rage, then update the current form
          if (newRageAmount > 0) {
            this.actor.update({ 'system.activeForm': form })
          }
        }
      })
    }
  }

  // Handle posting an actor's form to the chat.
  _onFormToChat (event) {
    event.preventDefault()

    const header = event.currentTarget
    const form = header.dataset.newForm

    const formData = this.actor.system.forms[form]
    const formName = formData.name
    const formDescription = formData.description ? `<p>${formData.description}</p>` : ''
    const formAbilities = formData.abilities

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
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: chatMessage
    })

    // Remove focus once the chat message is posted
    event.currentTarget.blur()
  }

  // Handle editing an actor's form.
  _onFormEdit (event) {
    event.preventDefault()

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
      submit: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('WOD5E.Submit'),
        callback: async (html) => {
          const newDescription = html.find('#formDescription')[0].value

          this.actor.update({ [`system.forms.${form}.description`]: newDescription })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('WOD5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('WOD5E.Edit') + ' ' + game.i18n.localize(formName),
      content: template,
      buttons,
      default: 'submit'
    },
    {
      classes: ['wod5e', `werewolf-dialog`, `werewolf-sheet`]
    }).render(true)
  }

  _onInsufficientRage (form) {
    const template = `
    <form>
        <div class="form-group">
            <label>This actor has Lost the Wolf and cannot transform into supernatural forms due to insufficient rage. Would you like to shift anyway?</label>
        </div>
    </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Shift Anyway',
        callback: async () => {
          this.actor.update({ 'system.activeForm': form })
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
      default: 'draw'
    },
    {
      classes: ['wod5e', `werewolf-dialog`, `werewolf-sheet`]
    }).render(true)
  }
}
