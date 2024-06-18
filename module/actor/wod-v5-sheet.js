/* global DEFAULT_TOKEN, ChatMessage, ActorSheet, game, renderTemplate, Dialog, TextEditor, WOD5E */

import { _onRoll } from './scripts/roll.js'
import { _onResourceChange, _setupDotCounters, _setupSquareCounters, _onDotCounterChange, _onDotCounterEmpty, _onSquareCounterChange } from './scripts/counters.js'
import { _onAddBonus, _onDeleteBonus, _onEditBonus } from './scripts/specialty-bonuses.js'
import { Attributes } from '../def/attributes.js'
import { Skills } from '../def/skills.js'
import { WOD5eDice } from '../scripts/system-rolls.js'

/**
 * Extend the base ActorSheet document and put all our base functionality here
 * @extends {ActorSheet}
 */
export class WoDActor extends ActorSheet {
  /** @override */
  async getData () {
    const data = await super.getData()
    const actorData = this.object.system
    const actorHeaders = actorData.headers
    data.isCharacter = this.isCharacter
    data.locked = actorData.locked

    if (this.object.type !== 'group') {
      this._onHealthChange()
      this._onWillpowerChange()
    }

    data.displayBanner = game.settings.get('vtm5e', 'actorBanner')

    // Enrich non-header editor fields
    if (actorData.biography) { data.enrichedBiography = await TextEditor.enrichHTML(actorData.biography) }
    if (actorData.appearance) { data.enrichedAppearance = await TextEditor.enrichHTML(actorData.appearance) }
    if (actorData.notes) { data.enrichedNotes = await TextEditor.enrichHTML(actorData.notes) }
    if (actorData.equipment) { data.enrichedEquipment = await TextEditor.enrichHTML(actorData.equipment) }

    // Enrich actor header editor fields
    if (actorHeaders) {
      if (actorHeaders.tenets) { data.enrichedTenets = await TextEditor.enrichHTML(actorHeaders.tenets) }
      if (actorHeaders.touchstones) { data.enrichedTouchstones = await TextEditor.enrichHTML(actorHeaders.touchstones) }

      // Vampire stuff
      if (actorHeaders.bane) { data.enrichedBane = await TextEditor.enrichHTML(actorHeaders.bane) }

      // Ghoul stuff
      if (actorHeaders.creedfields) { data.enrichedCreedFields = await TextEditor.enrichHTML(actorHeaders.creedfields) }
    }

    // Enrich item descriptions
    for (const i of data.items) {
      i.system.enrichedDescription = await TextEditor.enrichHTML(i.system.description)
    }

    return data
  }

