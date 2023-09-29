/* global ActorSheet, game, renderTemplate, Dialog, FormDataExtended, foundry */

/**
 * Extend the base ActorSheet document and put all our base functionality here
 * @extends {ActorSheet}
 */
export class WoDv5Actor extends ActorSheet {
  prepareData () {
    super.prepareData()
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)
    this._setupDotCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return

    // lock button
    html.find('.lock-btn').click(this._onToggleLocked.bind(this))

    // resource dots
    html.find('.resource-value > .resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(this._onDotCounterEmpty.bind(this))

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this))

    // Send Inventory Item to Chat
    html.find('.item-chat').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'))
      renderTemplate('systems/vtm5e/templates/actor/parts/chat-message.html', {
        name: item.name,
        img: item.img,
        description: item.system.description
      }).then(html => {
        ChatMessage.create({
          content: html
        })
      })
    })

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getEmbeddedDocument('Item', li.data('itemId'))
      item.sheet.render(true)
    })

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      this.actor.deleteEmbeddedDocuments('Item', [li.data('itemId')])
      li.slideUp(200, () => this.render(false))
    })

    // Collapsible Features and Powers
    const coll = document.getElementsByClassName('collapsible')
    let i

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener('click', function () {
        this.classList.toggle('active')
        const content = this.parentElement.nextElementSibling
        if (content.style.maxHeight) {
          content.style.maxHeight = null
        } else {
          content.style.maxHeight = content.scrollHeight + 'px'
        }
      })
    }
  }

  _onResourceChange (event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const dataset = element.dataset
    const resource = dataset.resource
    if (dataset.action === 'plus' && !this.locked) {
      actorData.system[resource].max++
    } else if (dataset.action === 'minus' && !this.locked) {
      actorData.system[resource].max = Math.max(actorData.system[resource].max - 1, 0)
    }

    if (actorData.system[resource].aggravated + actorData.system[resource].superficial > actorData.system[resource].max) {
      actorData.system[resource].aggravated = actorData.system[resource].max - actorData.system[resource].superficial
      if (actorData.system[resource].aggravated <= 0) {
        actorData.system[resource].aggravated = 0
        actorData.system[resource].superficial = actorData.system[resource].max
      }
    }
    this.actor.update(actorData)
  }

  _setupDotCounters (html) {
    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
  }

  _onToggleLocked (event) {
    event.preventDefault()
    this.locked = !this.locked
    this._render()
  }

  _onDotCounterChange (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const index = Number(dataset.index)
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-step')

    if (this.locked && !parent.has('.hunger-value').length) return

    if (index < 0 || index > steps.length) {
      return
    }

    steps.removeClass('active')
    steps.each(function (i) {
      if (i <= index) {
        $(this).addClass('active')
      }
    })
    this._assignToActorField(fields, index + 1)
  }

  _onDotCounterEmpty (event) {
    event.preventDefault()
    const element = event.currentTarget
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-empty')

    if (this.locked && !parent.has('.hunger-value').length) return

    steps.removeClass('active')
    this._assignToActorField(fields, 0)
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @protected
   */
  _onItemCreate (event) {
    event.preventDefault()
    const header = event.currentTarget
    // Get the type of item to create.
    const type = header.dataset.type
    // Grab any data associated with this control.
    const data = duplicate(header.dataset)
    if (type === 'specialty') {
      data.skill = 'academics'
    }
    if (type === 'boon') {
      data.boontype = 'Trivial'
    }
    if (type === 'customRoll') {
      data.dice1 = 'strength'
      data.dice2 = 'athletics'
    }
    // Initialize a default name.
    const name = this.getItemDefaultName(type, data)
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system.type

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments('Item', [itemData])
  }

  getItemDefaultName (type, data) {
    if (type === 'feature') {
      return `${game.i18n.localize('VTM5E.' + data.featuretype.capitalize())}`
    }
    if (type === 'power') {
      return `${game.i18n.localize('VTM5E.' + data.discipline.capitalize())}`
    }
    if (type === 'perk') {
      return `${game.i18n.localize('VTM5E.' + data.edge.capitalize())}`
    }
    return `${game.i18n.localize('VTM5E.' + type.capitalize())}`
  }

  // There's gotta be a better way to do this but for the life of me I can't figure it out
  _assignToActorField (fields, value) {
    const actorData = duplicate(this.actor)

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
    this.actor.update(actorData)
  }
}
