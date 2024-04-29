/* global DEFAULT_TOKEN, ChatMessage, duplicate, ActorSheet, game, renderTemplate, Dialog, TextEditor, WOD5E */

import { _onRoll } from './scripts/roll.js'
import { _onResourceChange, _setupDotCounters, _setupSquareCounters, _onDotCounterChange, _onDotCounterEmpty, _onSquareCounterChange } from './scripts/counters.js'
import { _onAddBonus, _onDeleteBonus, _onEditBonus } from './scripts/specialty-bonuses.js'
import { Attributes } from '../def/attributes.js'
import { Skills } from '../def/skills.js'

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
    if (actorData.biography) { data.enrichedBiography = await TextEditor.enrichHTML(actorData.biography, { async: true }) }
    if (actorData.appearance) { data.enrichedAppearance = await TextEditor.enrichHTML(actorData.appearance, { async: true }) }
    if (actorData.notes) { data.enrichedNotes = await TextEditor.enrichHTML(actorData.notes, { async: true }) }
    if (actorData.equipment) { data.enrichedEquipment = await TextEditor.enrichHTML(actorData.equipment, { async: true }) }

    // Enrich actor header editor fields
    if (actorHeaders) {
      if (actorHeaders.tenets) { data.enrichedTenets = await TextEditor.enrichHTML(actorHeaders.tenets, { async: true }) }
      if (actorHeaders.touchstones) { data.enrichedTouchstones = await TextEditor.enrichHTML(actorHeaders.touchstones, { async: true }) }

      // Vampire stuff
      if (actorHeaders.bane) { data.enrichedBane = await TextEditor.enrichHTML(actorHeaders.bane, { async: true }) }

      // Ghoul stuff
      if (actorHeaders.creedfields) { data.enrichedCreedFields = await TextEditor.enrichHTML(actorHeaders.creedfields, { async: true }) }
    }

    return data
  }

  constructor (actor, options) {
    super(actor, options)
  }

  /**
     * Organize and classify Items for all sheets.
     *
     * @param {Object} actorData The actor to prepare.
     * @return {undefined}
     * @override
     */
  _prepareItems (sheetData) {
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
    const attributesList = Attributes.getList()
    const actorAttributes = actorData.system?.abilities
    if (actorAttributes) {
      for (const entry of attributesList) {
        // Assign the data to a value
        const [, value] = Object.entries(entry)[0]
        const id = Object.getOwnPropertyNames(entry)[0]
        let attributeData = {}

        // If the actor has an attribute with the key, grab its current values
        if (Object.prototype.hasOwnProperty.call(actorAttributes, id)) {
          attributeData = Object.assign({
            id,
            value: actorAttributes[id].value
          }, value)
        } else { // Otherwise, use the default
          attributeData = Object.assign({
            id,
            value: 1
          }, value)
        }

        // Push to the container in the appropraite type
        // as long as the attribute isn't "hidden"
        if (!attributeData.hidden) {
          attributes[value.type].push(attributeData)
        }
      }
    }

    // Loop through each entry in the skills list, get the data (if available), and then push to the containers
    const skillsList = Skills.getList()
    const actorSkills = actorData.system?.skills

    if (actorSkills) {
      for (const entry of skillsList) {
        // Assign the data to a value
        const [, value] = Object.entries(entry)[0]
        const id = Object.getOwnPropertyNames(entry)[0]
        let skillData = {}
        let hasSpecialties = false

        if (actorSkills[id].bonuses.length > 0) {
          hasSpecialties = true
        }

        // If the actor has a skill with the key, grab its current values
        if (Object.prototype.hasOwnProperty.call(actorSkills, id)) {
          skillData = Object.assign({
            id,
            value: actorSkills[id].value,
            hasSpecialties
          }, value)
        } else { // Otherwise, use the default
          skillData = Object.assign({
            id,
            value: 0,
            hasSpecialties
          }, value)
        }

        // Push to the container in the appropraite type
        // as long as the skill isn't "hidden"
        if (!skillData.hidden) {
          skills[value.type].push(skillData)
        }
      }
    }

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN
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
    html.find('.resource-counter > .resource-counter-step').click(_onSquareCounterChange.bind(this))
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
    html.find('.item-create').click(this._onItemCreate.bind(this))

    // Edit a skill
    html.find('.edit-skill').click(this._onSkillEdit.bind(this))

    // Send Inventory Item to Chat
    html.find('.item-chat').click(event => {
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
    html.find('.item-edit').click(event => {
      const li = $(event.currentTarget).parents('.item')
      const item = actor.getEmbeddedDocument('Item', li.data('itemId'))
      item.sheet.render(true)
    })

    // Delete Inventory Item
    html.find('.item-delete').click(event => {
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
  }

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
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @protected
   */
  async _onItemCreate (event) {
    event.preventDefault()

    // Top-level variables
    const actor = this.actor
    const header = event.currentTarget
    const type = header.dataset.type

    // Secondary variables
    const data = duplicate(header.dataset)

    // Variables yet to be defined
    let prelocalizeString

    // Handle situational variable changing
    if (type === 'power') { // Vampire disciplines
      prelocalizeString = data.discipline
    } else if (type === 'perk') {
      prelocalizeString = data.edge
    } else if (type === 'feature') {
      prelocalizeString = data.featuretype
    } else {
      prelocalizeString = type
    }
    // Handle situational variable changing part 2
    if (type === 'boon') {
      data.boontype = 'Trivial'
    } else if (type === 'customRoll') {
      data.dice1 = 'strength'
      data.dice2 = 'athletics'
    }

    // Get the image for the item, if one is available from the item definitions
    const itemFromList = WOD5E.ItemTypes.getList().find(obj => type in obj)
    const img = itemFromList[type].img ? itemFromList[type].img : '/systems/vtm5e/assets/icons/items/item-default.svg'

    // Initialize a default name.
    const name = await WOD5E.api.generateLabelAndLocalize({ string: prelocalizeString })

    // Prepare the item object.
    const itemData = {
      name,
      type,
      img,
      system: data
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system.type

    // Finally, create the item!
    return actor.createEmbeddedDocuments('Item', [itemData])
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
    const system = WOD5E.Systems.getList().find(obj => actor.system.gamesystem in obj) ? actor.system.gamesystem : 'mortal'

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
        title: game.i18n.localize(actor.system.skills[skill].name),
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
          html.find('.add-bonus').click(event => {
            _onAddBonus(event, actor, skillData, SkillEditDialog)
          })

          // Delete a bonus
          html.find('.delete-bonus').click(event => {
            _onDeleteBonus(event, actor, skillData, SkillEditDialog)
          })

          // Prompt the dialog to edit a bonus
          html.find('.edit-bonus').click(event => {
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
}
