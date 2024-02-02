/* global renderTemplate, Dialog, game */

export const _onAddBonus = async function (event, item) {
  // Secondary variables
  const bonusData = {
    item,
    bonus: {
      source: 'New bonus',
      value: 1,
      paths: [`skills.athletics`],
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
            let itemBonuses = item.system.bonuses || []

            // Add the new bonus to the list
            itemBonuses.push(newBonus)

            // Update the item
            item.update({ [`system.bonuses`]: itemBonuses })
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

export const _onDeleteBonus = async function (event, item) {
  // Top-level variables
  const header = event.currentTarget
  const key = header.dataset.bonus

  // Define the existing list of bonuses
  let itemBonuses = item.system.bonuses || []

  // Remove the bonus from the list
  itemBonuses.splice(key, 1)

  // Update the item
  item.update({ [`system.bonuses`]: itemBonuses })
}

export const _onEditBonus = async function (event, item) {
  // Top-level variables
  const header = event.currentTarget
  const key = header.dataset.bonus

  // Secondary variables
  const bonusData = {
    item,
    bonus: item.system.bonuses[key]
  }

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
            let itemBonuses = item.system.bonuses

            // Update the existing bonus with the new data
            itemBonuses[key] = {
              source,
              value,
              paths,
              displayWhenInactive,
              activeWhen
            }

            // Update the item
            item.update({ [`system.bonuses`]: itemBonuses })
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