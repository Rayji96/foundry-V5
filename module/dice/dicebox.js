/* global game */

export function prepareSearchableSelection (id, $content, data, callback) {
  const select = `#${id}`
  const cover = `#${id}Cover`
  const hover = `#${id}Cover .dice-tray-searchable-select-hover`
  const input = `#${id}Input`
  const fields = `#${id}Fields`
  const options = `#${id}Fields li`
  const visibleOptions = `${options}:visible`

  $content.find(cover).on('click', () => {
    if ($content.find(fields).is(':hidden')) {
      $content.find(select).css('visibility', 'hidden')
      $content.find(options).show()
      $content.find(fields).show()
      $content.find(hover).hide()
      $content.find(input).val('').focus()
    }
  })
  $content.find(fields).on('focusout', event => {
    event.preventDefault()
    setTimeout(() => {
      if ($content.find(fields).has($(document.activeElement)).length === 0) {
        $content.find(select).css('visibility', 'visible')
        $content.find(fields).hide()
        $content.find(hover).show()
      }
    }, 0)
  })
  $content.find(input).on('input', event => {
    const searchTerm = event.target.value.toLowerCase()
    $content.find(options).each(function () {
      if ($(this).text().toLowerCase().indexOf(searchTerm) === 0) {
        $(this).show()
        return
      }
      $(this).hide()
    })
  })
  $content.find(options).on('click', event => {
    event.preventDefault()
    const selectedValue = $(event.target).attr('value')
    $content.find(select).val(selectedValue)
    $content.find(select).trigger('change')
    setTimeout(() => {
      $content.find(fields).hide()
      $content.find(hover).show()
      $content.find(select).css('visibility', 'visible')
    }, 1)
  })
  $content.find(select).on('change', event => {
    event.preventDefault()
    data[id] = callback(event)
    data.updateDiceTray(data)
  })
  $content.find(fields).on('keydown', event => {
    if (event.code === 'Enter') {
      if ($(event.target).is(input)) {
        if ($content.find(visibleOptions).length > 0) {
          $content.find(visibleOptions).first().trigger('click')
        }
      } else if ($(event.target).is(options)) {
        $(event.target).trigger('click')
      }
      $content.find(fields).hide()
      $content.find(hover).show()
      $content.find(select).css('visibility', 'visible')
      return
    }
    if (event.code === 'Escape') {
      $content.find(fields).hide()
      $content.find(hover).show()
      $content.find(select).css('visibility', 'visible')
      return
    }
    const selectableElements = $content.find(`${input}, ${visibleOptions}`)
    if (event.code === 'ArrowUp') {
      const activeIndex = selectableElements.index($(':focus'))
      selectableElements.eq((activeIndex + selectableElements.length - 1) % selectableElements.length).focus()
      return
    }
    if (event.code === 'ArrowDown') {
      const activeIndex = selectableElements.index($(':focus'))
      selectableElements.eq((activeIndex + selectableElements.length + 1) % selectableElements.length).focus()
    }
  })
}

export function watchPool1Filters ($content, data) {
  $content.find('.pool1-filters input[type=radio]').on('change', event => {
    event.preventDefault()
    data.pool1Type = event.target.value
    data.updateDiceTray(data)
  })
}

export function watchPool2Filters ($content, data) {
  $content.find('.pool2-filters input[type=radio]').on('change', event => {
    event.preventDefault()
    data.pool2Type = event.target.value
    data.updateDiceTray(data)
  })
}

export function prepareCustomRollButton ($content, data) {
  $content.find('.dice-tray-button.roll-button').on('click', event => {
    event.preventDefault()
    const pool1 = describePool('1', data)
    const pool2 = describePool('2', data)

    const poolSize = pool1.size + pool2.size
    let rollTitle = ''
    if (pool2.name !== null) {
      rollTitle = `${pool1.name} + ${pool2.name}`
    } else {
      rollTitle = pool1.name
    }

    rollDice(poolSize, data.selectedCharacter, rollTitle, 0, true)
  })
}

function describePool (poolNumber, data) {
  const poolDesciption = {
    name: null,
    size: 0
  }

  const poolType = data[`pool${poolNumber}Type`]

  if (poolType.toLowerCase() === 'nothing') {
    return poolDesciption
  }

  const actordata = data.selectedCharacter.system
  const poolVars = actordata[poolType][data[`pool${poolNumber}`]]

  poolDesciption.name = game.i18n.localize(poolVars.name)
  poolDesciption.size = poolVars.value

  return poolDesciption
}

function rollDice () {
  console.log("This function doesn't work just yet.")
}

export function prepareRouseShortcut ($content, data) {
  $content.find('.dice-tray-button[data=rollRouse]').on('click', event => {
    event.preventDefault()
    rollDice(1, data.selectedCharacter, game.i18n.localize('WOD5E.VTM.RousingBlood'), 1, true, true, false)
  })
}

export function prepareWillpowerShortcut ($content, data) {
  $content.find('.dice-tray-button[data=rollWill]').on('click', event => {
    event.preventDefault()
    const actor = data.selectedCharacter
    const actorData = actor.system
    const dicepool = (actorData.willpower.max - actorData.willpower.aggravated - actorData.willpower.superficial)
    rollDice(dicepool, actor, game.i18n.localize('WOD5E.Chat.RollingWillpower'), 0, false, false, true)
  })
}

export function prepareFrenzyShortcut ($content, data) {
  $content.find('.dice-tray-button[data=rollFrenzy]').on('click', event => {
    event.preventDefault()
    const actor = data.selectedCharacter
    const actorData = actor.system
    const dicepool = (actorData.willpower.max - actorData.willpower.aggravated - actorData.willpower.superficial) + Math.floor(actorData.humanity.value / 3)
    rollDice(dicepool, actor, `${game.i18n.localize('WOD5E.VTM.ResistingFrenzy')}...`, 0, false)
  })
}

export function prepareHumanityShortcut ($content, data) {
  $content.find('.dice-tray-button[data=rollHumanity]').on('click', event => {
    event.preventDefault()
    const actor = data.selectedCharacter
    const actorData = actor.system
    const dicepool = (10 - actorData.humanity.value - actorData.humanity.stains)
    rollDice(dicepool, actor, game.i18n.localize('WOD5E.VTM.RollingRemorse'), 0, false)
  })
}
