/* global game, render, WOD5E */

export class StorytellerMenu extends FormApplication {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			title: 'Storyteller Settings',
			id: 'wod5e-storyteller',
			classes: ['wod5e'],
			template: 'systems/vtm5e/templates/ui/storyteller-menu.hbs',
			width: 500,
			height: 'auto',
			resizable: true,
			closeOnSubmit: true
		})
	}

  /* -------------------------------------------- */

  /** @override */
  async getData () {
    const data = await super.getData()

    // Grab the modifications from the game settings and add them to the application data
    data.attributeModifications = game.settings.get('vtm5e', 'modifiedAttributes')
    data.skillModifications = game.settings.get('vtm5e', 'modifiedSkills')

    return data
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    html.find('.add-mod-button').click(function (event) {
      event.preventDefault()

      const data = event.target.dataset
      const type = data.type

      generatePrompt(type, html)
    })

    html.find('.save-modifications').click(function (event) {
      event.preventDefault()

      let attribute_modifications = []
      let skill_modifications = []

      html.find('.modification-row').each(function () {
        const modification = $(this)[0]
        const id = modification.dataset.id
        const type = modification.dataset.type
        const label = modification.dataset.label

        const rename = $(this).find('.mod-rename')[0].value
        const hidden = $(this).find('.mod-hidden')[0].checked

        if (type === 'attribute') {
          attribute_modifications.push({
            id,
            rename,
            label,
            hidden
          })
        } else if (type === 'skill') {
          skill_modifications.push({
            id,
            rename,
            label,
            hidden
          })
        }
      })

      // Save the new settings
      game.settings.set('vtm5e', 'modifiedAttributes', attribute_modifications)
      game.settings.set('vtm5e', 'modifiedSkills', skill_modifications)
    })
  }
}

async function generatePrompt (type, parentHtml) {
  if (type === 'attribute') {
    const attributes = WOD5E.Attributes.getList()
    let attributes_list = []

    for (const attribute of attributes) {
      // Assign the data to a value
      const [, value] = Object.entries(attribute)[0]
      const id = Object.getOwnPropertyNames(attribute)[0]
      const label = value.label

      attributes_list.push({
        id,
        label
      })
    }

    // Render the dialog
    renderPromptDialog('attribute', attributes_list, game.i18n.localize('WOD5E.Attributes.Label'))
  } else if (type === 'skill') {
    const skills = WOD5E.Skills.getList()
    let skills_list = []

    for (const skill of skills) {
      // Assign the data to a value
      const [, value] = Object.entries(skill)[0]
      const id = Object.getOwnPropertyNames(skill)[0]

      const label = value.label

      skills_list.push({
        id,
        label
      })
    }

    // Render the dialog
    renderPromptDialog('skill', skills_list, game.i18n.localize('WOD5E.Skills.Label'), parentHtml)
  }
}

async function renderPromptDialog (type, list, title, parentHtml) {
  // Render the template
  const template = 'systems/vtm5e/templates/ui/select-dialog.hbs'
  const content = await renderTemplate(template, { list })

  new Dialog(
    {
      title,
      content,
      buttons: {
        add: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('WOD5E.Add'),
          callback: async html => {
            const id = html.find('[id=optionSelect]').val()
            const label = list.filter(item => item.id === id)[0].label

            if (type === 'attribute') {
              let modifiedAttributes = game.settings.get('vtm5e', 'modifiedAttributes')
              let newAttribute = {
                id,
                label,
                rename: '',
                hidden: false
              }
              modifiedAttributes.push(newAttribute)

              game.settings.set('vtm5e', 'modifiedAttributes', modifiedAttributes)
            } else if (type === 'skill') {
              let modifiedSkills = game.settings.get('vtm5e', 'modifiedSkills')
              let newSkill = {
                id,
                label,
                rename: '',
                hidden: false
              }
              modifiedSkills.push(newSkill)

              game.settings.set('vtm5e', 'modifiedSkills', modifiedSkills)
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('WOD5E.Cancel')
        }
      },
      default: 'add'
    }
  ).render(true)
}