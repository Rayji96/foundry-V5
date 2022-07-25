/* global DEFAULT_TOKEN, Dialog, duplicate, game, mergeObject */

// Export this function to be used in other scripts
import { CellActorSheet } from './cell-actor-sheet.js'
import { rollHunterDice } from './roll-hunter-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CellActorSheet}
 */

export class HunterActorSheet extends CellActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'hunter-theme','sheet', 'actor', 'hunter']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/wod5e/templates/actor/hunter-sheet.html',
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
    this.isCharacter = true
    this.hunger = false
    this.hasBoons = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/wod5e/templates/actor/limited-sheet.html'
    return 'systems/wod5e/templates/actor/hunter-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()
    // TODO: confirm that I can finish and use this list
    data.sheetType = `${game.i18n.localize('VTM5E.Hunter')}`

    // Prepare items.
    if (this.actor.data.type === 'hunter') {
      this._prepareItems(data)
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
  _prepareItems (sheetData) {
    super._prepareItems(sheetData)
    const actorData = sheetData.actor

    const edges = {
      arsenal: [],
      fleet: [],
      ordnance: [],
      library: [],
      improvisedgear: [],
      globalaccess: [],
      dronejockey: [],
      beastwhisperer: [],
      sensetheunnatural: [],
      repeltheunnatural: [],
      thwarttheunnatural: [],
      artifact: []
    }

    // Initialize containers.
    const specialties = []
    const boons = []
    const customRolls = []

    // Iterate through items, allocating to containers
    for (const i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN
      if (i.type === 'specialty') {
        // Append to specialties.
        specialties.push(i)
      } else if (i.type === 'boon') {
        // Append to boons.
        boons.push(i)
      } else if (i.type === 'customRoll') {
        // Append to custom rolls.
        customRolls.push(i)
      } else if (i.type === 'perk') {
        // Append to edges.
        if (i.data.edge !== undefined) {
          edges[i.data.edge].push(i)
          if (!this.actor.data.data.edges[i.data.edge].visible) {
            this.actor.update({ [`data.edges.${i.data.edge}.visible`]: true })
          }
        }
      }
    }

    // Assign and return
    actorData.specialties = specialties
    actorData.boons = boons
    actorData.customRolls = customRolls
    actorData.edges_list = edges
  }
  

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    this._setupDotCounters(html)
    this._setupSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Make Edge visible
    html.find('.edge-create').click(this._onShowEdge.bind(this))
    
    // Make Edge hidden
    html.find('.edge-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`data.edges.${data.edge}.visible`]: false })
    })

    // Post Edge description to the chat
    html.find('.edge-chat').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      const edge = this.actor.data.data.edges[data.edge]

      renderTemplate('systems/wod5e/templates/actor/parts/chat-message.html', {
        name: game.i18n.localize(edge.name),
        img: 'icons/svg/dice-target.svg',
        description: edge.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })
  
    // Resource squares (Health, Willpower)
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))
    html.find('.resource-plus').click(this._onResourceChange.bind(this))
    html.find('.resource-minus').click(this._onResourceChange.bind(this))

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this))
    html.find('.custom-rollable').click(this._onCustomVampireRoll.bind(this))
    html.find('.specialty-rollable').click(this._onCustomVampireRoll.bind(this))
    html.find('.vrollable').click(this._onRollDialog.bind(this))
    html.find('.perk-rollable').click(this._onPerkRoll.bind(this))
  }

  /**
   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollDialog (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    let options = ''

    for (const [key, value] of Object.entries(this.actor.data.data.abilities)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const despair = Object.values(this.actor.data.data.despair)
    const despairstring = despair.toString()
    
    if (despairstring === '1') {
      var despairoutcome = true
    } else {
      var despairoutcome = false
    }
    
    const template = despairoutcome ? 
    `<form>
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.SelectAbility')}</label>
            <select id="abilitySelect">${options}</select>
        </div>  
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.Modifier')}</label>
            <input type="text" id="inputMod" value="0">
        </div>
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.DesperationUnavailable')}</label>
            <input type="text" min="0" id="inputDespMod" disabled value="0">
        </div>
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.Difficulty')}</label>
            <input type="text" min="0" id="inputDif" value="0">
        </div>
    </form>` :
    `<form>
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.SelectAbility')}</label>
            <select id="abilitySelect">${options}</select>
        </div>  
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.Modifier')}</label>
            <input type="text" id="inputMod" value="0">
        </div>
        <div class="form-group">
            <label>${game.i18n.localize('VTM5E.DesperationDice')}</label>
            <input type="text" min="0" id="inputDespMod" value="0">
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
          const ability = html.find('#abilitySelect')[0].value
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const desperationDice = parseInt(html.find('#inputDespMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const abilityVal = this.actor.data.data.abilities[ability].value
          const abilityName = game.i18n.localize(this.actor.data.data.abilities[ability].name)
          const numDice = abilityVal + parseInt(dataset.roll) + modifier
          rollHunterDice(numDice, this.actor, `${dataset.label} + ${abilityName}`, difficulty, desperationDice, this.hunger)
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

    rollHunterDice(numDice, this.actor, `${dataset.label}`, 0, subtractWillpower)
  }


  _onCustomVampireRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    if (dataset.dice1 === '') {
      const dice2 = this.actor.data.data.skills[dataset.dice2.toLowerCase()].value
      dataset.roll = dice2 + 1 // specialty modifier
      dataset.label = dataset.name
      this._onRollDialog(event)
    } else {
      const dice1 = this.actor.data.data.abilities[dataset.dice1.toLowerCase()].value
      const dice2 = this.actor.data.data.skills[dataset.dice2.toLowerCase()].value
      const dicePool = dice1 + dice2
      rollHunterDice(dicePool, this.actor, `${dataset.name}`, 0, desperationDice, this.hunger)
    }
  }

  _onSquareCounterChange (event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.resource-counter-step')
    const despair = data.name === 'data.despair'
    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0
    const crossed = Number(data[states.x]) || 0

    if (index < 0 || index > steps.length) {
      return
    }

    const allStates = ['', ...Object.keys(states)]
    const currentState = allStates.indexOf(oldState)
    if (currentState < 0) {
      return
    }

    const newState = allStates[(currentState + 1) % allStates.length]
    steps[index].dataset.state = newState

    if ((oldState !== '' && oldState !== '-') || (oldState !== '' && despair)) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '' && !despair) {
      data[states['-']] = Number(data[states['-']]) - 1
    }

    if (newState !== '') {
      data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs - crossed, 1)
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }

  _setupSquareCounters (html) {
    html.find('.resource-counter').each(function () {
      const data = this.dataset
      const states = parseCounterStates(data.states)
      const despair = data.name === 'data.despair'

      const fulls = Number(data[states['-']]) || 0
      const halfs = Number(data[states['/']]) || 0
      const crossed = Number(data[states.x]) || 0

      const values = despair ? new Array(fulls) : new Array(halfs + crossed)

      if (despair) {
        values.fill('-', 0, fulls)
      } else {
        values.fill('/', 0, halfs)
        values.fill('x', halfs, halfs + crossed)
      }

      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index]
        }
      })
    })
  }

  _onResourceChange (event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const dataset = element.dataset
    const resource = dataset.resource
    if (dataset.action === 'plus' && !this.locked) {
      actorData.data[resource].max++
    } else if (dataset.action === 'minus' && !this.locked) {
      actorData.data[resource].max = Math.max(actorData.data[resource].max - 1, 0)
    }

    if (actorData.data[resource].aggravated + actorData.data[resource].superficial > actorData.data[resource].max) {
      actorData.data[resource].aggravated = actorData.data[resource].max - actorData.data[resource].superficial
      if (actorData.data[resource].aggravated <= 0) {
        actorData.data[resource].aggravated = 0
        actorData.data[resource].superficial = actorData.data[resource].max
      }
    }
    this.actor.update(actorData)
  }

  /**
     * Handle making a edge visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowEdge (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.data.data.edges)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectEdge')}</label>
              <select id="edgeSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const edge = html.find('#edgeSelect')[0].value
          this.actor.update({ [`data.edges.${edge}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddEdge'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  _onPerkRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const item = this.actor.items.get(dataset.id)
    const edgeValue = 1

    const dice1 = item.data.data.dice1 === 'edge' ? edgeValue : this.actor.data.data.abilities[item.data.data.dice1].value

    let dice2
    if (item.data.data.dice2 === 'edge') {
      dice2 = edgeValue
    } else if (item.data.data.skill) {
      dice2 = this.actor.data.data.skills[item.data.data.dice2].value
    } else if (item.data.data.amalgam) {
      dice2 = this.actor.data.data.edges[item.data.data.dice2].value
    } else {
      dice2 = this.actor.data.data.abilities[item.data.data.dice2].value
    }

    const dicePool = dice1 + dice2
    rollHunterDice(dicePool, this.actor, `${item.data.name}`, 0)
  }
}

function parseCounterStates (states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}