/* global game, mergeObject */

import { WoDActor } from './wod-v5-sheet.js'

/**
 * Extend the base WoDActor with anything necessary for the new actor sheet
 * @extends {WoDActor}
 */

export class CellActorSheet extends WoDActor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['wod5e', 'hunter-sheet', 'sheet', 'actor', 'cell']

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/cell-sheet.hbs',
      width: 940,
      height: 700,
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'features'
      }]
    })
  }

  constructor (actor, options) {
    super(actor, options)
    this.isCharacter = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.hbs'
    return 'systems/vtm5e/templates/actor/cell-sheet.hbs'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    // Top-level variables
    const data = await super.getData()
    const actor = this.actor

    // Define the type of sheet
    data.sheetType = `${game.i18n.localize('WOD5E.HTR.Cell')}`

    // Prepare items.
    if (actor.type === 'cell') {
      this._prepareItems(data)
    }

    // Show boons on the sheet
    data.hasBoons = this.hasBoons

    // Define data types
    data.dtypes = ['String', 'Number', 'Boolean']

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    // Activate listeners
    super.activateListeners(html)

    // Setup counters
    this._setupCellSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Desperation and Danger trackers
    html.find('.cell-resource-counter > .cell-resource-counter-step').click(this._onCellSquareCounterChange.bind(this))
  }

  // Added for Desperation and Danger Counters
  _onCellSquareCounterChange (event) {
    event.preventDefault()

    // Top-level variables
    const element = event.currentTarget

    // Secondary variables
    const index = parseInt(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.cell-resource-counter-step')
    const desperation = data.name === 'system.desperation'
    const danger = data.name === 'system.danger'
    const fulls = parseInt(data[states['-']]) || 0
    const halfs = parseInt(data[states['/']]) || 0
    const crossed = parseInt(data[states.x]) || 0

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

    if ((oldState !== '' && oldState !== '-') || (oldState !== '' && desperation) || (oldState !== '' && danger)) {
      data[states[oldState]] = parseInt(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '' && !desperation && !danger) {
      data[states['-']] = parseInt(data[states['-']]) - 1
    }

    if (newState !== '') {
      data[states[newState]] = parseInt(data[states[newState]]) + Math.max(index + 1 - fulls - halfs - crossed, 1)
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = parseInt(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }

  _setupCellSquareCounters (html) {
    html.find('.cell-resource-counter').each(function () {
      // Top-level variables
      const data = this.dataset

      // Secondary variables
      const states = parseCounterStates(data.states)
      const desperation = data.name === 'system.desperation'
      const danger = data.name === 'system.danger'
      const fulls = parseInt(data[states['-']]) || 0
      const halfs = parseInt(data[states['/']]) || 0
      const crossed = parseInt(data[states.x]) || 0
      const values = desperation ? new Array(fulls + halfs) : danger ? new Array(fulls + halfs) : new Array(halfs + crossed)

      if (desperation) {
        values.fill('-', 0, fulls)
        values.fill('/', fulls, fulls + halfs)
      } else if (danger) {
        values.fill('-', 0, fulls)
        values.fill('/', fulls, fulls + halfs)
      } else {
        values.fill('/', 0, halfs)
        values.fill('x', halfs, halfs + crossed)
      }

      $(this).find('.cell-resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index]
        }
      })
    })
  }
}

function parseCounterStates (states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}
