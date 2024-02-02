/* global duplicate */

// Handle all types of resource changes
export const _onResourceChange = async function (event) {
  event.preventDefault()

  // Top-level variables
  const actor = this.actor
  const actorData = duplicate(actor)
  const element = event.currentTarget
  const dataset = Object.assign({}, element.dataset)
  const resource = dataset.resource

  // Don't let things be edited if the sheet is locked
  if (this.locked) return

  // Handle adding and subtracting the number of boxes
  if (dataset.action === 'plus') {
    actorData.system[resource].max++
  } else if (dataset.action === 'minus') {
    actorData.system[resource].max = Math.max(actorData.system[resource].max - 1, 0)
  }

  if (actorData.system[resource].aggravated + actorData.system[resource].superficial > actorData.system[resource].max) {
    actorData.system[resource].aggravated = actorData.system[resource].max - actorData.system[resource].superficial
    if (actorData.system[resource].aggravated <= 0) {
      actorData.system[resource].aggravated = 0
      actorData.system[resource].superficial = actorData.system[resource].max
    }
  }

  // Update the actor with the new data
  actor.update(actorData)
}

// Handle changes to the dot counters
export const _setupDotCounters = async function (html) {
  html.find('.resource-value').each(function () {
    const value = parseInt(this.dataset.value)
    $(this).find('.resource-value-step').each(function (i) {
      if (i + 1 <= value) {
        $(this).addClass('active')
      }
    })
  })
  html.find('.resource-value-static').each(function () {
    const value = parseInt(this.dataset.value)
    $(this).find('.resource-value-static-step').each(function (i) {
      if (i + 1 <= value) {
        $(this).addClass('active')
      }
    })
  })
}

// Handle all changes to square counters
export const _setupSquareCounters = async function (html) {
  html.find('.resource-counter').each(function () {
    const data = this.dataset
    const states = parseCounterStates(data.states)
    const humanity = data.name === 'system.humanity'
    const despair = data.name === 'system.despair'

    const fulls = parseInt(data[states['-']]) || 0
    const halfs = parseInt(data[states['/']]) || 0
    const crossed = parseInt(data[states.x]) || 0

    let values

    // This is a little messy but it's effective.
    // Effectively we're making sure that each square
    // counter's box-filling tactic is followed properly.
    if (despair) { // Hunter-specific
      values = new Array(fulls)

      values.fill('-', 0, fulls)
    } else if (humanity) { // Vampire-specific
      values = new Array(fulls + halfs)

      values.fill('-', 0, fulls)
      values.fill('/', fulls, fulls + halfs)
    } else { // General use
      values = new Array(halfs + crossed)

      values.fill('/', 0, halfs)
      values.fill('x', halfs, halfs + crossed)
    }

    // Iterate through the data states now that they're properly defined
    $(this).find('.resource-counter-step').each(function () {
      this.dataset.state = ''
      if (this.dataset.index < values.length) {
        this.dataset.state = values[this.dataset.index]
      }
    })
  })
}

// Handle dot counters
export const _onDotCounterChange = async function (event) {
  event.preventDefault()

  // Top-level variables
  const element = event.currentTarget
  const dataset = Object.assign({}, element.dataset)

  // Secondary variables
  const index = parseInt(dataset.index)
  const parent = $(element.parentNode)
  const fieldStrings = parent[0].dataset.name
  const fields = fieldStrings.split('.')
  const steps = parent.find('.resource-value-step')

  // Make sure that the dot counter can only be changed if the sheet is
  // unlocked or if it's the hunger track.
  if (this.locked && !parent.has('.hunger-value').length) return

  if (index < 0 || index > steps.length) {
    return
  }

  // Handle editing the steps on the dot counter
  steps.removeClass('active')
  steps.each(function (i) {
    if (i <= index) {
      $(this).addClass('active')
    }
  })
  // Update the actor field
  _assignToActorField(fields, index + 1, this.actor)
}

// Set dot counters to an empty value
export const _onDotCounterEmpty = async function (event) {
  event.preventDefault()

  // Top-level variables
  const element = event.currentTarget
  const parent = $(element.parentNode)

  // Secondary variables
  const fieldStrings = parent[0].dataset.name
  const fields = fieldStrings.split('.')
  const steps = parent.find('.resource-value-empty')

  // Make sure that the dot counter can only be changed if the sheet is
  // unlocked or if it's the hunger track.
  if (this.locked && !parent.has('.hunger-value').length) return

  // Update the actor field
  steps.removeClass('active')
  _assignToActorField(fields, 0, this.actor)
}

// Handle square counters
export const _onSquareCounterChange = async function (event) {
  event.preventDefault()

  // Top-level variables
  const element = event.currentTarget
  const index = parseInt(element.dataset.index)

  // Secondary variables
  const oldState = element.dataset.state || ''
  const parent = $(element.parentNode)
  const data = parent[0].dataset
  const states = parseCounterStates(data.states)
  const fields = data.name.split('.')
  const steps = parent.find('.resource-counter-step')
  const humanity = data.name === 'system.humanity'
  const despair = data.name === 'system.despair'
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

  if ((oldState !== '' && oldState !== '-') || (oldState !== '' && humanity)) {
    data[states[oldState]] = parseInt(data[states[oldState]]) - 1
  }

  // If the step was removed we also need to subtract from the maximum.
  if (oldState !== '' && newState === '' && !humanity && !despair) {
    data[states['-']] = parseInt(data[states['-']]) - 1
  }

  if (newState !== '') {
    data[states[newState]] = parseInt(data[states[newState]]) + Math.max(index + 1 - fulls - halfs - crossed, 1)
  }

  const newValue = Object.values(states).reduce(function (obj, k) {
    obj[k] = parseInt(data[k]) || 0
    return obj
  }, {})

  _assignToActorField(fields, newValue, this.actor)
}

// Function to help with counter states
function parseCounterStates (states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}

// There's gotta be a better way to do this but for the life of me I can't figure it out
function _assignToActorField (fields, value, actor) {
  // Top-level variables
  const actorData = duplicate(actor)

  // update actor owned items
  if (fields.length === 2 && fields[0] === 'items') {
    for (const item of actorData.items) {
      if (fields[1] === item._id) {
        item.system.points = value
        break
      }
    }
  } else {
    const lastField = fields.pop()
    fields.reduce((data, field) => data[field], actorData)[lastField] = value
  }

  // Update the actor with the new data
  actor.update(actorData)
}
