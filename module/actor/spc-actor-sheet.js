/* global DEFAULT_TOKEN, Dialog, duplicate, game, mergeObject */

// Export this function to be used in other scripts
import { CoterieActorSheet } from './coterie-actor-sheet.js'
import { rollBasicDice } from './roll-basic-dice.js'

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CoterieActorSheet}
 */

export class SPCActorSheet extends CoterieActorSheet {
  /** @override */
  static get defaultOptions () {
    // Define the base list of CSS classes
    const classList = ['vtm5e', 'sheet', 'actor', 'spc']

    // If the user's enabled darkmode, then push it to the class list
    if (game.settings.get('vtm5e', 'darkTheme')) {
      classList.push('dark-theme')
    }

    return mergeObject(super.defaultOptions, {
      classes: classList,
      template: 'systems/wod5e/templates/actor/spc-sheet.html',
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
    this.hasBoons = true
  }

  /** @override */
  get template () {
    if (!game.user.isGM && this.actor.limited) return 'systems/wod5e/templates/actor/limited-sheet.html'
    return 'systems/wod5e/templates/actor/spc-sheet.html'
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()
    // TODO: confirm that I can finish and use this list
    data.sheetType = `${game.i18n.localize('VTM5E.SPC')}`

    // Prepare items.
    if (this.actor.data.type === 'spc') {
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
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    this._setupDotCounters(html)
    this._setupSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // Resource squares (Health, Willpower)
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))
    html.find('.resource-plus').click(this._onResourceChange.bind(this))
    html.find('.resource-minus').click(this._onResourceChange.bind(this))

    // Rollable standarddicepools.
    html.find('.rollable').click(this._onRoll.bind(this))

    // Make Exceptional Skill visible
    html.find('.exceptionalskill-create').click(this._onShowExceptionalSkill.bind(this))

    // Make Exceptional Skill hidden
    html.find('.exceptionalskill-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`data.exceptionaldicepools.${data.exceptionalskill}.visible`]: false })
    })

    // Make Discipline visible
    html.find('.discipline-create').click(this._onShowDiscipline.bind(this))

    // Make Discipline hidden
    html.find('.discipline-delete').click(ev => {
      const data = $(ev.currentTarget)[0].dataset
      this.actor.update({ [`data.disciplines.${data.discipline}.visible`]: false })
    })
  }

  /**
     * Handle making a exceptionalskill visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowExceptionalSkill (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.data.data.exceptionaldicepools)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectSkill')}</label>
              <select id="skillSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const exceptionalskill = html.find('#skillSelect')[0].value
          this.actor.update({ [`data.exceptionaldicepools.${exceptionalskill}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddSkill'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)


    // Rollable Vampire/Ghouls powers
    html.find('.power-rollable').click(this._onVampireRoll.bind(this))
  }

  /**
     * Handle making a discipline visible
     * @param {Event} event   The originating click event
     * @private
     */
  _onShowDiscipline (event) {
    event.preventDefault()
    let options = ''
    for (const [key, value] of Object.entries(this.actor.data.data.disciplines)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('VTM5E.SelectDiscipline')}</label>
              <select id="disciplineSelect">${options}</select>
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Add'),
        callback: async (html) => {
          const discipline = html.find('#disciplineSelect')[0].value
          this.actor.update({ [`data.disciplines.${discipline}.visible`]: true })
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.AddDiscipline'),
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

    rollBasicDice(numDice, this.actor, `${dataset.label}`, 0, subtractWillpower)
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
    const humanity = data.name === 'data.humanity'
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

    if ((oldState !== '' && oldState !== '-') || (oldState !== '' && humanity)) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '' && !humanity) {
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
      const humanity = data.name === 'data.humanity'

      const fulls = Number(data[states['-']]) || 0
      const halfs = Number(data[states['/']]) || 0
      const crossed = Number(data[states.x]) || 0

      const values = humanity ? new Array(fulls + halfs) : new Array(halfs + crossed)

      if (humanity) {
        values.fill('-', 0, fulls)
        values.fill('/', fulls, fulls + halfs)
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
}

function parseCounterStates (states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}
