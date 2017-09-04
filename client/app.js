/**
 * Client application is run in browser
 */
import Util from '../core/util'
import Actionman from './ui/actionman'
import Itemman from './ui/itemman'
import GraphView from './view/graph/graph'
import ListView from './view/list/list'
import Editor from './view/editor/editor'
import Menu from './ui/main-menu/menu'
import ActionsPanel from './ui/actions-panel/panel'
import './style/index.scss'

const _actions = [
  /* eslint-disable */
  require('./action/select/none').default,
  require('./action/select/invert').default,
  require('./action/select/children').default,
  require('./action/item/create').default,
  require('./action/item/edit').default,
  require('./action/item/save').default,
  require('./action/item/link').default,
  require('./action/item/unlink').default,
  require('./action/item/expand').default,
  require('./action/item/hide').default,
  require('./action/item/remove').default,
  /* eslint-enable */
]

export default class App {
  constructor () {
    this.actionman = new Actionman()
    this.itemman = new Itemman({ app: this })
    this.itemman.on('addSelection', this._addSelection.bind(this))
    this.itemman.on('showEditor', this._showEditor.bind(this))
    this.itemman.on('updateView', this._updateView.bind(this))
    this.itemman.on('saveEditor', this._saveEditor.bind(this))
    this.itemman.on('showList', this._showList.bind(this))

    this.elements = Util.findElements('body', this.selectors)

    const graphViewSet = {
      app: this,
      actionman: this.actionman,
      itemman: this.itemman,
      container: this.elements.viewContainer,
    }
    const listViewSet = {
      actionman: this.actionman,
      container: this.elements.viewContainer,
      hidden: true,
    }
    const editorSet = {
      actionman: this.actionman,
      container: this.elements.viewContainer,
      hidden: true,
    }

    this.graphView = new GraphView(graphViewSet)

    this.linkedList = new ListView(listViewSet)
    this.linkedList.on('show', this._layoutViews.bind(this))
    this.linkedList.on('hide', this._layoutViews.bind(this))
    this.linkedList.on('toogleSize', this._toogleViewsSize.bind(this))

    this.editor = new Editor(editorSet)
    this.editor.on('hide', () => {
      this.actionman.get('itemSave').apply()
    })
    this.editor.on('show', this._layoutViews.bind(this))
    this.editor.on('hide', this._layoutViews.bind(this))
    this.editor.on('toogleSize', this._toogleViewsSize.bind(this))

    this.actionsPanel = new ActionsPanel({
      container: this.elements.sidebar,
      actions: this.actionman.getAll(),
    })
    this.actionman.on('add', this.actionsPanel.addMenuItem.bind(this.actionsPanel))
    this.menu = new Menu({ container: this.elements.header })

    this.actions = _actions
    setTimeout(() => {
      _.each(this.actions, action => this.actionman.set(action, this))
    })
  }

  get selectors () {
    return {
      header: 'header',
      container: '.container',
      sidebar: '.sidebar',
      viewContainer: '.view-container',
    }
  }
  /**
   * Hide secondary views on empty selection
   */
  hideSecondaryViews () {
    this.editor.hide()
    this.linkedList.hide()
  }

  _layoutViews () {
    this.graphView.resize()
  }

  _toogleViewsSize (target) {
    $(target).closest('.view').toggleClass('max min')
  }

  _addSelection (key) {
    this.graphView.selection.add(key)
  }

  _showEditor (args) {
    this.editor.set(args.value, args.key)
    this.editor.setTitle(args.title)
    this.editor.show()
  }

  _updateView (graph, itemsKeys) {
    this.graphView.render(graph, itemsKeys)
  }

  _saveEditor () {
    this.editor.saved()
  }

  _showList (args) {
    this.linkedList.setTitle(args.title)
    this.linkedList.show()
    this.linkedList.render(args.values)
  }
}

window.G = new App()