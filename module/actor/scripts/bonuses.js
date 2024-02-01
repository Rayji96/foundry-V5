export const _onAddBonus = async function (event) {
  console.log("UUUUUUU")
}

export const _onEditBonus = async function (event, skillData, actor) {
  console.log("UWU")

  // Top-level variables
  const header = event.currentTarget
  const key = header.dataset.bonus

  // Secondary variables
  const bonusData = {
    actor,
    bonus: skillData.skill.bonuses[key]
  }

  // Render selecting a skill/attribute to roll
  const bonusTemplate = 'systems/vtm5e/templates/item/parts/bonus-display.hbs'
  // Render the template
  const bonusContent = await renderTemplate(bonusTemplate, bonusData)
  
  console.log(bonusContent)

  new Dialog(
    {
      title: bonusData.bonus.source,
      content: bonusContent,
      buttons: {
        save: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("WOD5E.Save"),
          callback: async html => {
            let source, value, paths
            let activeWhen = {}
            let updatedBonus = {}

            source = html.find('#source')[0].value
            paths = html.find('#value')[0].value
            value = html.find('#paths')[0].value

            activeWhen['check'] = html.find('#activeWhenCheck')[0].value
            activeWhen['path'] = html.find('#activeWhenPath')[0].value
            activeWhen['value'] = html.find('#activeWhenValue')[0].value

            updatedBonus = {
              source,
              value,
              paths,
              activeWhen
            }

            console.log(updatedBonus)
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      },
      default: 'cancel'
    }
  )
}