  /**
     * Organize and classify Items for all sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  async _prepareItems (sheetData) {
    const actorData = sheetData.actor

    const attributes = {
      physical: [],
      social: [],
      mental: []
    }
    const skills = {
      physical: [],
      social: [],
      mental: []
    }
    const features = {
      background: [],
      merit: [],
      flaw: []
    }

    // Initialize containers.
    const boons = []
    const customRolls = []
    const gear = []

    // Loop through each entry in the attributes list, get the data (if available), and then push to the containers
    const attributesList = Attributes.getList({})
    const actorAttributes = actorData.system?.abilities

    if (actorAttributes) {
      // Clean up non-existent attributes, such as custom ones that no longer exist
      const validAttributes = new Set(Object.keys(attributesList))
      for (const id of Object.keys(actorAttributes)) {
        if (!validAttributes.has(id)) {
          delete actorAttributes[id]
        }
      }

      for (const [id, value] of Object.entries(attributesList)) {
        let attributeData = {}

        // If the actor has an attribute with the key, grab its current values
        if (Object.prototype.hasOwnProperty.call(actorAttributes, id)) {
          attributeData = Object.assign({
            id,
            value: actorAttributes[id].value
          }, value)
        } else { // Otherwise, add it to the actor and set it as some default data
          await this.actor.update({ [`system.abilities.${id}`]: { value: 1 } })

          attributeData = Object.assign({
            id,
            value: 1
          }, value)
        }

        // Push to the container in the appropriate type
        // as long as the attribute isn't "hidden"
        if (!attributeData.hidden) {
          if (!attributes[value.type]) attributes[value.type] = [] // Ensure the type exists
          attributes[value.type].push(attributeData)
        }
      }
    }

    // Loop through each entry in the skills list, get the data (if available), and then push to the containers
    const skillsList = Skills.getList({})
    const actorSkills = actorData.system?.skills

    if (actorSkills) {
      // Clean up non-existent skills, such as custom ones that no longer exist
      const validSkills = new Set(Object.keys(skillsList))
      for (const id of Object.keys(actorSkills)) {
        if (!validSkills.has(id)) {
          delete actorSkills[id]
        }
      }

      for (const [id, value] of Object.entries(skillsList)) {
        let skillData = {}
        let hasSpecialties = false
        const specialtiesList = []

        if (actorSkills[id]?.bonuses?.length > 0) {
          hasSpecialties = true

          for (const bonus of actorSkills[id].bonuses) {
            specialtiesList.push(bonus.source)
          }
        }

        // If the actor has a skill with the key, grab its current values
        if (Object.prototype.hasOwnProperty.call(actorSkills, id)) {
          skillData = Object.assign({
            id,
            value: actorSkills[id].value,
            hasSpecialties,
            specialtiesList,
            macroid: actorSkills[id].macroid
          }, value)
        } else { // Otherwise, add it to the actor and set it as some default data
          await this.actor.update({ [`system.skills.${id}`]: { value: 0 } })

          skillData = Object.assign({
            id,
            value: 0,
            hasSpecialties,
            specialtiesList
          }, value)
        }

        // Push to the container in the appropriate type
        // as long as the skill isn't "hidden"
        if (!skillData.hidden) {
          if (!skills[value.type]) skills[value.type] = [] // Ensure the type exists
          skills[value.type].push(skillData)
        }
      }
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN

      // Sort the item into its appropriate place
      if (i.type === 'item') {
        // Append to gear.
        gear.push(i)
      } else if (i.type === 'feature') {
        // Append to features.
        features[i.system.featuretype].push(i)
      } else if (i.type === 'boon') {
        // Append to boons.
        boons.push(i)
      } else if (i.type === 'customRoll') {
        // Append to custom rolls.
        customRolls.push(i)
      }
    }

    // Assign and return
    actorData.system.attributes_list = attributes
    actorData.system.skills_list = skills
    actorData.system.boons = boons
    actorData.system.customRolls = customRolls
    actorData.system.gear = gear
    actorData.system.features = features
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Top-level variables
    const actor = this.actor

    // Resource squares (Health, Willpower)
    html.find('.resource-counter.editable > .resource-counter-step').click(_onSquareCounterChange.bind(this))
    html.find('.resource-plus').click(_onResourceChange.bind(this))
    html.find('.resource-minus').click(_onResourceChange.bind(this))

    // Activate the setup for the counters
    _setupDotCounters(html)
    _setupSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Rollable abilities
    html.find('.rollable').click(_onRoll.bind(this))

    // Lock button
    html.find('.lock-btn').click(this._onToggleLocked.bind(this))

    // Resource dots
    html.find('.resource-value > .resource-value-step').click(_onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(_onDotCounterEmpty.bind(this))

    // Add Inventory Item
    html.find('.item-create').click(this._onCreateItem.bind(this))

    // Edit a skill
    html.find('.edit-skill').click(this._onSkillEdit.bind(this))

    // Send Inventory Item to Chat
    html.find('.item-chat').click(async event => {
      const li = $(event.currentTarget).parents('.item')
      const item = actor.getEmbeddedDocument('Item', li.data('itemId'))
      renderTemplate('systems/vtm5e/templates/chat/chat-message.hbs', {
        name: item.name,
        img: item.img,
        description: item.system.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    // Update Inventory Item
    html.find('.item-edit').click(async event => {
      const li = $(event.currentTarget).parents('.item')
      const item = actor.getEmbeddedDocument('Item', li.data('itemId'))
      item.sheet.render(true)
    })

    // Delete Inventory Item
    html.find('.item-delete').click(async event => {
      const li = $(event.currentTarget).parents('.item')
      actor.deleteEmbeddedDocuments('Item', [li.data('itemId')])
      li.slideUp(200, () => this.render(false))
    })

    // Collapsible items and other elements
    $('.collapsible').on('click', function () {
      $(this).toggleClass('active')

      const content = $(this).closest('.collapsible-container').find('.collapsible-content')

      if (content.css('maxHeight') === '0px') {
        content.css('maxHeight', content.prop('scrollHeight') + 'px')
      } else {
        content.css('maxHeight', '0px')
      }
    })

    /* -------------------------------------------- */
    /*  Rollable Abilities                          */
    /* -------------------------------------------- */
    // Willpower
    html.find('.willpower-roll').click(this._onWillpowerRoll.bind(this))
  }
  /* -------------------------------------------- */
  /* TOOLS                                        */
  /* -------------------------------------------- */

  getWillpowerDicePool (actor) {
    const willpowerMax = actor.system.willpower.max
    const willpowerAgg = actor.system.willpower.aggravated
    const willpowerSup = actor.system.willpower.superficial

    return Math.max((willpowerMax - willpowerAgg - willpowerSup), 0)
  }

  /* -------------------------------------------- */
  /* ACTIONS                                      */
  /* -------------------------------------------- */

  /**
   * Handle locking and unlocking the actor sheet
   * @param {Event} event   The originating click event
   */
  async _onToggleLocked (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Update the locked state
    await actor.update({ 'system.locked': !actor.system.locked })
  }

  /**
   * Handle bringing up the skill edit dialog window
   * @param {Event} event   The originating click event
   * @protected
   */
  async _onSkillEdit (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const header = event.currentTarget
    const skill = header.dataset.skill

    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
    const system = actor.system.gamesystem in WOD5E.Systems.getList() ? actor.system.gamesystem : 'mortal'

    // Render selecting a skill/attribute to roll
    const skillTemplate = 'systems/vtm5e/templates/actor/parts/skill-dialog.hbs'
    // Render the template
    const content = await renderTemplate(skillTemplate, {
      id: skill,
      actor,
      system,
      skill: actor.system.skills[skill]
    })

    // Render the dialog window to select which skill/attribute combo to use
    const SkillEditDialog = new Dialog(
      {
        title: WOD5E.Skills.getList({})[skill].displayName,
        content,
        buttons: { },
        close: (html) => {
          // Top-level variables
          const newDescription = html.find('#description')[0].value
          const newMacro = html.find('#macroid')[0].value

          // Update the description of the skill
          actor.update({ [`system.skills.${skill}.description`]: newDescription })
          // Update the macro ID
          actor.update({ [`system.skills.${skill}.macroid`]: newMacro })

          // Remove the dialog from the actor's apps on close.
          delete actor.apps[SkillEditDialog.appId]
        },
        render: (html) => {
          // Define the skill data to send along with any functions
          const skillData = {
            id: skill,
            actor,
            system,
            skill: actor.system.skills[skill]
          }

          // Prompt the dialog to add a new bonus
          html.find('.add-bonus').click(async event => {
            _onAddBonus(event, actor, skillData, SkillEditDialog)
          })

          // Delete a bonus
          html.find('.delete-bonus').click(async event => {
            _onDeleteBonus(event, actor, skillData, SkillEditDialog)
          })

          // Prompt the dialog to edit a bonus
          html.find('.edit-bonus').click(async event => {
            _onEditBonus(event, actor, skillData, SkillEditDialog)
          })
        }
      },
      {
        classes: ['wod5e', `${system}-dialog`, `${system}-sheet`],
        tabs: [
          {
            navSelector: '.sheet-tabs',
            contentSelector: '.sheet-body',
            initial: 'description'
          }
        ],
        resizeable: true
      }
    ).render(true)

    // Add the dialog to the list of apps on the actor
    // This re-renders the dialog every actor update
    actor.apps[SkillEditDialog.appId] = SkillEditDialog
  }

  // Handle changes to health
  _onHealthChange () {
    // Top-level variables
    const actor = this.actor

    // Define the healthData
    const healthData = actor.system.health

    // Derive the character's "health value" by taking
    // the sum of the current aggravated and superficial
    // damage taken and subtracting the max by that;
    // superficial damage is reduced by half to represent
    // its lesser effect
    const derivedHealth = healthData.max - (healthData.aggravated + (healthData.superficial / 2))

    // Update the actor's health.value
    actor.update({ 'system.health.value': derivedHealth })
  }

  // Handle changes to willpower
  _onWillpowerChange () {
    // Top-level variables
    const actor = this.actor

    // Define the healthData
    const willpowerData = actor.system.willpower

    // Derive the character's "willpower value" by taking
    // the sum of the current aggravated and superficial
    // damage taken and subtracting the max by that;
    // superficial damage is reduced by half to represent
    // its lesser effect
    const derivedWillpower = willpowerData.max - (willpowerData.aggravated + (willpowerData.superficial / 2))

    // Update the actor's health.value
    actor.update({ 'system.willpower.value': derivedWillpower })
  }

  // Roll Handlers
  async _onWillpowerRoll (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor

    // Secondary variables
    const dicePool = Math.max(this.getWillpowerDicePool(actor), 1)

    WOD5eDice.Roll({
      basicDice: dicePool,
      title: game.i18n.localize('WOD5E.Chat.RollingWillpower'),
      paths: ['willpower'],
      actor,
      data: actor.system,
      quickRoll: false,
      disableAdvancedDice: true
    })
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in a dataset
   * @param {Event} event   The originating click event
   */
  async _onCreateItem (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const dataset = event.currentTarget.dataset
    const itemsList = WOD5E.ItemTypes.getList()
    const type = dataset.type

    // Variables to be defined later
    let subtype = dataset.subtype
    let itemName = ''
    let selectLabel = ''
    let itemOptions = {}
    let itemData = {}
    let options = ''

    // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systems list
    const system = actor.system.gamesystem in WOD5E.Systems.getList() ? actor.system.gamesystem : 'mortal'

    // Generate item-specific data based on type
    switch (type) {
      case 'power':
        selectLabel = game.i18n.localize('WOD5E.VTM.SelectDiscipline')
        itemOptions = WOD5E.Disciplines.getList()
        break
      case 'perk':
        selectLabel = game.i18n.localize('WOD5E.HTR.SelectEdge')
        itemOptions = WOD5E.Edges.getList()
        break
      case 'gift':
        selectLabel = game.i18n.localize('WOD5E.WTA.SelectGift')
        itemOptions = WOD5E.Gifts.getList()
        break
      case 'feature':
        selectLabel = game.i18n.localize('WOD5E.ItemsList.SelectFeature')
        itemOptions = WOD5E.Features.getList()
        break
      default:
        console.log('Error: Invalid type provided.')
        break
    }

    // Get the image for the item, if available
    const itemImg = itemsList[type]?.img || 'systems/vtm5e/assets/icons/items/item-default.svg'

    // Create item if subtype is already defined or not needed
    if (subtype || ['customRoll', 'boon'].includes(type)) {
      if (subtype) {
        itemData = await this.appendSubtypeData(type, subtype, itemData)
      }

      // Generate item name
      itemName = subtype ? await WOD5E.api.generateLabelAndLocalize({ string: subtype }) : itemsList[type].label

      // Create the item
      return this._createItem(actor, itemName, type, itemImg, itemData)
    } else {
      // Build the options for the select dropdown
      for (const [key, value] of Object.entries(itemOptions)) {
        options += `<option value="${key}">${value.displayName}</option>`
      }

      // Template for the dialog form
      const template = `
        <form>
          <div class="form-group">
            <label>${selectLabel}</label>
            <select id="subtypeSelect">${options}</select>
          </div>
        </form>`

      // Define dialog buttons
      const buttons = {
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('WOD5E.Add'),
          callback: async (html) => {
            subtype = html.find('#subtypeSelect')[0].value
            itemData = await this.appendSubtypeData(type, subtype, itemData)

            // Generate the item name
            itemName = subtype ? await WOD5E.api.generateLabelAndLocalize({ string: subtype }) : itemsList[type].label

            // Create the item
            return this._createItem(actor, itemName, type, itemImg, itemData)
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      }

      // Display the dialog
      new Dialog({
        title: game.i18n.localize('WOD5E.Add'),
        content: template,
        buttons,
        default: 'submit'
      }, {
        classes: ['wod5e', `${system}-dialog`, `${system}-sheet`]
      }).render(true)
    }
  }

  /**
  * Append subtype data to the item data based on item type
  * @param {string} type    The item type
  * @param {string} subtype The item subtype
  * @param {object} itemData The existing item data
  * @returns {object} The updated item data
  */
  async appendSubtypeData (type, subtype, itemData) {
    switch (type) {
      case 'power':
        itemData.discipline = subtype
        break
      case 'perk':
        itemData.edge = subtype
        break
      case 'gift':
        itemData.giftType = subtype
        break
      case 'feature':
        itemData.featuretype = subtype
        break
      default:
        itemData.subtype = subtype
    }

    return itemData
  }

  /**
  * Create an item for the actor
  * @param {object} actor    The actor object
  * @param {string} itemName The name of the item
  * @param {string} type     The type of the item
  * @param {string} itemImg  The image for the item
  * @param {object} itemData The data for the item
  */
  async _createItem (actor, itemName, type, itemImg, itemData) {
    return actor.createEmbeddedDocuments('Item', [{
      name: `${game.i18n.format('WOD5E.New', {
        string: itemName
      })}`,
      type,
      img: itemImg,
      system: itemData
    }])
  }
}
