export const _onAddBonus = async function (event) {
  // Top-level variables
  const actor = this.actor
  const header = event.currentTarget
  const skill = header.dataset.skill

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ["vampire", "werewolf", "hunter", "mortal"]
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

  // Secondary variables
  const bonusData = {
    actor,
    bonus: {
      source: 'New specialty',
      value: 1,
      paths: [`skills.${skill}`],
      displayWhenInactive: false,
      activeWhen: {
        check: 'always'
      }
    }
  }

  // Render the template
  const bonusTemplate = 'systems/vtm5e/templates/item/parts/bonus-display.hbs'
  const bonusContent = await renderTemplate(bonusTemplate, bonusData)

  new Dialog(
    {
      title: bonusData.bonus.source,
      content: bonusContent,
      buttons: {
        add: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("WOD5E.Add"),
          callback: async html => {
            let source, value, displayWhenInactive, rawPaths, arrPaths, cleanPaths
            let paths = []
            let activeWhen = {}
            let newBonus = {}

            source = html.find("[id=bonusSource]").val()
            value = html.find("[id=bonusValue]").val()
            displayWhenInactive = html.find("[id=displayBonusWhenInactive]").is(':checked')

            rawPaths = html.find("[id=bonusPaths]").val()
            arrPaths = rawPaths.split(";")
            cleanPaths = arrPaths.map(function(item) {
              return item.trim()
            })
            paths = cleanPaths.filter(function(item) {
              return item !== ""
            })

            activeWhen['check'] = html.find("[id=activeWhenCheck]").val()
            activeWhen['path'] = html.find("[id=activeWhenPath]").val()
            activeWhen['value'] = html.find("[id=activeWhenValue]").val()

            newBonus = {
              source,
              value,
              paths,
              displayWhenInactive,
              activeWhen
            }

            // Define the existing list of bonuses
            let actorBonuses = actor.system.skills[skill].bonuses || []

            // Add the new bonus to the list
            actorBonuses.push(newBonus)

            // Update the actor
            actor.update({ [`system.skills.${skill}.bonuses`]: actorBonuses })
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      },
      default: 'cancel'
    },
    {
      classes: ['wod5e', `${system}-dialog`, `${system}-sheet`],
    }
  ).render(true)
}

export const _onEditBonus = async function (event, actor, skillData) {
  // Top-level variables
  const header = event.currentTarget
  const key = header.dataset.bonus

  // Secondary variables
  const bonusData = {
    actor,
    bonus: skillData.skill.bonuses[key]
  }

  // Define the actor's gamesystem, defaulting to "mortal" if it's not in the systemsList
  const systemsList = ["vampire", "werewolf", "hunter", "mortal"]
  const system = systemsList.indexOf(actor.system.gamesystem) > -1 ? actor.system.gamesystem : 'mortal'

  // Render the template
  const bonusTemplate = 'systems/vtm5e/templates/item/parts/bonus-display.hbs'
  const bonusContent = await renderTemplate(bonusTemplate, bonusData)

  new Dialog(
    {
      title: bonusData.bonus.source,
      content: bonusContent,
      buttons: {
        save: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("WOD5E.Save"),
          callback: async html => {
            let source, value, displayWhenInactive, rawPaths, arrPaths, cleanPaths
            let paths = []
            let activeWhen = {}

            source = html.find("[id=bonusSource]").val()
            value = html.find("[id=bonusValue]").val()
            displayWhenInactive = html.find("[id=displayBonusWhenInactive]").is(':checked')

            rawPaths = html.find("[id=bonusPaths]").val()
            arrPaths = rawPaths.split(";")
            cleanPaths = arrPaths.map(function(item) {
              return item.trim()
            })
            paths = cleanPaths.filter(function(item) {
              return item !== ""
            })

            activeWhen['check'] = html.find("[id=activeWhenCheck]").val()
            activeWhen['path'] = html.find("[id=activeWhenPath]").val()
            activeWhen['value'] = html.find("[id=activeWhenValue]").val()

            // Define the existing list of bonuses
            let actorBonuses = actor.system.skills[skillData.id].bonuses

            // Update the existing bonus with the new data
            actorBonuses[key] = {
              source,
              value,
              paths,
              displayWhenInactive,
              activeWhen
            }

            // Update the actor
            actor.update({ [`system.skills.${skillData.id}.bonuses`]: actorBonuses })
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      },
      default: 'cancel'
    },
    {
      classes: ['wod5e', `${system}-dialog`, `${system}-sheet`],
    }
  ).render(true)
}