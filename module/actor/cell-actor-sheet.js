/* global DEFAULT_TOKEN, WoDv5Actor, game, mergeObject, duplicate, renderTemplate, ChatMessage, TextEditor */

import { WoDv5Actor } from './wod-v5-sheet.js'

/**
 * Extend the base WoDv5Actor with anything necessary for the new actor sheet
 * @extends {WoDv5Actor}
 */

export class CellActorSheet extends WoDv5Actor {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'hunter-sheet', 'sheet', 'actor', 'cell']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/vtm5e/templates/actor/cell-sheet.html',
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
    this.locked = true
    this.isCharacter = false
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/vtm5e/templates/actor/limited-sheet.html'
    return 'systems/vtm5e/templates/actor/cell-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()
    data.locked = this.locked
    data.isCharacter = this.isCharacter
    data.hasBoons = this.hasBoons
    data.sheetType = `${game.i18n.localize('VTM5E.Cell')}`

    data.dtypes = ['String', 'Number', 'Boolean']

    // Encrich editor content
    data.enrichedTenets = await TextEditor.enrichHTML(this.object.system.headers.tenets, { async: true })
    data.enrichedTouchstones = await TextEditor.enrichHTML(this.object.system.headers.touchstones, { async: true })
    data.enrichedCreedFields = await TextEditor.enrichHTML(this.object.system.headers.creedfields, { async: true })
    data.enrichedBiography = await TextEditor.enrichHTML(this.object.system.biography, { async: true })
    data.enrichedAppearance = await TextEditor.enrichHTML(this.object.system.appearance, { async: true })

    data.enrichedNotes = await TextEditor.enrichHTML(this.object.system.notes, { async: true })
    data.enrichedEquipment = await TextEditor.enrichHTML(this.object.system.equipment, { async: true })

    // Prepare items.
    if (this.actor.type === 'cell') {
      this._prepareItems(data)
    }

    return data
  }

  /**
     * Organize and classify Disciplines for Vampire & Ghoul sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
  _prepareItems (sheetData) {
    const actorData = sheetData.actor

    const features = {
      background: [],
      merit: [],
      flaw: []
    }

    const gear = []

    for (const i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN
      if (i.type === 'item') {
        // Append to gear.
        gear.push(i)
      } else if (i.type === 'feature') {
        // Append to features.
        features[i.system.featuretype].push(i)
      }
    }

    actorData.gear = gear
    actorData.features = features
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)
    this._setupCellSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Desperation and Danger trackers
    html.find('.cell-resource-counter > .cell-resource-counter-step').click(this._onCellSquareCounterChange.bind(this))
  }

  // Added for Desperation and Danger Counters
  _onCellSquareCounterChange (event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.cell-resource-counter-step')
    const desperation = data.name === 'system.desperation'
    const danger = data.name === 'system.danger'
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

    if ((oldState !== '' && oldState !== '-') || (oldState !== '' && desperation) || (oldState !== '' && danger)) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '' && !desperation && !danger) {
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

  _setupCellSquareCounters (html) {
    html.find('.cell-resource-counter').each(function () {
      const data = this.dataset
      const states = parseCounterStates(data.states)
      const desperation = data.name === 'system.desperation'
      const danger = data.name === 'system.danger'

      const fulls = Number(data[states['-']]) || 0
      const halfs = Number(data[states['/']]) || 0
      const crossed = Number(data[states.x]) || 0

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
