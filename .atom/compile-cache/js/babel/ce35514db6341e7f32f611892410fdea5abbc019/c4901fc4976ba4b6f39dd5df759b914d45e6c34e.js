'use babel';

var _bind = Function.prototype.bind;

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x6, _x7, _x8) {
  var _again = true;_function: while (_again) {
    var object = _x6,
        property = _x7,
        receiver = _x8;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x6 = parent;_x7 = property;_x8 = receiver;_again = true;desc = parent = undefined;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
      var callNext = step.bind(null, 'next');var callThrow = step.bind(null, 'throw');function step(key, arg) {
        try {
          var info = gen[key](arg);var value = info.value;
        } catch (error) {
          reject(error);return;
        }if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(callNext, callThrow);
        }
      }callNext();
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _ = require('underscore-plus');
var url = require('url');
var path = require('path');

var _require = require('event-kit');

var Emitter = _require.Emitter;
var Disposable = _require.Disposable;
var CompositeDisposable = _require.CompositeDisposable;

var fs = require('fs-plus');

var _require2 = require('pathwatcher');

var Directory = _require2.Directory;

var Grim = require('grim');
var DefaultDirectorySearcher = require('./default-directory-searcher');
var Dock = require('./dock');
var Model = require('./model');
var StateStore = require('./state-store');
var TextEditor = require('./text-editor');
var Panel = require('./panel');
var PanelContainer = require('./panel-container');
var Task = require('./task');
var WorkspaceCenter = require('./workspace-center');
var WorkspaceElement = require('./workspace-element');

var STOPPED_CHANGING_ACTIVE_PANE_ITEM_DELAY = 100;
var ALL_LOCATIONS = ['center', 'left', 'right', 'bottom'];

// Essential: Represents the state of the user interface for the entire window.
// An instance of this class is available via the `atom.workspace` global.
//
// Interact with this object to open files, be notified of current and future
// editors, and manipulate panes. To add panels, use {Workspace::addTopPanel}
// and friends.
//
// ## Workspace Items
//
// The term "item" refers to anything that can be displayed
// in a pane within the workspace, either in the {WorkspaceCenter} or in one
// of the three {Dock}s. The workspace expects items to conform to the
// following interface:
//
// ### Required Methods
//
// #### `getTitle()`
//
// Returns a {String} containing the title of the item to display on its
// associated tab.
//
// ### Optional Methods
//
// #### `getElement()`
//
// If your item already *is* a DOM element, you do not need to implement this
// method. Otherwise it should return the element you want to display to
// represent this item.
//
// #### `destroy()`
//
// Destroys the item. This will be called when the item is removed from its
// parent pane.
//
// #### `onDidDestroy(callback)`
//
// Called by the workspace so it can be notified when the item is destroyed.
// Must return a {Disposable}.
//
// #### `serialize()`
//
// Serialize the state of the item. Must return an object that can be passed to
// `JSON.stringify`. The state should include a field called `deserializer`,
// which names a deserializer declared in your `package.json`. This method is
// invoked on items when serializing the workspace so they can be restored to
// the same location later.
//
// #### `getURI()`
//
// Returns the URI associated with the item.
//
// #### `getLongTitle()`
//
// Returns a {String} containing a longer version of the title to display in
// places like the window title or on tabs their short titles are ambiguous.
//
// #### `onDidChangeTitle`
//
// Called by the workspace so it can be notified when the item's title changes.
// Must return a {Disposable}.
//
// #### `getIconName()`
//
// Return a {String} with the name of an icon. If this method is defined and
// returns a string, the item's tab element will be rendered with the `icon` and
// `icon-${iconName}` CSS classes.
//
// ### `onDidChangeIcon(callback)`
//
// Called by the workspace so it can be notified when the item's icon changes.
// Must return a {Disposable}.
//
// #### `getDefaultLocation()`
//
// Tells the workspace where your item should be opened in absence of a user
// override. Items can appear in the center or in a dock on the left, right, or
// bottom of the workspace.
//
// Returns a {String} with one of the following values: `'center'`, `'left'`,
// `'right'`, `'bottom'`. If this method is not defined, `'center'` is the
// default.
//
// #### `getAllowedLocations()`
//
// Tells the workspace where this item can be moved. Returns an {Array} of one
// or more of the following values: `'center'`, `'left'`, `'right'`, or
// `'bottom'`.
//
// #### `isPermanentDockItem()`
//
// Tells the workspace whether or not this item can be closed by the user by
// clicking an `x` on its tab. Use of this feature is discouraged unless there's
// a very good reason not to allow users to close your item. Items can be made
// permanent *only* when they are contained in docks. Center pane items can
// always be removed. Note that it is currently still possible to close dock
// items via the `Close Pane` option in the context menu and via Atom APIs, so
// you should still be prepared to handle your dock items being destroyed by the
// user even if you implement this method.
//
// #### `save()`
//
// Saves the item.
//
// #### `saveAs(path)`
//
// Saves the item to the specified path.
//
// #### `getPath()`
//
// Returns the local path associated with this item. This is only used to set
// the initial location of the "save as" dialog.
//
// #### `isModified()`
//
// Returns whether or not the item is modified to reflect modification in the
// UI.
//
// #### `onDidChangeModified()`
//
// Called by the workspace so it can be notified when item's modified status
// changes. Must return a {Disposable}.
//
// #### `copy()`
//
// Create a copy of the item. If defined, the workspace will call this method to
// duplicate the item when splitting panes via certain split commands.
//
// #### `getPreferredHeight()`
//
// If this item is displayed in the bottom {Dock}, called by the workspace when
// initially displaying the dock to set its height. Once the dock has been
// resized by the user, their height will override this value.
//
// Returns a {Number}.
//
// #### `getPreferredWidth()`
//
// If this item is displayed in the left or right {Dock}, called by the
// workspace when initially displaying the dock to set its width. Once the dock
// has been resized by the user, their width will override this value.
//
// Returns a {Number}.
//
// #### `onDidTerminatePendingState(callback)`
//
// If the workspace is configured to use *pending pane items*, the workspace
// will subscribe to this method to terminate the pending state of the item.
// Must return a {Disposable}.
//
// #### `shouldPromptToSave()`
//
// This method indicates whether Atom should prompt the user to save this item
// when the user closes or reloads the window. Returns a boolean.
module.exports = (function (_Model) {
  _inherits(Workspace, _Model);

  function Workspace(params) {
    _classCallCheck(this, Workspace);

    _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).apply(this, arguments);

    this.updateWindowTitle = this.updateWindowTitle.bind(this);
    this.updateDocumentEdited = this.updateDocumentEdited.bind(this);
    this.didDestroyPaneItem = this.didDestroyPaneItem.bind(this);
    this.didChangeActivePaneOnPaneContainer = this.didChangeActivePaneOnPaneContainer.bind(this);
    this.didChangeActivePaneItemOnPaneContainer = this.didChangeActivePaneItemOnPaneContainer.bind(this);
    this.didActivatePaneContainer = this.didActivatePaneContainer.bind(this);

    this.enablePersistence = params.enablePersistence;
    this.packageManager = params.packageManager;
    this.config = params.config;
    this.project = params.project;
    this.notificationManager = params.notificationManager;
    this.viewRegistry = params.viewRegistry;
    this.grammarRegistry = params.grammarRegistry;
    this.applicationDelegate = params.applicationDelegate;
    this.assert = params.assert;
    this.deserializerManager = params.deserializerManager;
    this.textEditorRegistry = params.textEditorRegistry;
    this.styleManager = params.styleManager;
    this.draggingItem = false;
    this.itemLocationStore = new StateStore('AtomPreviousItemLocations', 1);

    this.emitter = new Emitter();
    this.openers = [];
    this.destroyedItemURIs = [];
    this.stoppedChangingActivePaneItemTimeout = null;

    this.defaultDirectorySearcher = new DefaultDirectorySearcher();
    this.consumeServices(this.packageManager);

    this.paneContainers = {
      center: this.createCenter(),
      left: this.createDock('left'),
      right: this.createDock('right'),
      bottom: this.createDock('bottom')
    };
    this.activePaneContainer = this.paneContainers.center;
    this.hasActiveTextEditor = false;

    this.panelContainers = {
      top: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'top' }),
      left: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'left', dock: this.paneContainers.left }),
      right: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'right', dock: this.paneContainers.right }),
      bottom: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'bottom', dock: this.paneContainers.bottom }),
      header: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'header' }),
      footer: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'footer' }),
      modal: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'modal' })
    };

    this.subscribeToEvents();
  }

  _createClass(Workspace, [{
    key: 'getElement',
    value: function getElement() {
      if (!this.element) {
        this.element = new WorkspaceElement().initialize(this, {
          config: this.config,
          project: this.project,
          viewRegistry: this.viewRegistry,
          styleManager: this.styleManager
        });
      }
      return this.element;
    }
  }, {
    key: 'createCenter',
    value: function createCenter() {
      return new WorkspaceCenter({
        config: this.config,
        applicationDelegate: this.applicationDelegate,
        notificationManager: this.notificationManager,
        deserializerManager: this.deserializerManager,
        viewRegistry: this.viewRegistry,
        didActivate: this.didActivatePaneContainer,
        didChangeActivePane: this.didChangeActivePaneOnPaneContainer,
        didChangeActivePaneItem: this.didChangeActivePaneItemOnPaneContainer,
        didDestroyPaneItem: this.didDestroyPaneItem
      });
    }
  }, {
    key: 'createDock',
    value: function createDock(location) {
      return new Dock({
        location: location,
        config: this.config,
        applicationDelegate: this.applicationDelegate,
        deserializerManager: this.deserializerManager,
        notificationManager: this.notificationManager,
        viewRegistry: this.viewRegistry,
        didActivate: this.didActivatePaneContainer,
        didChangeActivePane: this.didChangeActivePaneOnPaneContainer,
        didChangeActivePaneItem: this.didChangeActivePaneItemOnPaneContainer,
        didDestroyPaneItem: this.didDestroyPaneItem
      });
    }
  }, {
    key: 'reset',
    value: function reset(packageManager) {
      this.packageManager = packageManager;
      this.emitter.dispose();
      this.emitter = new Emitter();

      this.paneContainers.center.destroy();
      this.paneContainers.left.destroy();
      this.paneContainers.right.destroy();
      this.paneContainers.bottom.destroy();

      _.values(this.panelContainers).forEach(function (panelContainer) {
        panelContainer.destroy();
      });

      this.paneContainers = {
        center: this.createCenter(),
        left: this.createDock('left'),
        right: this.createDock('right'),
        bottom: this.createDock('bottom')
      };
      this.activePaneContainer = this.paneContainers.center;
      this.hasActiveTextEditor = false;

      this.panelContainers = {
        top: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'top' }),
        left: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'left', dock: this.paneContainers.left }),
        right: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'right', dock: this.paneContainers.right }),
        bottom: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'bottom', dock: this.paneContainers.bottom }),
        header: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'header' }),
        footer: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'footer' }),
        modal: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'modal' })
      };

      this.originalFontSize = null;
      this.openers = [];
      this.destroyedItemURIs = [];
      this.element = null;
      this.consumeServices(this.packageManager);
    }
  }, {
    key: 'subscribeToEvents',
    value: function subscribeToEvents() {
      this.project.onDidChangePaths(this.updateWindowTitle);
      this.subscribeToFontSize();
      this.subscribeToAddedItems();
      this.subscribeToMovedItems();
      this.subscribeToDockToggling();
    }
  }, {
    key: 'consumeServices',
    value: function consumeServices(_ref) {
      var _this = this;

      var serviceHub = _ref.serviceHub;

      this.directorySearchers = [];
      serviceHub.consume('atom.directory-searcher', '^0.1.0', function (provider) {
        return _this.directorySearchers.unshift(provider);
      });
    }

    // Called by the Serializable mixin during serialization.
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'Workspace',
        packagesWithActiveGrammars: this.getPackageNamesWithActiveGrammars(),
        destroyedItemURIs: this.destroyedItemURIs.slice(),
        // Ensure deserializing 1.17 state with pre 1.17 Atom does not error
        // TODO: Remove after 1.17 has been on stable for a while
        paneContainer: { version: 2 },
        paneContainers: {
          center: this.paneContainers.center.serialize(),
          left: this.paneContainers.left.serialize(),
          right: this.paneContainers.right.serialize(),
          bottom: this.paneContainers.bottom.serialize()
        }
      };
    }
  }, {
    key: 'deserialize',
    value: function deserialize(state, deserializerManager) {
      var packagesWithActiveGrammars = state.packagesWithActiveGrammars != null ? state.packagesWithActiveGrammars : [];
      for (var packageName of packagesWithActiveGrammars) {
        var pkg = this.packageManager.getLoadedPackage(packageName);
        if (pkg != null) {
          pkg.loadGrammarsSync();
        }
      }
      if (state.destroyedItemURIs != null) {
        this.destroyedItemURIs = state.destroyedItemURIs;
      }

      if (state.paneContainers) {
        this.paneContainers.center.deserialize(state.paneContainers.center, deserializerManager);
        this.paneContainers.left.deserialize(state.paneContainers.left, deserializerManager);
        this.paneContainers.right.deserialize(state.paneContainers.right, deserializerManager);
        this.paneContainers.bottom.deserialize(state.paneContainers.bottom, deserializerManager);
      } else if (state.paneContainer) {
        // TODO: Remove this fallback once a lot of time has passed since 1.17 was released
        this.paneContainers.center.deserialize(state.paneContainer, deserializerManager);
      }

      this.hasActiveTextEditor = this.getActiveTextEditor() != null;

      this.updateWindowTitle();
    }
  }, {
    key: 'getPackageNamesWithActiveGrammars',
    value: function getPackageNamesWithActiveGrammars() {
      var _this2 = this;

      var packageNames = [];
      var addGrammar = function addGrammar() {
        var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var includedGrammarScopes = _ref2.includedGrammarScopes;
        var packageName = _ref2.packageName;

        if (!packageName) {
          return;
        }
        // Prevent cycles
        if (packageNames.indexOf(packageName) !== -1) {
          return;
        }

        packageNames.push(packageName);
        for (var scopeName of includedGrammarScopes != null ? includedGrammarScopes : []) {
          addGrammar(_this2.grammarRegistry.grammarForScopeName(scopeName));
        }
      };

      var editors = this.getTextEditors();
      for (var editor of editors) {
        addGrammar(editor.getGrammar());
      }

      if (editors.length > 0) {
        for (var grammar of this.grammarRegistry.getGrammars()) {
          if (grammar.injectionSelector) {
            addGrammar(grammar);
          }
        }
      }

      return _.uniq(packageNames);
    }
  }, {
    key: 'didActivatePaneContainer',
    value: function didActivatePaneContainer(paneContainer) {
      if (paneContainer !== this.getActivePaneContainer()) {
        this.activePaneContainer = paneContainer;
        this.didChangeActivePaneItem(this.activePaneContainer.getActivePaneItem());
        this.emitter.emit('did-change-active-pane-container', this.activePaneContainer);
        this.emitter.emit('did-change-active-pane', this.activePaneContainer.getActivePane());
        this.emitter.emit('did-change-active-pane-item', this.activePaneContainer.getActivePaneItem());
      }
    }
  }, {
    key: 'didChangeActivePaneOnPaneContainer',
    value: function didChangeActivePaneOnPaneContainer(paneContainer, pane) {
      if (paneContainer === this.getActivePaneContainer()) {
        this.emitter.emit('did-change-active-pane', pane);
      }
    }
  }, {
    key: 'didChangeActivePaneItemOnPaneContainer',
    value: function didChangeActivePaneItemOnPaneContainer(paneContainer, item) {
      if (paneContainer === this.getActivePaneContainer()) {
        this.didChangeActivePaneItem(item);
        this.emitter.emit('did-change-active-pane-item', item);
      }

      if (paneContainer === this.getCenter()) {
        var hadActiveTextEditor = this.hasActiveTextEditor;
        this.hasActiveTextEditor = item instanceof TextEditor;

        if (this.hasActiveTextEditor || hadActiveTextEditor) {
          var itemValue = this.hasActiveTextEditor ? item : undefined;
          this.emitter.emit('did-change-active-text-editor', itemValue);
        }
      }
    }
  }, {
    key: 'didChangeActivePaneItem',
    value: function didChangeActivePaneItem(item) {
      var _this3 = this;

      this.updateWindowTitle();
      this.updateDocumentEdited();
      if (this.activeItemSubscriptions) this.activeItemSubscriptions.dispose();
      this.activeItemSubscriptions = new CompositeDisposable();

      var modifiedSubscription = undefined,
          titleSubscription = undefined;

      if (item != null && typeof item.onDidChangeTitle === 'function') {
        titleSubscription = item.onDidChangeTitle(this.updateWindowTitle);
      } else if (item != null && typeof item.on === 'function') {
        titleSubscription = item.on('title-changed', this.updateWindowTitle);
        if (titleSubscription == null || typeof titleSubscription.dispose !== 'function') {
          titleSubscription = new Disposable(function () {
            item.off('title-changed', _this3.updateWindowTitle);
          });
        }
      }

      if (item != null && typeof item.onDidChangeModified === 'function') {
        modifiedSubscription = item.onDidChangeModified(this.updateDocumentEdited);
      } else if (item != null && typeof item.on === 'function') {
        modifiedSubscription = item.on('modified-status-changed', this.updateDocumentEdited);
        if (modifiedSubscription == null || typeof modifiedSubscription.dispose !== 'function') {
          modifiedSubscription = new Disposable(function () {
            item.off('modified-status-changed', _this3.updateDocumentEdited);
          });
        }
      }

      if (titleSubscription != null) {
        this.activeItemSubscriptions.add(titleSubscription);
      }
      if (modifiedSubscription != null) {
        this.activeItemSubscriptions.add(modifiedSubscription);
      }

      this.cancelStoppedChangingActivePaneItemTimeout();
      this.stoppedChangingActivePaneItemTimeout = setTimeout(function () {
        _this3.stoppedChangingActivePaneItemTimeout = null;
        _this3.emitter.emit('did-stop-changing-active-pane-item', item);
      }, STOPPED_CHANGING_ACTIVE_PANE_ITEM_DELAY);
    }
  }, {
    key: 'cancelStoppedChangingActivePaneItemTimeout',
    value: function cancelStoppedChangingActivePaneItemTimeout() {
      if (this.stoppedChangingActivePaneItemTimeout != null) {
        clearTimeout(this.stoppedChangingActivePaneItemTimeout);
      }
    }
  }, {
    key: 'setDraggingItem',
    value: function setDraggingItem(draggingItem) {
      _.values(this.paneContainers).forEach(function (dock) {
        dock.setDraggingItem(draggingItem);
      });
    }
  }, {
    key: 'subscribeToAddedItems',
    value: function subscribeToAddedItems() {
      var _this4 = this;

      this.onDidAddPaneItem(function (_ref3) {
        var item = _ref3.item;
        var pane = _ref3.pane;
        var index = _ref3.index;

        if (item instanceof TextEditor) {
          (function () {
            var subscriptions = new CompositeDisposable(_this4.textEditorRegistry.add(item), _this4.textEditorRegistry.maintainGrammar(item), _this4.textEditorRegistry.maintainConfig(item), item.observeGrammar(_this4.handleGrammarUsed.bind(_this4)));
            item.onDidDestroy(function () {
              subscriptions.dispose();
            });
            _this4.emitter.emit('did-add-text-editor', { textEditor: item, pane: pane, index: index });
          })();
        }
      });
    }
  }, {
    key: 'subscribeToDockToggling',
    value: function subscribeToDockToggling() {
      var _this5 = this;

      var docks = [this.getLeftDock(), this.getRightDock(), this.getBottomDock()];
      docks.forEach(function (dock) {
        dock.onDidChangeVisible(function (visible) {
          if (visible) return;
          var activeElement = document.activeElement;

          var dockElement = dock.getElement();
          if (dockElement === activeElement || dockElement.contains(activeElement)) {
            _this5.getCenter().activate();
          }
        });
      });
    }
  }, {
    key: 'subscribeToMovedItems',
    value: function subscribeToMovedItems() {
      var _this6 = this;

      var _loop = function _loop(paneContainer) {
        paneContainer.observePanes(function (pane) {
          pane.onDidAddItem(function (_ref4) {
            var item = _ref4.item;

            if (typeof item.getURI === 'function' && _this6.enablePersistence) {
              var uri = item.getURI();
              if (uri) {
                var _location = paneContainer.getLocation();
                var defaultLocation = undefined;
                if (typeof item.getDefaultLocation === 'function') {
                  defaultLocation = item.getDefaultLocation();
                }
                defaultLocation = defaultLocation || 'center';
                if (_location === defaultLocation) {
                  _this6.itemLocationStore['delete'](item.getURI());
                } else {
                  _this6.itemLocationStore.save(item.getURI(), _location);
                }
              }
            }
          });
        });
      };

      for (var paneContainer of this.getPaneContainers()) {
        _loop(paneContainer);
      }
    }

    // Updates the application's title and proxy icon based on whichever file is
    // open.
  }, {
    key: 'updateWindowTitle',
    value: function updateWindowTitle() {
      var itemPath = undefined,
          itemTitle = undefined,
          projectPath = undefined,
          representedPath = undefined;
      var appName = 'Atom';
      var left = this.project.getPaths();
      var projectPaths = left != null ? left : [];
      var item = this.getActivePaneItem();
      if (item) {
        itemPath = typeof item.getPath === 'function' ? item.getPath() : undefined;
        var longTitle = typeof item.getLongTitle === 'function' ? item.getLongTitle() : undefined;
        itemTitle = longTitle == null ? typeof item.getTitle === 'function' ? item.getTitle() : undefined : longTitle;
        projectPath = _.find(projectPaths, function (projectPath) {
          return itemPath === projectPath || (itemPath != null ? itemPath.startsWith(projectPath + path.sep) : undefined);
        });
      }
      if (itemTitle == null) {
        itemTitle = 'untitled';
      }
      if (projectPath == null) {
        projectPath = itemPath ? path.dirname(itemPath) : projectPaths[0];
      }
      if (projectPath != null) {
        projectPath = fs.tildify(projectPath);
      }

      var titleParts = [];
      if (item != null && projectPath != null) {
        titleParts.push(itemTitle, projectPath);
        representedPath = itemPath != null ? itemPath : projectPath;
      } else if (projectPath != null) {
        titleParts.push(projectPath);
        representedPath = projectPath;
      } else {
        titleParts.push(itemTitle);
        representedPath = '';
      }

      if (process.platform !== 'darwin') {
        titleParts.push(appName);
      }

      document.title = titleParts.join(' — ');
      this.applicationDelegate.setRepresentedFilename(representedPath);
      this.emitter.emit('did-change-window-title');
    }

    // On macOS, fades the application window's proxy icon when the current file
    // has been modified.
  }, {
    key: 'updateDocumentEdited',
    value: function updateDocumentEdited() {
      var activePaneItem = this.getActivePaneItem();
      var modified = activePaneItem != null && typeof activePaneItem.isModified === 'function' ? activePaneItem.isModified() || false : false;
      this.applicationDelegate.setWindowDocumentEdited(modified);
    }

    /*
    Section: Event Subscription
    */

  }, {
    key: 'onDidChangeActivePaneContainer',
    value: function onDidChangeActivePaneContainer(callback) {
      return this.emitter.on('did-change-active-pane-container', callback);
    }

    // Essential: Invoke the given callback with all current and future text
    // editors in the workspace.
    //
    // * `callback` {Function} to be called with current and future text editors.
    //   * `editor` A {TextEditor} that is present in {::getTextEditors} at the time
    //     of subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeTextEditors',
    value: function observeTextEditors(callback) {
      for (var textEditor of this.getTextEditors()) {
        callback(textEditor);
      }
      return this.onDidAddTextEditor(function (_ref5) {
        var textEditor = _ref5.textEditor;
        return callback(textEditor);
      });
    }

    // Essential: Invoke the given callback with all current and future panes items
    // in the workspace.
    //
    // * `callback` {Function} to be called with current and future pane items.
    //   * `item` An item that is present in {::getPaneItems} at the time of
    //      subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observePaneItems',
    value: function observePaneItems(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.observePaneItems(callback);
      })))))();
    }

    // Essential: Invoke the given callback when the active pane item changes.
    //
    // Because observers are invoked synchronously, it's important not to perform
    // any expensive operations via this method. Consider
    // {::onDidStopChangingActivePaneItem} to delay operations until after changes
    // stop occurring.
    //
    // * `callback` {Function} to be called when the active pane item changes.
    //   * `item` The active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActivePaneItem',
    value: function onDidChangeActivePaneItem(callback) {
      return this.emitter.on('did-change-active-pane-item', callback);
    }

    // Essential: Invoke the given callback when the active pane item stops
    // changing.
    //
    // Observers are called asynchronously 100ms after the last active pane item
    // change. Handling changes here rather than in the synchronous
    // {::onDidChangeActivePaneItem} prevents unneeded work if the user is quickly
    // changing or closing tabs and ensures critical UI feedback, like changing the
    // highlighted tab, gets priority over work that can be done asynchronously.
    //
    // * `callback` {Function} to be called when the active pane item stops
    //   changing.
    //   * `item` The active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidStopChangingActivePaneItem',
    value: function onDidStopChangingActivePaneItem(callback) {
      return this.emitter.on('did-stop-changing-active-pane-item', callback);
    }

    // Essential: Invoke the given callback when a text editor becomes the active
    // text editor and when there is no longer an active text editor.
    //
    // * `callback` {Function} to be called when the active text editor changes.
    //   * `editor` The active {TextEditor} or undefined if there is no longer an
    //      active text editor.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActiveTextEditor',
    value: function onDidChangeActiveTextEditor(callback) {
      return this.emitter.on('did-change-active-text-editor', callback);
    }

    // Essential: Invoke the given callback with the current active pane item and
    // with all future active pane items in the workspace.
    //
    // * `callback` {Function} to be called when the active pane item changes.
    //   * `item` The current active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActivePaneItem',
    value: function observeActivePaneItem(callback) {
      callback(this.getActivePaneItem());
      return this.onDidChangeActivePaneItem(callback);
    }

    // Essential: Invoke the given callback with the current active text editor
    // (if any), with all future active text editors, and when there is no longer
    // an active text editor.
    //
    // * `callback` {Function} to be called when the active text editor changes.
    //   * `editor` The active {TextEditor} or undefined if there is not an
    //      active text editor.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActiveTextEditor',
    value: function observeActiveTextEditor(callback) {
      callback(this.getActiveTextEditor());

      return this.onDidChangeActiveTextEditor(callback);
    }

    // Essential: Invoke the given callback whenever an item is opened. Unlike
    // {::onDidAddPaneItem}, observers will be notified for items that are already
    // present in the workspace when they are reopened.
    //
    // * `callback` {Function} to be called whenever an item is opened.
    //   * `event` {Object} with the following keys:
    //     * `uri` {String} representing the opened URI. Could be `undefined`.
    //     * `item` The opened item.
    //     * `pane` The pane in which the item was opened.
    //     * `index` The index of the opened item on its pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidOpen',
    value: function onDidOpen(callback) {
      return this.emitter.on('did-open', callback);
    }

    // Extended: Invoke the given callback when a pane is added to the workspace.
    //
    // * `callback` {Function} to be called panes are added.
    //   * `event` {Object} with the following keys:
    //     * `pane` The added pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddPane',
    value: function onDidAddPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidAddPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback before a pane is destroyed in the
    // workspace.
    //
    // * `callback` {Function} to be called before panes are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `pane` The pane to be destroyed.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onWillDestroyPane',
    value: function onWillDestroyPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onWillDestroyPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane is destroyed in the
    // workspace.
    //
    // * `callback` {Function} to be called panes are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `pane` The destroyed pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidDestroyPane',
    value: function onDidDestroyPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidDestroyPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback with all current and future panes in the
    // workspace.
    //
    // * `callback` {Function} to be called with current and future panes.
    //   * `pane` A {Pane} that is present in {::getPanes} at the time of
    //      subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observePanes',
    value: function observePanes(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.observePanes(callback);
      })))))();
    }

    // Extended: Invoke the given callback when the active pane changes.
    //
    // * `callback` {Function} to be called when the active pane changes.
    //   * `pane` A {Pane} that is the current return value of {::getActivePane}.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActivePane',
    value: function onDidChangeActivePane(callback) {
      return this.emitter.on('did-change-active-pane', callback);
    }

    // Extended: Invoke the given callback with the current active pane and when
    // the active pane changes.
    //
    // * `callback` {Function} to be called with the current and future active#
    //   panes.
    //   * `pane` A {Pane} that is the current return value of {::getActivePane}.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActivePane',
    value: function observeActivePane(callback) {
      callback(this.getActivePane());
      return this.onDidChangeActivePane(callback);
    }

    // Extended: Invoke the given callback when a pane item is added to the
    // workspace.
    //
    // * `callback` {Function} to be called when pane items are added.
    //   * `event` {Object} with the following keys:
    //     * `item` The added pane item.
    //     * `pane` {Pane} containing the added item.
    //     * `index` {Number} indicating the index of the added item in its pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddPaneItem',
    value: function onDidAddPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidAddPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane item is about to be
    // destroyed, before the user is prompted to save it.
    //
    // * `callback` {Function} to be called before pane items are destroyed. If this function returns
    //   a {Promise}, then the item will not be destroyed until the promise resolves.
    //   * `event` {Object} with the following keys:
    //     * `item` The item to be destroyed.
    //     * `pane` {Pane} containing the item to be destroyed.
    //     * `index` {Number} indicating the index of the item to be destroyed in
    //       its pane.
    //
    // Returns a {Disposable} on which `.dispose` can be called to unsubscribe.
  }, {
    key: 'onWillDestroyPaneItem',
    value: function onWillDestroyPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onWillDestroyPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane item is destroyed.
    //
    // * `callback` {Function} to be called when pane items are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `item` The destroyed item.
    //     * `pane` {Pane} containing the destroyed item.
    //     * `index` {Number} indicating the index of the destroyed item in its
    //       pane.
    //
    // Returns a {Disposable} on which `.dispose` can be called to unsubscribe.
  }, {
    key: 'onDidDestroyPaneItem',
    value: function onDidDestroyPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidDestroyPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a text editor is added to the
    // workspace.
    //
    // * `callback` {Function} to be called panes are added.
    //   * `event` {Object} with the following keys:
    //     * `textEditor` {TextEditor} that was added.
    //     * `pane` {Pane} containing the added text editor.
    //     * `index` {Number} indicating the index of the added text editor in its
    //        pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddTextEditor',
    value: function onDidAddTextEditor(callback) {
      return this.emitter.on('did-add-text-editor', callback);
    }
  }, {
    key: 'onDidChangeWindowTitle',
    value: function onDidChangeWindowTitle(callback) {
      return this.emitter.on('did-change-window-title', callback);
    }

    /*
    Section: Opening
    */

    // Essential: Opens the given URI in Atom asynchronously.
    // If the URI is already open, the existing item for that URI will be
    // activated. If no URI is given, or no registered opener can open
    // the URI, a new empty {TextEditor} will be created.
    //
    // * `uri` (optional) A {String} containing a URI.
    // * `options` (optional) {Object}
    //   * `initialLine` A {Number} indicating which row to move the cursor to
    //     initially. Defaults to `0`.
    //   * `initialColumn` A {Number} indicating which column to move the cursor to
    //     initially. Defaults to `0`.
    //   * `split` Either 'left', 'right', 'up' or 'down'.
    //     If 'left', the item will be opened in leftmost pane of the current active pane's row.
    //     If 'right', the item will be opened in the rightmost pane of the current active pane's row. If only one pane exists in the row, a new pane will be created.
    //     If 'up', the item will be opened in topmost pane of the current active pane's column.
    //     If 'down', the item will be opened in the bottommost pane of the current active pane's column. If only one pane exists in the column, a new pane will be created.
    //   * `activatePane` A {Boolean} indicating whether to call {Pane::activate} on
    //     containing pane. Defaults to `true`.
    //   * `activateItem` A {Boolean} indicating whether to call {Pane::activateItem}
    //     on containing pane. Defaults to `true`.
    //   * `pending` A {Boolean} indicating whether or not the item should be opened
    //     in a pending state. Existing pending items in a pane are replaced with
    //     new pending items when they are opened.
    //   * `searchAllPanes` A {Boolean}. If `true`, the workspace will attempt to
    //     activate an existing item for the given URI on any pane.
    //     If `false`, only the active pane will be searched for
    //     an existing item for the same URI. Defaults to `false`.
    //   * `location` (optional) A {String} containing the name of the location
    //     in which this item should be opened (one of "left", "right", "bottom",
    //     or "center"). If omitted, Atom will fall back to the last location in
    //     which a user has placed an item with the same URI or, if this is a new
    //     URI, the default location specified by the item. NOTE: This option
    //     should almost always be omitted to honor user preference.
    //
    // Returns a {Promise} that resolves to the {TextEditor} for the file URI.
  }, {
    key: 'open',
    value: _asyncToGenerator(function* (itemOrURI) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var uri = undefined,
          item = undefined;
      if (typeof itemOrURI === 'string') {
        uri = this.project.resolvePath(itemOrURI);
      } else if (itemOrURI) {
        item = itemOrURI;
        if (typeof item.getURI === 'function') uri = item.getURI();
      }

      if (!atom.config.get('core.allowPendingPaneItems')) {
        options.pending = false;
      }

      // Avoid adding URLs as recent documents to work-around this Spotlight crash:
      // https://github.com/atom/atom/issues/10071
      if (uri && (!url.parse(uri).protocol || process.platform === 'win32')) {
        this.applicationDelegate.addRecentDocument(uri);
      }

      var pane = undefined,
          itemExistsInWorkspace = undefined;

      // Try to find an existing item in the workspace.
      if (item || uri) {
        if (options.pane) {
          pane = options.pane;
        } else if (options.searchAllPanes) {
          pane = item ? this.paneForItem(item) : this.paneForURI(uri);
        } else {
          // If an item with the given URI is already in the workspace, assume
          // that item's pane container is the preferred location for that URI.
          var container = undefined;
          if (uri) container = this.paneContainerForURI(uri);
          if (!container) container = this.getActivePaneContainer();

          // The `split` option affects where we search for the item.
          pane = container.getActivePane();
          switch (options.split) {
            case 'left':
              pane = pane.findLeftmostSibling();
              break;
            case 'right':
              pane = pane.findRightmostSibling();
              break;
            case 'up':
              pane = pane.findTopmostSibling();
              break;
            case 'down':
              pane = pane.findBottommostSibling();
              break;
          }
        }

        if (pane) {
          if (item) {
            itemExistsInWorkspace = pane.getItems().includes(item);
          } else {
            item = pane.itemForURI(uri);
            itemExistsInWorkspace = item != null;
          }
        }
      }

      // If we already have an item at this stage, we won't need to do an async
      // lookup of the URI, so we yield the event loop to ensure this method
      // is consistently asynchronous.
      if (item) yield Promise.resolve();

      if (!itemExistsInWorkspace) {
        item = item || (yield this.createItemForURI(uri, options));
        if (!item) return;

        if (options.pane) {
          pane = options.pane;
        } else {
          var _location2 = options.location;
          if (!_location2 && !options.split && uri && this.enablePersistence) {
            _location2 = yield this.itemLocationStore.load(uri);
          }
          if (!_location2 && typeof item.getDefaultLocation === 'function') {
            _location2 = item.getDefaultLocation();
          }

          var allowedLocations = typeof item.getAllowedLocations === 'function' ? item.getAllowedLocations() : ALL_LOCATIONS;
          _location2 = allowedLocations.includes(_location2) ? _location2 : allowedLocations[0];

          var container = this.paneContainers[_location2] || this.getCenter();
          pane = container.getActivePane();
          switch (options.split) {
            case 'left':
              pane = pane.findLeftmostSibling();
              break;
            case 'right':
              pane = pane.findOrCreateRightmostSibling();
              break;
            case 'up':
              pane = pane.findTopmostSibling();
              break;
            case 'down':
              pane = pane.findOrCreateBottommostSibling();
              break;
          }
        }
      }

      if (!options.pending && pane.getPendingItem() === item) {
        pane.clearPendingItem();
      }

      this.itemOpened(item);

      if (options.activateItem === false) {
        pane.addItem(item, { pending: options.pending });
      } else {
        pane.activateItem(item, { pending: options.pending });
      }

      if (options.activatePane !== false) {
        pane.activate();
      }

      var initialColumn = 0;
      var initialLine = 0;
      if (!Number.isNaN(options.initialLine)) {
        initialLine = options.initialLine;
      }
      if (!Number.isNaN(options.initialColumn)) {
        initialColumn = options.initialColumn;
      }
      if (initialLine >= 0 || initialColumn >= 0) {
        if (typeof item.setCursorBufferPosition === 'function') {
          item.setCursorBufferPosition([initialLine, initialColumn]);
        }
      }

      var index = pane.getActiveItemIndex();
      this.emitter.emit('did-open', { uri: uri, pane: pane, item: item, index: index });
      return item;
    })

    // Essential: Search the workspace for items matching the given URI and hide them.
    //
    // * `itemOrURI` The item to hide or a {String} containing the URI
    //   of the item to hide.
    //
    // Returns a {Boolean} indicating whether any items were found (and hidden).
  }, {
    key: 'hide',
    value: function hide(itemOrURI) {
      var foundItems = false;

      // If any visible item has the given URI, hide it
      for (var container of this.getPaneContainers()) {
        var isCenter = container === this.getCenter();
        if (isCenter || container.isVisible()) {
          for (var pane of container.getPanes()) {
            var activeItem = pane.getActiveItem();
            var foundItem = activeItem != null && (activeItem === itemOrURI || typeof activeItem.getURI === 'function' && activeItem.getURI() === itemOrURI);
            if (foundItem) {
              foundItems = true;
              // We can't really hide the center so we just destroy the item.
              if (isCenter) {
                pane.destroyItem(activeItem);
              } else {
                container.hide();
              }
            }
          }
        }
      }

      return foundItems;
    }

    // Essential: Search the workspace for items matching the given URI. If any are found, hide them.
    // Otherwise, open the URL.
    //
    // * `itemOrURI` (optional) The item to toggle or a {String} containing the URI
    //   of the item to toggle.
    //
    // Returns a Promise that resolves when the item is shown or hidden.
  }, {
    key: 'toggle',
    value: function toggle(itemOrURI) {
      if (this.hide(itemOrURI)) {
        return Promise.resolve();
      } else {
        return this.open(itemOrURI, { searchAllPanes: true });
      }
    }

    // Open Atom's license in the active pane.
  }, {
    key: 'openLicense',
    value: function openLicense() {
      return this.open('/usr/share/licenses/atom/LICENSE.md');
    }

    // Synchronously open the given URI in the active pane. **Only use this method
    // in specs. Calling this in production code will block the UI thread and
    // everyone will be mad at you.**
    //
    // * `uri` A {String} containing a URI.
    // * `options` An optional options {Object}
    //   * `initialLine` A {Number} indicating which row to move the cursor to
    //     initially. Defaults to `0`.
    //   * `initialColumn` A {Number} indicating which column to move the cursor to
    //     initially. Defaults to `0`.
    //   * `activatePane` A {Boolean} indicating whether to call {Pane::activate} on
    //     the containing pane. Defaults to `true`.
    //   * `activateItem` A {Boolean} indicating whether to call {Pane::activateItem}
    //     on containing pane. Defaults to `true`.
  }, {
    key: 'openSync',
    value: function openSync() {
      var uri_ = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var initialLine = options.initialLine;
      var initialColumn = options.initialColumn;

      var activatePane = options.activatePane != null ? options.activatePane : true;
      var activateItem = options.activateItem != null ? options.activateItem : true;

      var uri = this.project.resolvePath(uri_);
      var item = this.getActivePane().itemForURI(uri);
      if (uri && item == null) {
        for (var _opener of this.getOpeners()) {
          item = _opener(uri, options);
          if (item) break;
        }
      }
      if (item == null) {
        item = this.project.openSync(uri, { initialLine: initialLine, initialColumn: initialColumn });
      }

      if (activateItem) {
        this.getActivePane().activateItem(item);
      }
      this.itemOpened(item);
      if (activatePane) {
        this.getActivePane().activate();
      }
      return item;
    }
  }, {
    key: 'openURIInPane',
    value: function openURIInPane(uri, pane) {
      return this.open(uri, { pane: pane });
    }

    // Public: Creates a new item that corresponds to the provided URI.
    //
    // If no URI is given, or no registered opener can open the URI, a new empty
    // {TextEditor} will be created.
    //
    // * `uri` A {String} containing a URI.
    //
    // Returns a {Promise} that resolves to the {TextEditor} (or other item) for the given URI.
  }, {
    key: 'createItemForURI',
    value: function createItemForURI(uri, options) {
      if (uri != null) {
        for (var _opener2 of this.getOpeners()) {
          var item = _opener2(uri, options);
          if (item != null) return Promise.resolve(item);
        }
      }

      try {
        return this.openTextFile(uri, options);
      } catch (error) {
        switch (error.code) {
          case 'CANCELLED':
            return Promise.resolve();
          case 'EACCES':
            this.notificationManager.addWarning('Permission denied \'' + error.path + '\'');
            return Promise.resolve();
          case 'EPERM':
          case 'EBUSY':
          case 'ENXIO':
          case 'EIO':
          case 'ENOTCONN':
          case 'UNKNOWN':
          case 'ECONNRESET':
          case 'EINVAL':
          case 'EMFILE':
          case 'ENOTDIR':
          case 'EAGAIN':
            this.notificationManager.addWarning('Unable to open \'' + (error.path != null ? error.path : uri) + '\'', { detail: error.message });
            return Promise.resolve();
          default:
            throw error;
        }
      }
    }
  }, {
    key: 'openTextFile',
    value: function openTextFile(uri, options) {
      var _this7 = this;

      var filePath = this.project.resolvePath(uri);

      if (filePath != null) {
        try {
          fs.closeSync(fs.openSync(filePath, 'r'));
        } catch (error) {
          // allow ENOENT errors to create an editor for paths that dont exist
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }

      var fileSize = fs.getSizeSync(filePath);

      var largeFileMode = fileSize >= 2 * 1048576; // 2MB
      if (fileSize >= this.config.get('core.warnOnLargeFileLimit') * 1048576) {
        // 20MB by default
        var choice = this.applicationDelegate.confirm({
          message: 'Atom will be unresponsive during the loading of very large files.',
          detailedMessage: 'Do you still want to load this file?',
          buttons: ['Proceed', 'Cancel']
        });
        if (choice === 1) {
          var error = new Error();
          error.code = 'CANCELLED';
          throw error;
        }
      }

      return this.project.bufferForPath(filePath, options).then(function (buffer) {
        return _this7.textEditorRegistry.build(Object.assign({ buffer: buffer, largeFileMode: largeFileMode, autoHeight: false }, options));
      });
    }
  }, {
    key: 'handleGrammarUsed',
    value: function handleGrammarUsed(grammar) {
      if (grammar == null) {
        return;
      }
      return this.packageManager.triggerActivationHook(grammar.packageName + ':grammar-used');
    }

    // Public: Returns a {Boolean} that is `true` if `object` is a `TextEditor`.
    //
    // * `object` An {Object} you want to perform the check against.
  }, {
    key: 'isTextEditor',
    value: function isTextEditor(object) {
      return object instanceof TextEditor;
    }

    // Extended: Create a new text editor.
    //
    // Returns a {TextEditor}.
  }, {
    key: 'buildTextEditor',
    value: function buildTextEditor(params) {
      var editor = this.textEditorRegistry.build(params);
      var subscriptions = new CompositeDisposable(this.textEditorRegistry.maintainGrammar(editor), this.textEditorRegistry.maintainConfig(editor));
      editor.onDidDestroy(function () {
        subscriptions.dispose();
      });
      return editor;
    }

    // Public: Asynchronously reopens the last-closed item's URI if it hasn't already been
    // reopened.
    //
    // Returns a {Promise} that is resolved when the item is opened
  }, {
    key: 'reopenItem',
    value: function reopenItem() {
      var uri = this.destroyedItemURIs.pop();
      if (uri) {
        return this.open(uri);
      } else {
        return Promise.resolve();
      }
    }

    // Public: Register an opener for a uri.
    //
    // When a URI is opened via {Workspace::open}, Atom loops through its registered
    // opener functions until one returns a value for the given uri.
    // Openers are expected to return an object that inherits from HTMLElement or
    // a model which has an associated view in the {ViewRegistry}.
    // A {TextEditor} will be used if no opener returns a value.
    //
    // ## Examples
    //
    // ```coffee
    // atom.workspace.addOpener (uri) ->
    //   if path.extname(uri) is '.toml'
    //     return new TomlEditor(uri)
    // ```
    //
    // * `opener` A {Function} to be called when a path is being opened.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to remove the
    // opener.
    //
    // Note that the opener will be called if and only if the URI is not already open
    // in the current pane. The searchAllPanes flag expands the search from the
    // current pane to all panes. If you wish to open a view of a different type for
    // a file that is already open, consider changing the protocol of the URI. For
    // example, perhaps you wish to preview a rendered version of the file `/foo/bar/baz.quux`
    // that is already open in a text editor view. You could signal this by calling
    // {Workspace::open} on the URI `quux-preview://foo/bar/baz.quux`. Then your opener
    // can check the protocol for quux-preview and only handle those URIs that match.
  }, {
    key: 'addOpener',
    value: function addOpener(opener) {
      var _this8 = this;

      this.openers.push(opener);
      return new Disposable(function () {
        _.remove(_this8.openers, opener);
      });
    }
  }, {
    key: 'getOpeners',
    value: function getOpeners() {
      return this.openers;
    }

    /*
    Section: Pane Items
    */

    // Essential: Get all pane items in the workspace.
    //
    // Returns an {Array} of items.
  }, {
    key: 'getPaneItems',
    value: function getPaneItems() {
      return _.flatten(this.getPaneContainers().map(function (container) {
        return container.getPaneItems();
      }));
    }

    // Essential: Get the active {Pane}'s active item.
    //
    // Returns an pane item {Object}.
  }, {
    key: 'getActivePaneItem',
    value: function getActivePaneItem() {
      return this.getActivePaneContainer().getActivePaneItem();
    }

    // Essential: Get all text editors in the workspace.
    //
    // Returns an {Array} of {TextEditor}s.
  }, {
    key: 'getTextEditors',
    value: function getTextEditors() {
      return this.getPaneItems().filter(function (item) {
        return item instanceof TextEditor;
      });
    }

    // Essential: Get the workspace center's active item if it is a {TextEditor}.
    //
    // Returns a {TextEditor} or `undefined` if the workspace center's current
    // active item is not a {TextEditor}.
  }, {
    key: 'getActiveTextEditor',
    value: function getActiveTextEditor() {
      var activeItem = this.getCenter().getActivePaneItem();
      if (activeItem instanceof TextEditor) {
        return activeItem;
      }
    }

    // Save all pane items.
  }, {
    key: 'saveAll',
    value: function saveAll() {
      this.getPaneContainers().forEach(function (container) {
        container.saveAll();
      });
    }
  }, {
    key: 'confirmClose',
    value: function confirmClose(options) {
      return Promise.all(this.getPaneContainers().map(function (container) {
        return container.confirmClose(options);
      })).then(function (results) {
        return !results.includes(false);
      });
    }

    // Save the active pane item.
    //
    // If the active pane item currently has a URI according to the item's
    // `.getURI` method, calls `.save` on the item. Otherwise
    // {::saveActivePaneItemAs} # will be called instead. This method does nothing
    // if the active item does not implement a `.save` method.
  }, {
    key: 'saveActivePaneItem',
    value: function saveActivePaneItem() {
      return this.getCenter().getActivePane().saveActiveItem();
    }

    // Prompt the user for a path and save the active pane item to it.
    //
    // Opens a native dialog where the user selects a path on disk, then calls
    // `.saveAs` on the item with the selected path. This method does nothing if
    // the active item does not implement a `.saveAs` method.
  }, {
    key: 'saveActivePaneItemAs',
    value: function saveActivePaneItemAs() {
      this.getCenter().getActivePane().saveActiveItemAs();
    }

    // Destroy (close) the active pane item.
    //
    // Removes the active pane item and calls the `.destroy` method on it if one is
    // defined.
  }, {
    key: 'destroyActivePaneItem',
    value: function destroyActivePaneItem() {
      return this.getActivePane().destroyActiveItem();
    }

    /*
    Section: Panes
    */

    // Extended: Get the most recently focused pane container.
    //
    // Returns a {Dock} or the {WorkspaceCenter}.
  }, {
    key: 'getActivePaneContainer',
    value: function getActivePaneContainer() {
      return this.activePaneContainer;
    }

    // Extended: Get all panes in the workspace.
    //
    // Returns an {Array} of {Pane}s.
  }, {
    key: 'getPanes',
    value: function getPanes() {
      return _.flatten(this.getPaneContainers().map(function (container) {
        return container.getPanes();
      }));
    }
  }, {
    key: 'getVisiblePanes',
    value: function getVisiblePanes() {
      return _.flatten(this.getVisiblePaneContainers().map(function (container) {
        return container.getPanes();
      }));
    }

    // Extended: Get the active {Pane}.
    //
    // Returns a {Pane}.
  }, {
    key: 'getActivePane',
    value: function getActivePane() {
      return this.getActivePaneContainer().getActivePane();
    }

    // Extended: Make the next pane active.
  }, {
    key: 'activateNextPane',
    value: function activateNextPane() {
      return this.getActivePaneContainer().activateNextPane();
    }

    // Extended: Make the previous pane active.
  }, {
    key: 'activatePreviousPane',
    value: function activatePreviousPane() {
      return this.getActivePaneContainer().activatePreviousPane();
    }

    // Extended: Get the first pane container that contains an item with the given
    // URI.
    //
    // * `uri` {String} uri
    //
    // Returns a {Dock}, the {WorkspaceCenter}, or `undefined` if no item exists
    // with the given URI.
  }, {
    key: 'paneContainerForURI',
    value: function paneContainerForURI(uri) {
      return this.getPaneContainers().find(function (container) {
        return container.paneForURI(uri);
      });
    }

    // Extended: Get the first pane container that contains the given item.
    //
    // * `item` the Item that the returned pane container must contain.
    //
    // Returns a {Dock}, the {WorkspaceCenter}, or `undefined` if no item exists
    // with the given URI.
  }, {
    key: 'paneContainerForItem',
    value: function paneContainerForItem(uri) {
      return this.getPaneContainers().find(function (container) {
        return container.paneForItem(uri);
      });
    }

    // Extended: Get the first {Pane} that contains an item with the given URI.
    //
    // * `uri` {String} uri
    //
    // Returns a {Pane} or `undefined` if no item exists with the given URI.
  }, {
    key: 'paneForURI',
    value: function paneForURI(uri) {
      for (var _location3 of this.getPaneContainers()) {
        var pane = _location3.paneForURI(uri);
        if (pane != null) {
          return pane;
        }
      }
    }

    // Extended: Get the {Pane} containing the given item.
    //
    // * `item` the Item that the returned pane must contain.
    //
    // Returns a {Pane} or `undefined` if no pane exists for the given item.
  }, {
    key: 'paneForItem',
    value: function paneForItem(item) {
      for (var _location4 of this.getPaneContainers()) {
        var pane = _location4.paneForItem(item);
        if (pane != null) {
          return pane;
        }
      }
    }

    // Destroy (close) the active pane.
  }, {
    key: 'destroyActivePane',
    value: function destroyActivePane() {
      var activePane = this.getActivePane();
      if (activePane != null) {
        activePane.destroy();
      }
    }

    // Close the active center pane item, or the active center pane if it is
    // empty, or the current window if there is only the empty root pane.
  }, {
    key: 'closeActivePaneItemOrEmptyPaneOrWindow',
    value: function closeActivePaneItemOrEmptyPaneOrWindow() {
      if (this.getCenter().getActivePaneItem() != null) {
        this.getCenter().getActivePane().destroyActiveItem();
      } else if (this.getCenter().getPanes().length > 1) {
        this.getCenter().destroyActivePane();
      } else if (this.config.get('core.closeEmptyWindows')) {
        atom.close();
      }
    }

    // Increase the editor font size by 1px.
  }, {
    key: 'increaseFontSize',
    value: function increaseFontSize() {
      this.config.set('editor.fontSize', this.config.get('editor.fontSize') + 1);
    }

    // Decrease the editor font size by 1px.
  }, {
    key: 'decreaseFontSize',
    value: function decreaseFontSize() {
      var fontSize = this.config.get('editor.fontSize');
      if (fontSize > 1) {
        this.config.set('editor.fontSize', fontSize - 1);
      }
    }

    // Restore to the window's original editor font size.
  }, {
    key: 'resetFontSize',
    value: function resetFontSize() {
      if (this.originalFontSize) {
        this.config.set('editor.fontSize', this.originalFontSize);
      }
    }
  }, {
    key: 'subscribeToFontSize',
    value: function subscribeToFontSize() {
      var _this9 = this;

      return this.config.onDidChange('editor.fontSize', function (_ref6) {
        var oldValue = _ref6.oldValue;

        if (_this9.originalFontSize == null) {
          _this9.originalFontSize = oldValue;
        }
      });
    }

    // Removes the item's uri from the list of potential items to reopen.
  }, {
    key: 'itemOpened',
    value: function itemOpened(item) {
      var uri = undefined;
      if (typeof item.getURI === 'function') {
        uri = item.getURI();
      } else if (typeof item.getUri === 'function') {
        uri = item.getUri();
      }

      if (uri != null) {
        _.remove(this.destroyedItemURIs, uri);
      }
    }

    // Adds the destroyed item's uri to the list of items to reopen.
  }, {
    key: 'didDestroyPaneItem',
    value: function didDestroyPaneItem(_ref7) {
      var item = _ref7.item;

      var uri = undefined;
      if (typeof item.getURI === 'function') {
        uri = item.getURI();
      } else if (typeof item.getUri === 'function') {
        uri = item.getUri();
      }

      if (uri != null) {
        this.destroyedItemURIs.push(uri);
      }
    }

    // Called by Model superclass when destroyed
  }, {
    key: 'destroyed',
    value: function destroyed() {
      this.paneContainers.center.destroy();
      this.paneContainers.left.destroy();
      this.paneContainers.right.destroy();
      this.paneContainers.bottom.destroy();
      this.cancelStoppedChangingActivePaneItemTimeout();
      if (this.activeItemSubscriptions != null) {
        this.activeItemSubscriptions.dispose();
      }
    }

    /*
    Section: Pane Locations
    */

    // Essential: Get the {WorkspaceCenter} at the center of the editor window.
  }, {
    key: 'getCenter',
    value: function getCenter() {
      return this.paneContainers.center;
    }

    // Essential: Get the {Dock} to the left of the editor window.
  }, {
    key: 'getLeftDock',
    value: function getLeftDock() {
      return this.paneContainers.left;
    }

    // Essential: Get the {Dock} to the right of the editor window.
  }, {
    key: 'getRightDock',
    value: function getRightDock() {
      return this.paneContainers.right;
    }

    // Essential: Get the {Dock} below the editor window.
  }, {
    key: 'getBottomDock',
    value: function getBottomDock() {
      return this.paneContainers.bottom;
    }
  }, {
    key: 'getPaneContainers',
    value: function getPaneContainers() {
      return [this.paneContainers.center, this.paneContainers.left, this.paneContainers.right, this.paneContainers.bottom];
    }
  }, {
    key: 'getVisiblePaneContainers',
    value: function getVisiblePaneContainers() {
      var center = this.getCenter();
      return atom.workspace.getPaneContainers().filter(function (container) {
        return container === center || container.isVisible();
      });
    }

    /*
    Section: Panels
     Panels are used to display UI related to an editor window. They are placed at one of the four
    edges of the window: left, right, top or bottom. If there are multiple panels on the same window
    edge they are stacked in order of priority: higher priority is closer to the center, lower
    priority towards the edge.
     *Note:* If your panel changes its size throughout its lifetime, consider giving it a higher
    priority, allowing fixed size panels to be closer to the edge. This allows control targets to
    remain more static for easier targeting by users that employ mice or trackpads. (See
    [atom/atom#4834](https://github.com/atom/atom/issues/4834) for discussion.)
    */

    // Essential: Get an {Array} of all the panel items at the bottom of the editor window.
  }, {
    key: 'getBottomPanels',
    value: function getBottomPanels() {
      return this.getPanels('bottom');
    }

    // Essential: Adds a panel item to the bottom of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addBottomPanel',
    value: function addBottomPanel(options) {
      return this.addPanel('bottom', options);
    }

    // Essential: Get an {Array} of all the panel items to the left of the editor window.
  }, {
    key: 'getLeftPanels',
    value: function getLeftPanels() {
      return this.getPanels('left');
    }

    // Essential: Adds a panel item to the left of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addLeftPanel',
    value: function addLeftPanel(options) {
      return this.addPanel('left', options);
    }

    // Essential: Get an {Array} of all the panel items to the right of the editor window.
  }, {
    key: 'getRightPanels',
    value: function getRightPanels() {
      return this.getPanels('right');
    }

    // Essential: Adds a panel item to the right of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addRightPanel',
    value: function addRightPanel(options) {
      return this.addPanel('right', options);
    }

    // Essential: Get an {Array} of all the panel items at the top of the editor window.
  }, {
    key: 'getTopPanels',
    value: function getTopPanels() {
      return this.getPanels('top');
    }

    // Essential: Adds a panel item to the top of the editor window above the tabs.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addTopPanel',
    value: function addTopPanel(options) {
      return this.addPanel('top', options);
    }

    // Essential: Get an {Array} of all the panel items in the header.
  }, {
    key: 'getHeaderPanels',
    value: function getHeaderPanels() {
      return this.getPanels('header');
    }

    // Essential: Adds a panel item to the header.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addHeaderPanel',
    value: function addHeaderPanel(options) {
      return this.addPanel('header', options);
    }

    // Essential: Get an {Array} of all the panel items in the footer.
  }, {
    key: 'getFooterPanels',
    value: function getFooterPanels() {
      return this.getPanels('footer');
    }

    // Essential: Adds a panel item to the footer.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addFooterPanel',
    value: function addFooterPanel(options) {
      return this.addPanel('footer', options);
    }

    // Essential: Get an {Array} of all the modal panel items
  }, {
    key: 'getModalPanels',
    value: function getModalPanels() {
      return this.getPanels('modal');
    }

    // Essential: Adds a panel item as a modal dialog.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be a DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     model option. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //   * `autoFocus` (optional) {Boolean} true if you want modal focus managed for you by Atom.
    //     Atom will automatically focus your modal panel's first tabbable element when the modal
    //     opens and will restore the previously selected element when the modal closes. Atom will
    //     also automatically restrict user tab focus within your modal while it is open.
    //     (default: false)
    //
    // Returns a {Panel}
  }, {
    key: 'addModalPanel',
    value: function addModalPanel() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.addPanel('modal', options);
    }

    // Essential: Returns the {Panel} associated with the given item. Returns
    // `null` when the item has no panel.
    //
    // * `item` Item the panel contains
  }, {
    key: 'panelForItem',
    value: function panelForItem(item) {
      for (var _location5 in this.panelContainers) {
        var container = this.panelContainers[_location5];
        var panel = container.panelForItem(item);
        if (panel != null) {
          return panel;
        }
      }
      return null;
    }
  }, {
    key: 'getPanels',
    value: function getPanels(location) {
      return this.panelContainers[location].getPanels();
    }
  }, {
    key: 'addPanel',
    value: function addPanel(location, options) {
      if (options == null) {
        options = {};
      }
      return this.panelContainers[location].addPanel(new Panel(options, this.viewRegistry));
    }

    /*
    Section: Searching and Replacing
    */

    // Public: Performs a search across all files in the workspace.
    //
    // * `regex` {RegExp} to search with.
    // * `options` (optional) {Object}
    //   * `paths` An {Array} of glob patterns to search within.
    //   * `onPathsSearched` (optional) {Function} to be periodically called
    //     with number of paths searched.
    //   * `leadingContextLineCount` {Number} default `0`; The number of lines
    //      before the matched line to include in the results object.
    //   * `trailingContextLineCount` {Number} default `0`; The number of lines
    //      after the matched line to include in the results object.
    // * `iterator` {Function} callback on each file found.
    //
    // Returns a {Promise} with a `cancel()` method that will cancel all
    // of the underlying searches that were started as part of this scan.
  }, {
    key: 'scan',
    value: function scan(regex, options, iterator) {
      var _this10 = this;

      if (options === undefined) options = {};

      if (_.isFunction(options)) {
        iterator = options;
        options = {};
      }

      // Find a searcher for every Directory in the project. Each searcher that is matched
      // will be associated with an Array of Directory objects in the Map.
      var directoriesForSearcher = new Map();
      for (var directory of this.project.getDirectories()) {
        var searcher = this.defaultDirectorySearcher;
        for (var directorySearcher of this.directorySearchers) {
          if (directorySearcher.canSearchDirectory(directory)) {
            searcher = directorySearcher;
            break;
          }
        }
        var directories = directoriesForSearcher.get(searcher);
        if (!directories) {
          directories = [];
          directoriesForSearcher.set(searcher, directories);
        }
        directories.push(directory);
      }

      // Define the onPathsSearched callback.
      var onPathsSearched = undefined;
      if (_.isFunction(options.onPathsSearched)) {
        (function () {
          // Maintain a map of directories to the number of search results. When notified of a new count,
          // replace the entry in the map and update the total.
          var onPathsSearchedOption = options.onPathsSearched;
          var totalNumberOfPathsSearched = 0;
          var numberOfPathsSearchedForSearcher = new Map();
          onPathsSearched = function (searcher, numberOfPathsSearched) {
            var oldValue = numberOfPathsSearchedForSearcher.get(searcher);
            if (oldValue) {
              totalNumberOfPathsSearched -= oldValue;
            }
            numberOfPathsSearchedForSearcher.set(searcher, numberOfPathsSearched);
            totalNumberOfPathsSearched += numberOfPathsSearched;
            return onPathsSearchedOption(totalNumberOfPathsSearched);
          };
        })();
      } else {
        onPathsSearched = function () {};
      }

      // Kick off all of the searches and unify them into one Promise.
      var allSearches = [];
      directoriesForSearcher.forEach(function (directories, searcher) {
        var searchOptions = {
          inclusions: options.paths || [],
          includeHidden: true,
          excludeVcsIgnores: _this10.config.get('core.excludeVcsIgnoredPaths'),
          exclusions: _this10.config.get('core.ignoredNames'),
          follow: _this10.config.get('core.followSymlinks'),
          leadingContextLineCount: options.leadingContextLineCount || 0,
          trailingContextLineCount: options.trailingContextLineCount || 0,
          didMatch: function didMatch(result) {
            if (!_this10.project.isPathModified(result.filePath)) {
              return iterator(result);
            }
          },
          didError: function didError(error) {
            return iterator(null, error);
          },
          didSearchPaths: function didSearchPaths(count) {
            return onPathsSearched(searcher, count);
          }
        };
        var directorySearcher = searcher.search(directories, regex, searchOptions);
        allSearches.push(directorySearcher);
      });
      var searchPromise = Promise.all(allSearches);

      for (var buffer of this.project.getBuffers()) {
        if (buffer.isModified()) {
          var filePath = buffer.getPath();
          if (!this.project.contains(filePath)) {
            continue;
          }
          var matches = [];
          buffer.scan(regex, function (match) {
            return matches.push(match);
          });
          if (matches.length > 0) {
            iterator({ filePath: filePath, matches: matches });
          }
        }
      }

      // Make sure the Promise that is returned to the client is cancelable. To be consistent
      // with the existing behavior, instead of cancel() rejecting the promise, it should
      // resolve it with the special value 'cancelled'. At least the built-in find-and-replace
      // package relies on this behavior.
      var isCancelled = false;
      var cancellablePromise = new Promise(function (resolve, reject) {
        var onSuccess = function onSuccess() {
          if (isCancelled) {
            resolve('cancelled');
          } else {
            resolve(null);
          }
        };

        var onFailure = function onFailure() {
          for (var promise of allSearches) {
            promise.cancel();
          }
          reject();
        };

        searchPromise.then(onSuccess, onFailure);
      });
      cancellablePromise.cancel = function () {
        isCancelled = true;
        // Note that cancelling all of the members of allSearches will cause all of the searches
        // to resolve, which causes searchPromise to resolve, which is ultimately what causes
        // cancellablePromise to resolve.
        allSearches.map(function (promise) {
          return promise.cancel();
        });
      };

      // Although this method claims to return a `Promise`, the `ResultsPaneView.onSearch()`
      // method in the find-and-replace package expects the object returned by this method to have a
      // `done()` method. Include a done() method until find-and-replace can be updated.
      cancellablePromise.done = function (onSuccessOrFailure) {
        cancellablePromise.then(onSuccessOrFailure, onSuccessOrFailure);
      };
      return cancellablePromise;
    }

    // Public: Performs a replace across all the specified files in the project.
    //
    // * `regex` A {RegExp} to search with.
    // * `replacementText` {String} to replace all matches of regex with.
    // * `filePaths` An {Array} of file path strings to run the replace on.
    // * `iterator` A {Function} callback on each file with replacements:
    //   * `options` {Object} with keys `filePath` and `replacements`.
    //
    // Returns a {Promise}.
  }, {
    key: 'replace',
    value: function replace(regex, replacementText, filePaths, iterator) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        var buffer = undefined;
        var openPaths = _this11.project.getBuffers().map(function (buffer) {
          return buffer.getPath();
        });
        var outOfProcessPaths = _.difference(filePaths, openPaths);

        var inProcessFinished = !openPaths.length;
        var outOfProcessFinished = !outOfProcessPaths.length;
        var checkFinished = function checkFinished() {
          if (outOfProcessFinished && inProcessFinished) {
            resolve();
          }
        };

        if (!outOfProcessFinished.length) {
          var flags = 'g';
          if (regex.multiline) {
            flags += 'm';
          }
          if (regex.ignoreCase) {
            flags += 'i';
          }

          var task = Task.once(require.resolve('./replace-handler'), outOfProcessPaths, regex.source, flags, replacementText, function () {
            outOfProcessFinished = true;
            checkFinished();
          });

          task.on('replace:path-replaced', iterator);
          task.on('replace:file-error', function (error) {
            iterator(null, error);
          });
        }

        for (buffer of _this11.project.getBuffers()) {
          if (!filePaths.includes(buffer.getPath())) {
            continue;
          }
          var replacements = buffer.replace(regex, replacementText, iterator);
          if (replacements) {
            iterator({ filePath: buffer.getPath(), replacements: replacements });
          }
        }

        inProcessFinished = true;
        checkFinished();
      });
    }
  }, {
    key: 'checkoutHeadRevision',
    value: function checkoutHeadRevision(editor) {
      var _this12 = this;

      if (editor.getPath()) {
        var checkoutHead = function checkoutHead() {
          return _this12.project.repositoryForDirectory(new Directory(editor.getDirectoryPath())).then(function (repository) {
            return repository && repository.checkoutHeadForEditor(editor);
          });
        };

        if (this.config.get('editor.confirmCheckoutHeadRevision')) {
          this.applicationDelegate.confirm({
            message: 'Confirm Checkout HEAD Revision',
            detailedMessage: 'Are you sure you want to discard all changes to "' + editor.getFileName() + '" since the last Git commit?',
            buttons: {
              OK: checkoutHead,
              Cancel: null
            }
          });
        } else {
          return checkoutHead();
        }
      } else {
        return Promise.resolve(false);
      }
    }
  }, {
    key: 'paneContainer',
    get: function get() {
      Grim.deprecate('`atom.workspace.paneContainer` has always been private, but it is now gone. Please use `atom.workspace.getCenter()` instead and consult the workspace API docs for public methods.');
      return this.paneContainers.center.paneContainer;
    }
  }]);

  return Workspace;
})(Model);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9idWlsZC9hdG9tL3NyYy9hdG9tLTEuMjMuMy9vdXQvYXBwL3NyYy93b3Jrc3BhY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOztBQUVYLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDOztBQUVwQyxJQUFJLFlBQVksR0FBRyxDQUFDLFlBQVk7QUFBRSxXQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFBRSxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUFFLFVBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsQUFBQyxVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxBQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FBRTtHQUFFLEFBQUMsT0FBTyxVQUFVLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFO0FBQUUsUUFBSSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxBQUFDLElBQUksV0FBVyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxBQUFDLE9BQU8sV0FBVyxDQUFDO0dBQUUsQ0FBQztDQUFFLENBQUEsRUFBRyxDQUFDOztBQUV0akIsSUFBSSxJQUFJLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFBRSxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQUFBQyxTQUFTLEVBQUUsT0FBTyxNQUFNLEVBQUU7QUFBRSxRQUFJLE1BQU0sR0FBRyxHQUFHO1FBQUUsUUFBUSxHQUFHLEdBQUc7UUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLEFBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxBQUFDLElBQUksTUFBTSxLQUFLLElBQUksRUFBRSxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxBQUFDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQUFBQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBRSxVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQUMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQUUsZUFBTyxTQUFTLENBQUM7T0FBRSxNQUFNO0FBQUUsV0FBRyxHQUFHLE1BQU0sQ0FBQyxBQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQUFBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEFBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDLEFBQUMsU0FBUyxTQUFTLENBQUM7T0FBRTtLQUFFLE1BQU0sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQUUsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQUUsTUFBTTtBQUFFLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFBRSxlQUFPLFNBQVMsQ0FBQztPQUFFLEFBQUMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQUU7R0FBRTtDQUFFLENBQUM7O0FBRXJwQixTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRTtBQUFFLE1BQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUFFLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxPQUFPLElBQUksQ0FBQztHQUFFLE1BQU07QUFBRSxXQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRTtDQUFFOztBQUUvTCxTQUFTLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtBQUFFLFNBQU8sWUFBWTtBQUFFLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEFBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFBRSxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxBQUFDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEFBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUFFLFlBQUk7QUFBRSxjQUFJLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQUFBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQUUsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUFFLGdCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBQyxPQUFPO1NBQUUsQUFBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFBRSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQUUsTUFBTTtBQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxD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Q0FBQyxDQUFBO1dBQUEsQ0FBQyxDQUFBO1NBQzlFLENBQUE7O0FBRUQsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFO0FBQ3pELGNBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7QUFDL0IsbUJBQU8sRUFBRSxnQ0FBZ0M7QUFDekMsMkJBQWUsRUFBQSxtREFBQSxHQUFzRCxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUEsOEJBQThCO0FBQ3ZILG1CQUFPLEVBQUU7QUFDUCxnQkFBRSxFQUFFLFlBQVk7QUFDaEIsb0JBQU0sRUFBRSxJQUFJO2FBQ2I7V0FDRixDQUFDLENBQUE7U0FDSCxNQUFNO0FBQ0wsaUJBQU8sWUFBWSxFQUFFLENBQUE7U0FDdEI7T0FDRixNQUFNO0FBQ0wsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzlCO0tBQ0Y7R0FpVEEsRUFBRTtBQUNELE9BQUcsRUFBRSxlQUFlO0FBQ3BCLE9BQUcsRUF2aUVhLFNBQUEsR0FBQSxHQUFHO0FBQ25CLFVBQUksQ0FBQyxTQUFTLENBQUMsb0xBQW9MLENBQUMsQ0FBQTtBQUNwTSxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQTtLQUNoRDtHQXdpRUEsQ0FBQyxDQUFDLENBQUM7O0FBRUosU0FybUVxQixTQUFTLENBQUE7Q0FzbUUvQixDQUFBLENBdG1Fd0MsS0FBSyxDQTZ5RDdDLENBQUEiLCJmaWxlIjoiL2J1aWxkL2F0b20vc3JjL2F0b20tMS4yMy4zL291dC9hcHAvc3JjL3dvcmtzcGFjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKVxuY29uc3QgdXJsID0gcmVxdWlyZSgndXJsJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IHtFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2V2ZW50LWtpdCcpXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKVxuY29uc3Qge0RpcmVjdG9yeX0gPSByZXF1aXJlKCdwYXRod2F0Y2hlcicpXG5jb25zdCBHcmltID0gcmVxdWlyZSgnZ3JpbScpXG5jb25zdCBEZWZhdWx0RGlyZWN0b3J5U2VhcmNoZXIgPSByZXF1aXJlKCcuL2RlZmF1bHQtZGlyZWN0b3J5LXNlYXJjaGVyJylcbmNvbnN0IERvY2sgPSByZXF1aXJlKCcuL2RvY2snKVxuY29uc3QgTW9kZWwgPSByZXF1aXJlKCcuL21vZGVsJylcbmNvbnN0IFN0YXRlU3RvcmUgPSByZXF1aXJlKCcuL3N0YXRlLXN0b3JlJylcbmNvbnN0IFRleHRFZGl0b3IgPSByZXF1aXJlKCcuL3RleHQtZWRpdG9yJylcbmNvbnN0IFBhbmVsID0gcmVxdWlyZSgnLi9wYW5lbCcpXG5jb25zdCBQYW5lbENvbnRhaW5lciA9IHJlcXVpcmUoJy4vcGFuZWwtY29udGFpbmVyJylcbmNvbnN0IFRhc2sgPSByZXF1aXJlKCcuL3Rhc2snKVxuY29uc3QgV29ya3NwYWNlQ2VudGVyID0gcmVxdWlyZSgnLi93b3Jrc3BhY2UtY2VudGVyJylcbmNvbnN0IFdvcmtzcGFjZUVsZW1lbnQgPSByZXF1aXJlKCcuL3dvcmtzcGFjZS1lbGVtZW50JylcblxuY29uc3QgU1RPUFBFRF9DSEFOR0lOR19BQ1RJVkVfUEFORV9JVEVNX0RFTEFZID0gMTAwXG5jb25zdCBBTExfTE9DQVRJT05TID0gWydjZW50ZXInLCAnbGVmdCcsICdyaWdodCcsICdib3R0b20nXVxuXG4vLyBFc3NlbnRpYWw6IFJlcHJlc2VudHMgdGhlIHN0YXRlIG9mIHRoZSB1c2VyIGludGVyZmFjZSBmb3IgdGhlIGVudGlyZSB3aW5kb3cuXG4vLyBBbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIGlzIGF2YWlsYWJsZSB2aWEgdGhlIGBhdG9tLndvcmtzcGFjZWAgZ2xvYmFsLlxuLy9cbi8vIEludGVyYWN0IHdpdGggdGhpcyBvYmplY3QgdG8gb3BlbiBmaWxlcywgYmUgbm90aWZpZWQgb2YgY3VycmVudCBhbmQgZnV0dXJlXG4vLyBlZGl0b3JzLCBhbmQgbWFuaXB1bGF0ZSBwYW5lcy4gVG8gYWRkIHBhbmVscywgdXNlIHtXb3Jrc3BhY2U6OmFkZFRvcFBhbmVsfVxuLy8gYW5kIGZyaWVuZHMuXG4vL1xuLy8gIyMgV29ya3NwYWNlIEl0ZW1zXG4vL1xuLy8gVGhlIHRlcm0gXCJpdGVtXCIgcmVmZXJzIHRvIGFueXRoaW5nIHRoYXQgY2FuIGJlIGRpc3BsYXllZFxuLy8gaW4gYSBwYW5lIHdpdGhpbiB0aGUgd29ya3NwYWNlLCBlaXRoZXIgaW4gdGhlIHtXb3Jrc3BhY2VDZW50ZXJ9IG9yIGluIG9uZVxuLy8gb2YgdGhlIHRocmVlIHtEb2NrfXMuIFRoZSB3b3Jrc3BhY2UgZXhwZWN0cyBpdGVtcyB0byBjb25mb3JtIHRvIHRoZVxuLy8gZm9sbG93aW5nIGludGVyZmFjZTpcbi8vXG4vLyAjIyMgUmVxdWlyZWQgTWV0aG9kc1xuLy9cbi8vICMjIyMgYGdldFRpdGxlKClgXG4vL1xuLy8gUmV0dXJucyBhIHtTdHJpbmd9IGNvbnRhaW5pbmcgdGhlIHRpdGxlIG9mIHRoZSBpdGVtIHRvIGRpc3BsYXkgb24gaXRzXG4vLyBhc3NvY2lhdGVkIHRhYi5cbi8vXG4vLyAjIyMgT3B0aW9uYWwgTWV0aG9kc1xuLy9cbi8vICMjIyMgYGdldEVsZW1lbnQoKWBcbi8vXG4vLyBJZiB5b3VyIGl0ZW0gYWxyZWFkeSAqaXMqIGEgRE9NIGVsZW1lbnQsIHlvdSBkbyBub3QgbmVlZCB0byBpbXBsZW1lbnQgdGhpc1xuLy8gbWV0aG9kLiBPdGhlcndpc2UgaXQgc2hvdWxkIHJldHVybiB0aGUgZWxlbWVudCB5b3Ugd2FudCB0byBkaXNwbGF5IHRvXG4vLyByZXByZXNlbnQgdGhpcyBpdGVtLlxuLy9cbi8vICMjIyMgYGRlc3Ryb3koKWBcbi8vXG4vLyBEZXN0cm95cyB0aGUgaXRlbS4gVGhpcyB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBpdGVtIGlzIHJlbW92ZWQgZnJvbSBpdHNcbi8vIHBhcmVudCBwYW5lLlxuLy9cbi8vICMjIyMgYG9uRGlkRGVzdHJveShjYWxsYmFjaylgXG4vL1xuLy8gQ2FsbGVkIGJ5IHRoZSB3b3Jrc3BhY2Ugc28gaXQgY2FuIGJlIG5vdGlmaWVkIHdoZW4gdGhlIGl0ZW0gaXMgZGVzdHJveWVkLlxuLy8gTXVzdCByZXR1cm4gYSB7RGlzcG9zYWJsZX0uXG4vL1xuLy8gIyMjIyBgc2VyaWFsaXplKClgXG4vL1xuLy8gU2VyaWFsaXplIHRoZSBzdGF0ZSBvZiB0aGUgaXRlbS4gTXVzdCByZXR1cm4gYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHBhc3NlZCB0b1xuLy8gYEpTT04uc3RyaW5naWZ5YC4gVGhlIHN0YXRlIHNob3VsZCBpbmNsdWRlIGEgZmllbGQgY2FsbGVkIGBkZXNlcmlhbGl6ZXJgLFxuLy8gd2hpY2ggbmFtZXMgYSBkZXNlcmlhbGl6ZXIgZGVjbGFyZWQgaW4geW91ciBgcGFja2FnZS5qc29uYC4gVGhpcyBtZXRob2QgaXNcbi8vIGludm9rZWQgb24gaXRlbXMgd2hlbiBzZXJpYWxpemluZyB0aGUgd29ya3NwYWNlIHNvIHRoZXkgY2FuIGJlIHJlc3RvcmVkIHRvXG4vLyB0aGUgc2FtZSBsb2NhdGlvbiBsYXRlci5cbi8vXG4vLyAjIyMjIGBnZXRVUkkoKWBcbi8vXG4vLyBSZXR1cm5zIHRoZSBVUkkgYXNzb2NpYXRlZCB3aXRoIHRoZSBpdGVtLlxuLy9cbi8vICMjIyMgYGdldExvbmdUaXRsZSgpYFxuLy9cbi8vIFJldHVybnMgYSB7U3RyaW5nfSBjb250YWluaW5nIGEgbG9uZ2VyIHZlcnNpb24gb2YgdGhlIHRpdGxlIHRvIGRpc3BsYXkgaW5cbi8vIHBsYWNlcyBsaWtlIHRoZSB3aW5kb3cgdGl0bGUgb3Igb24gdGFicyB0aGVpciBzaG9ydCB0aXRsZXMgYXJlIGFtYmlndW91cy5cbi8vXG4vLyAjIyMjIGBvbkRpZENoYW5nZVRpdGxlYFxuLy9cbi8vIENhbGxlZCBieSB0aGUgd29ya3NwYWNlIHNvIGl0IGNhbiBiZSBub3RpZmllZCB3aGVuIHRoZSBpdGVtJ3MgdGl0bGUgY2hhbmdlcy5cbi8vIE11c3QgcmV0dXJuIGEge0Rpc3Bvc2FibGV9LlxuLy9cbi8vICMjIyMgYGdldEljb25OYW1lKClgXG4vL1xuLy8gUmV0dXJuIGEge1N0cmluZ30gd2l0aCB0aGUgbmFtZSBvZiBhbiBpY29uLiBJZiB0aGlzIG1ldGhvZCBpcyBkZWZpbmVkIGFuZFxuLy8gcmV0dXJucyBhIHN0cmluZywgdGhlIGl0ZW0ncyB0YWIgZWxlbWVudCB3aWxsIGJlIHJlbmRlcmVkIHdpdGggdGhlIGBpY29uYCBhbmRcbi8vIGBpY29uLSR7aWNvbk5hbWV9YCBDU1MgY2xhc3Nlcy5cbi8vXG4vLyAjIyMgYG9uRGlkQ2hhbmdlSWNvbihjYWxsYmFjaylgXG4vL1xuLy8gQ2FsbGVkIGJ5IHRoZSB3b3Jrc3BhY2Ugc28gaXQgY2FuIGJlIG5vdGlmaWVkIHdoZW4gdGhlIGl0ZW0ncyBpY29uIGNoYW5nZXMuXG4vLyBNdXN0IHJldHVybiBhIHtEaXNwb3NhYmxlfS5cbi8vXG4vLyAjIyMjIGBnZXREZWZhdWx0TG9jYXRpb24oKWBcbi8vXG4vLyBUZWxscyB0aGUgd29ya3NwYWNlIHdoZXJlIHlvdXIgaXRlbSBzaG91bGQgYmUgb3BlbmVkIGluIGFic2VuY2Ugb2YgYSB1c2VyXG4vLyBvdmVycmlkZS4gSXRlbXMgY2FuIGFwcGVhciBpbiB0aGUgY2VudGVyIG9yIGluIGEgZG9jayBvbiB0aGUgbGVmdCwgcmlnaHQsIG9yXG4vLyBib3R0b20gb2YgdGhlIHdvcmtzcGFjZS5cbi8vXG4vLyBSZXR1cm5zIGEge1N0cmluZ30gd2l0aCBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXM6IGAnY2VudGVyJ2AsIGAnbGVmdCdgLFxuLy8gYCdyaWdodCdgLCBgJ2JvdHRvbSdgLiBJZiB0aGlzIG1ldGhvZCBpcyBub3QgZGVmaW5lZCwgYCdjZW50ZXInYCBpcyB0aGVcbi8vIGRlZmF1bHQuXG4vL1xuLy8gIyMjIyBgZ2V0QWxsb3dlZExvY2F0aW9ucygpYFxuLy9cbi8vIFRlbGxzIHRoZSB3b3Jrc3BhY2Ugd2hlcmUgdGhpcyBpdGVtIGNhbiBiZSBtb3ZlZC4gUmV0dXJucyBhbiB7QXJyYXl9IG9mIG9uZVxuLy8gb3IgbW9yZSBvZiB0aGUgZm9sbG93aW5nIHZhbHVlczogYCdjZW50ZXInYCwgYCdsZWZ0J2AsIGAncmlnaHQnYCwgb3Jcbi8vIGAnYm90dG9tJ2AuXG4vL1xuLy8gIyMjIyBgaXNQZXJtYW5lbnREb2NrSXRlbSgpYFxuLy9cbi8vIFRlbGxzIHRoZSB3b3Jrc3BhY2Ugd2hldGhlciBvciBub3QgdGhpcyBpdGVtIGNhbiBiZSBjbG9zZWQgYnkgdGhlIHVzZXIgYnlcbi8vIGNsaWNraW5nIGFuIGB4YCBvbiBpdHMgdGFiLiBVc2Ugb2YgdGhpcyBmZWF0dXJlIGlzIGRpc2NvdXJhZ2VkIHVubGVzcyB0aGVyZSdzXG4vLyBhIHZlcnkgZ29vZCByZWFzb24gbm90IHRvIGFsbG93IHVzZXJzIHRvIGNsb3NlIHlvdXIgaXRlbS4gSXRlbXMgY2FuIGJlIG1hZGVcbi8vIHBlcm1hbmVudCAqb25seSogd2hlbiB0aGV5IGFyZSBjb250YWluZWQgaW4gZG9ja3MuIENlbnRlciBwYW5lIGl0ZW1zIGNhblxuLy8gYWx3YXlzIGJlIHJlbW92ZWQuIE5vdGUgdGhhdCBpdCBpcyBjdXJyZW50bHkgc3RpbGwgcG9zc2libGUgdG8gY2xvc2UgZG9ja1xuLy8gaXRlbXMgdmlhIHRoZSBgQ2xvc2UgUGFuZWAgb3B0aW9uIGluIHRoZSBjb250ZXh0IG1lbnUgYW5kIHZpYSBBdG9tIEFQSXMsIHNvXG4vLyB5b3Ugc2hvdWxkIHN0aWxsIGJlIHByZXBhcmVkIHRvIGhhbmRsZSB5b3VyIGRvY2sgaXRlbXMgYmVpbmcgZGVzdHJveWVkIGJ5IHRoZVxuLy8gdXNlciBldmVuIGlmIHlvdSBpbXBsZW1lbnQgdGhpcyBtZXRob2QuXG4vL1xuLy8gIyMjIyBgc2F2ZSgpYFxuLy9cbi8vIFNhdmVzIHRoZSBpdGVtLlxuLy9cbi8vICMjIyMgYHNhdmVBcyhwYXRoKWBcbi8vXG4vLyBTYXZlcyB0aGUgaXRlbSB0byB0aGUgc3BlY2lmaWVkIHBhdGguXG4vL1xuLy8gIyMjIyBgZ2V0UGF0aCgpYFxuLy9cbi8vIFJldHVybnMgdGhlIGxvY2FsIHBhdGggYXNzb2NpYXRlZCB3aXRoIHRoaXMgaXRlbS4gVGhpcyBpcyBvbmx5IHVzZWQgdG8gc2V0XG4vLyB0aGUgaW5pdGlhbCBsb2NhdGlvbiBvZiB0aGUgXCJzYXZlIGFzXCIgZGlhbG9nLlxuLy9cbi8vICMjIyMgYGlzTW9kaWZpZWQoKWBcbi8vXG4vLyBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIGlzIG1vZGlmaWVkIHRvIHJlZmxlY3QgbW9kaWZpY2F0aW9uIGluIHRoZVxuLy8gVUkuXG4vL1xuLy8gIyMjIyBgb25EaWRDaGFuZ2VNb2RpZmllZCgpYFxuLy9cbi8vIENhbGxlZCBieSB0aGUgd29ya3NwYWNlIHNvIGl0IGNhbiBiZSBub3RpZmllZCB3aGVuIGl0ZW0ncyBtb2RpZmllZCBzdGF0dXNcbi8vIGNoYW5nZXMuIE11c3QgcmV0dXJuIGEge0Rpc3Bvc2FibGV9LlxuLy9cbi8vICMjIyMgYGNvcHkoKWBcbi8vXG4vLyBDcmVhdGUgYSBjb3B5IG9mIHRoZSBpdGVtLiBJZiBkZWZpbmVkLCB0aGUgd29ya3NwYWNlIHdpbGwgY2FsbCB0aGlzIG1ldGhvZCB0b1xuLy8gZHVwbGljYXRlIHRoZSBpdGVtIHdoZW4gc3BsaXR0aW5nIHBhbmVzIHZpYSBjZXJ0YWluIHNwbGl0IGNvbW1hbmRzLlxuLy9cbi8vICMjIyMgYGdldFByZWZlcnJlZEhlaWdodCgpYFxuLy9cbi8vIElmIHRoaXMgaXRlbSBpcyBkaXNwbGF5ZWQgaW4gdGhlIGJvdHRvbSB7RG9ja30sIGNhbGxlZCBieSB0aGUgd29ya3NwYWNlIHdoZW5cbi8vIGluaXRpYWxseSBkaXNwbGF5aW5nIHRoZSBkb2NrIHRvIHNldCBpdHMgaGVpZ2h0LiBPbmNlIHRoZSBkb2NrIGhhcyBiZWVuXG4vLyByZXNpemVkIGJ5IHRoZSB1c2VyLCB0aGVpciBoZWlnaHQgd2lsbCBvdmVycmlkZSB0aGlzIHZhbHVlLlxuLy9cbi8vIFJldHVybnMgYSB7TnVtYmVyfS5cbi8vXG4vLyAjIyMjIGBnZXRQcmVmZXJyZWRXaWR0aCgpYFxuLy9cbi8vIElmIHRoaXMgaXRlbSBpcyBkaXNwbGF5ZWQgaW4gdGhlIGxlZnQgb3IgcmlnaHQge0RvY2t9LCBjYWxsZWQgYnkgdGhlXG4vLyB3b3Jrc3BhY2Ugd2hlbiBpbml0aWFsbHkgZGlzcGxheWluZyB0aGUgZG9jayB0byBzZXQgaXRzIHdpZHRoLiBPbmNlIHRoZSBkb2NrXG4vLyBoYXMgYmVlbiByZXNpemVkIGJ5IHRoZSB1c2VyLCB0aGVpciB3aWR0aCB3aWxsIG92ZXJyaWRlIHRoaXMgdmFsdWUuXG4vL1xuLy8gUmV0dXJucyBhIHtOdW1iZXJ9LlxuLy9cbi8vICMjIyMgYG9uRGlkVGVybWluYXRlUGVuZGluZ1N0YXRlKGNhbGxiYWNrKWBcbi8vXG4vLyBJZiB0aGUgd29ya3NwYWNlIGlzIGNvbmZpZ3VyZWQgdG8gdXNlICpwZW5kaW5nIHBhbmUgaXRlbXMqLCB0aGUgd29ya3NwYWNlXG4vLyB3aWxsIHN1YnNjcmliZSB0byB0aGlzIG1ldGhvZCB0byB0ZXJtaW5hdGUgdGhlIHBlbmRpbmcgc3RhdGUgb2YgdGhlIGl0ZW0uXG4vLyBNdXN0IHJldHVybiBhIHtEaXNwb3NhYmxlfS5cbi8vXG4vLyAjIyMjIGBzaG91bGRQcm9tcHRUb1NhdmUoKWBcbi8vXG4vLyBUaGlzIG1ldGhvZCBpbmRpY2F0ZXMgd2hldGhlciBBdG9tIHNob3VsZCBwcm9tcHQgdGhlIHVzZXIgdG8gc2F2ZSB0aGlzIGl0ZW1cbi8vIHdoZW4gdGhlIHVzZXIgY2xvc2VzIG9yIHJlbG9hZHMgdGhlIHdpbmRvdy4gUmV0dXJucyBhIGJvb2xlYW4uXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFdvcmtzcGFjZSBleHRlbmRzIE1vZGVsIHtcbiAgY29uc3RydWN0b3IgKHBhcmFtcykge1xuICAgIHN1cGVyKC4uLmFyZ3VtZW50cylcblxuICAgIHRoaXMudXBkYXRlV2luZG93VGl0bGUgPSB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlLmJpbmQodGhpcylcbiAgICB0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkID0gdGhpcy51cGRhdGVEb2N1bWVudEVkaXRlZC5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaWREZXN0cm95UGFuZUl0ZW0gPSB0aGlzLmRpZERlc3Ryb3lQYW5lSXRlbS5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lT25QYW5lQ29udGFpbmVyID0gdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lT25QYW5lQ29udGFpbmVyLmJpbmQodGhpcylcbiAgICB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtT25QYW5lQ29udGFpbmVyID0gdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbU9uUGFuZUNvbnRhaW5lci5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaWRBY3RpdmF0ZVBhbmVDb250YWluZXIgPSB0aGlzLmRpZEFjdGl2YXRlUGFuZUNvbnRhaW5lci5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLmVuYWJsZVBlcnNpc3RlbmNlID0gcGFyYW1zLmVuYWJsZVBlcnNpc3RlbmNlXG4gICAgdGhpcy5wYWNrYWdlTWFuYWdlciA9IHBhcmFtcy5wYWNrYWdlTWFuYWdlclxuICAgIHRoaXMuY29uZmlnID0gcGFyYW1zLmNvbmZpZ1xuICAgIHRoaXMucHJvamVjdCA9IHBhcmFtcy5wcm9qZWN0XG4gICAgdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyID0gcGFyYW1zLm5vdGlmaWNhdGlvbk1hbmFnZXJcbiAgICB0aGlzLnZpZXdSZWdpc3RyeSA9IHBhcmFtcy52aWV3UmVnaXN0cnlcbiAgICB0aGlzLmdyYW1tYXJSZWdpc3RyeSA9IHBhcmFtcy5ncmFtbWFyUmVnaXN0cnlcbiAgICB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUgPSBwYXJhbXMuYXBwbGljYXRpb25EZWxlZ2F0ZVxuICAgIHRoaXMuYXNzZXJ0ID0gcGFyYW1zLmFzc2VydFxuICAgIHRoaXMuZGVzZXJpYWxpemVyTWFuYWdlciA9IHBhcmFtcy5kZXNlcmlhbGl6ZXJNYW5hZ2VyXG4gICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkgPSBwYXJhbXMudGV4dEVkaXRvclJlZ2lzdHJ5XG4gICAgdGhpcy5zdHlsZU1hbmFnZXIgPSBwYXJhbXMuc3R5bGVNYW5hZ2VyXG4gICAgdGhpcy5kcmFnZ2luZ0l0ZW0gPSBmYWxzZVxuICAgIHRoaXMuaXRlbUxvY2F0aW9uU3RvcmUgPSBuZXcgU3RhdGVTdG9yZSgnQXRvbVByZXZpb3VzSXRlbUxvY2F0aW9ucycsIDEpXG5cbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5vcGVuZXJzID0gW11cbiAgICB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzID0gW11cbiAgICB0aGlzLnN0b3BwZWRDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtVGltZW91dCA9IG51bGxcblxuICAgIHRoaXMuZGVmYXVsdERpcmVjdG9yeVNlYXJjaGVyID0gbmV3IERlZmF1bHREaXJlY3RvcnlTZWFyY2hlcigpXG4gICAgdGhpcy5jb25zdW1lU2VydmljZXModGhpcy5wYWNrYWdlTWFuYWdlcilcblxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMgPSB7XG4gICAgICBjZW50ZXI6IHRoaXMuY3JlYXRlQ2VudGVyKCksXG4gICAgICBsZWZ0OiB0aGlzLmNyZWF0ZURvY2soJ2xlZnQnKSxcbiAgICAgIHJpZ2h0OiB0aGlzLmNyZWF0ZURvY2soJ3JpZ2h0JyksXG4gICAgICBib3R0b206IHRoaXMuY3JlYXRlRG9jaygnYm90dG9tJylcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyID0gdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXJcbiAgICB0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3IgPSBmYWxzZVxuXG4gICAgdGhpcy5wYW5lbENvbnRhaW5lcnMgPSB7XG4gICAgICB0b3A6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICd0b3AnfSksXG4gICAgICBsZWZ0OiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnbGVmdCcsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdH0pLFxuICAgICAgcmlnaHQ6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdyaWdodCcsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHR9KSxcbiAgICAgIGJvdHRvbTogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ2JvdHRvbScsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tfSksXG4gICAgICBoZWFkZXI6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdoZWFkZXInfSksXG4gICAgICBmb290ZXI6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdmb290ZXInfSksXG4gICAgICBtb2RhbDogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ21vZGFsJ30pXG4gICAgfVxuXG4gICAgdGhpcy5zdWJzY3JpYmVUb0V2ZW50cygpXG4gIH1cblxuICBnZXQgcGFuZUNvbnRhaW5lciAoKSB7XG4gICAgR3JpbS5kZXByZWNhdGUoJ2BhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyYCBoYXMgYWx3YXlzIGJlZW4gcHJpdmF0ZSwgYnV0IGl0IGlzIG5vdyBnb25lLiBQbGVhc2UgdXNlIGBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKWAgaW5zdGVhZCBhbmQgY29uc3VsdCB0aGUgd29ya3NwYWNlIEFQSSBkb2NzIGZvciBwdWJsaWMgbWV0aG9kcy4nKVxuICAgIHJldHVybiB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5wYW5lQ29udGFpbmVyXG4gIH1cblxuICBnZXRFbGVtZW50ICgpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgICAgdGhpcy5lbGVtZW50ID0gbmV3IFdvcmtzcGFjZUVsZW1lbnQoKS5pbml0aWFsaXplKHRoaXMsIHtcbiAgICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgICAgcHJvamVjdDogdGhpcy5wcm9qZWN0LFxuICAgICAgICB2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LFxuICAgICAgICBzdHlsZU1hbmFnZXI6IHRoaXMuc3R5bGVNYW5hZ2VyXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbGVtZW50XG4gIH1cblxuICBjcmVhdGVDZW50ZXIgKCkge1xuICAgIHJldHVybiBuZXcgV29ya3NwYWNlQ2VudGVyKHtcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBhcHBsaWNhdGlvbkRlbGVnYXRlOiB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUsXG4gICAgICBub3RpZmljYXRpb25NYW5hZ2VyOiB0aGlzLm5vdGlmaWNhdGlvbk1hbmFnZXIsXG4gICAgICBkZXNlcmlhbGl6ZXJNYW5hZ2VyOiB0aGlzLmRlc2VyaWFsaXplck1hbmFnZXIsXG4gICAgICB2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LFxuICAgICAgZGlkQWN0aXZhdGU6IHRoaXMuZGlkQWN0aXZhdGVQYW5lQ29udGFpbmVyLFxuICAgICAgZGlkQ2hhbmdlQWN0aXZlUGFuZTogdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lT25QYW5lQ29udGFpbmVyLFxuICAgICAgZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW06IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW1PblBhbmVDb250YWluZXIsXG4gICAgICBkaWREZXN0cm95UGFuZUl0ZW06IHRoaXMuZGlkRGVzdHJveVBhbmVJdGVtXG4gICAgfSlcbiAgfVxuXG4gIGNyZWF0ZURvY2sgKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBEb2NrKHtcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGFwcGxpY2F0aW9uRGVsZWdhdGU6IHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZSxcbiAgICAgIGRlc2VyaWFsaXplck1hbmFnZXI6IHRoaXMuZGVzZXJpYWxpemVyTWFuYWdlcixcbiAgICAgIG5vdGlmaWNhdGlvbk1hbmFnZXI6IHRoaXMubm90aWZpY2F0aW9uTWFuYWdlcixcbiAgICAgIHZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksXG4gICAgICBkaWRBY3RpdmF0ZTogdGhpcy5kaWRBY3RpdmF0ZVBhbmVDb250YWluZXIsXG4gICAgICBkaWRDaGFuZ2VBY3RpdmVQYW5lOiB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVPblBhbmVDb250YWluZXIsXG4gICAgICBkaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbTogdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbU9uUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZERlc3Ryb3lQYW5lSXRlbTogdGhpcy5kaWREZXN0cm95UGFuZUl0ZW1cbiAgICB9KVxuICB9XG5cbiAgcmVzZXQgKHBhY2thZ2VNYW5hZ2VyKSB7XG4gICAgdGhpcy5wYWNrYWdlTWFuYWdlciA9IHBhY2thZ2VNYW5hZ2VyXG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKVxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcblxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyLmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdC5kZXN0cm95KClcbiAgICB0aGlzLnBhbmVDb250YWluZXJzLnJpZ2h0LmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tLmRlc3Ryb3koKVxuXG4gICAgXy52YWx1ZXModGhpcy5wYW5lbENvbnRhaW5lcnMpLmZvckVhY2gocGFuZWxDb250YWluZXIgPT4geyBwYW5lbENvbnRhaW5lci5kZXN0cm95KCkgfSlcblxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMgPSB7XG4gICAgICBjZW50ZXI6IHRoaXMuY3JlYXRlQ2VudGVyKCksXG4gICAgICBsZWZ0OiB0aGlzLmNyZWF0ZURvY2soJ2xlZnQnKSxcbiAgICAgIHJpZ2h0OiB0aGlzLmNyZWF0ZURvY2soJ3JpZ2h0JyksXG4gICAgICBib3R0b206IHRoaXMuY3JlYXRlRG9jaygnYm90dG9tJylcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyID0gdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXJcbiAgICB0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3IgPSBmYWxzZVxuXG4gICAgdGhpcy5wYW5lbENvbnRhaW5lcnMgPSB7XG4gICAgICB0b3A6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICd0b3AnfSksXG4gICAgICBsZWZ0OiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnbGVmdCcsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdH0pLFxuICAgICAgcmlnaHQ6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdyaWdodCcsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHR9KSxcbiAgICAgIGJvdHRvbTogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ2JvdHRvbScsIGRvY2s6IHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tfSksXG4gICAgICBoZWFkZXI6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdoZWFkZXInfSksXG4gICAgICBmb290ZXI6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdmb290ZXInfSksXG4gICAgICBtb2RhbDogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ21vZGFsJ30pXG4gICAgfVxuXG4gICAgdGhpcy5vcmlnaW5hbEZvbnRTaXplID0gbnVsbFxuICAgIHRoaXMub3BlbmVycyA9IFtdXG4gICAgdGhpcy5kZXN0cm95ZWRJdGVtVVJJcyA9IFtdXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbFxuICAgIHRoaXMuY29uc3VtZVNlcnZpY2VzKHRoaXMucGFja2FnZU1hbmFnZXIpXG4gIH1cblxuICBzdWJzY3JpYmVUb0V2ZW50cyAoKSB7XG4gICAgdGhpcy5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHModGhpcy51cGRhdGVXaW5kb3dUaXRsZSlcbiAgICB0aGlzLnN1YnNjcmliZVRvRm9udFNpemUoKVxuICAgIHRoaXMuc3Vic2NyaWJlVG9BZGRlZEl0ZW1zKClcbiAgICB0aGlzLnN1YnNjcmliZVRvTW92ZWRJdGVtcygpXG4gICAgdGhpcy5zdWJzY3JpYmVUb0RvY2tUb2dnbGluZygpXG4gIH1cblxuICBjb25zdW1lU2VydmljZXMgKHtzZXJ2aWNlSHVifSkge1xuICAgIHRoaXMuZGlyZWN0b3J5U2VhcmNoZXJzID0gW11cbiAgICBzZXJ2aWNlSHViLmNvbnN1bWUoXG4gICAgICAnYXRvbS5kaXJlY3Rvcnktc2VhcmNoZXInLFxuICAgICAgJ14wLjEuMCcsXG4gICAgICBwcm92aWRlciA9PiB0aGlzLmRpcmVjdG9yeVNlYXJjaGVycy51bnNoaWZ0KHByb3ZpZGVyKVxuICAgIClcbiAgfVxuXG4gIC8vIENhbGxlZCBieSB0aGUgU2VyaWFsaXphYmxlIG1peGluIGR1cmluZyBzZXJpYWxpemF0aW9uLlxuICBzZXJpYWxpemUgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdXb3Jrc3BhY2UnLFxuICAgICAgcGFja2FnZXNXaXRoQWN0aXZlR3JhbW1hcnM6IHRoaXMuZ2V0UGFja2FnZU5hbWVzV2l0aEFjdGl2ZUdyYW1tYXJzKCksXG4gICAgICBkZXN0cm95ZWRJdGVtVVJJczogdGhpcy5kZXN0cm95ZWRJdGVtVVJJcy5zbGljZSgpLFxuICAgICAgLy8gRW5zdXJlIGRlc2VyaWFsaXppbmcgMS4xNyBzdGF0ZSB3aXRoIHByZSAxLjE3IEF0b20gZG9lcyBub3QgZXJyb3JcbiAgICAgIC8vIFRPRE86IFJlbW92ZSBhZnRlciAxLjE3IGhhcyBiZWVuIG9uIHN0YWJsZSBmb3IgYSB3aGlsZVxuICAgICAgcGFuZUNvbnRhaW5lcjoge3ZlcnNpb246IDJ9LFxuICAgICAgcGFuZUNvbnRhaW5lcnM6IHtcbiAgICAgICAgY2VudGVyOiB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5zZXJpYWxpemUoKSxcbiAgICAgICAgbGVmdDogdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0LnNlcmlhbGl6ZSgpLFxuICAgICAgICByaWdodDogdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodC5zZXJpYWxpemUoKSxcbiAgICAgICAgYm90dG9tOiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbS5zZXJpYWxpemUoKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplIChzdGF0ZSwgZGVzZXJpYWxpemVyTWFuYWdlcikge1xuICAgIGNvbnN0IHBhY2thZ2VzV2l0aEFjdGl2ZUdyYW1tYXJzID1cbiAgICAgIHN0YXRlLnBhY2thZ2VzV2l0aEFjdGl2ZUdyYW1tYXJzICE9IG51bGwgPyBzdGF0ZS5wYWNrYWdlc1dpdGhBY3RpdmVHcmFtbWFycyA6IFtdXG4gICAgZm9yIChsZXQgcGFja2FnZU5hbWUgb2YgcGFja2FnZXNXaXRoQWN0aXZlR3JhbW1hcnMpIHtcbiAgICAgIGNvbnN0IHBrZyA9IHRoaXMucGFja2FnZU1hbmFnZXIuZ2V0TG9hZGVkUGFja2FnZShwYWNrYWdlTmFtZSlcbiAgICAgIGlmIChwa2cgIT0gbnVsbCkge1xuICAgICAgICBwa2cubG9hZEdyYW1tYXJzU3luYygpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzdGF0ZS5kZXN0cm95ZWRJdGVtVVJJcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzID0gc3RhdGUuZGVzdHJveWVkSXRlbVVSSXNcbiAgICB9XG5cbiAgICBpZiAoc3RhdGUucGFuZUNvbnRhaW5lcnMpIHtcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyLmRlc2VyaWFsaXplKHN0YXRlLnBhbmVDb250YWluZXJzLmNlbnRlciwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdC5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVycy5sZWZ0LCBkZXNlcmlhbGl6ZXJNYW5hZ2VyKVxuICAgICAgdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodC5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVycy5yaWdodCwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tLmRlc2VyaWFsaXplKHN0YXRlLnBhbmVDb250YWluZXJzLmJvdHRvbSwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICB9IGVsc2UgaWYgKHN0YXRlLnBhbmVDb250YWluZXIpIHtcbiAgICAgIC8vIFRPRE86IFJlbW92ZSB0aGlzIGZhbGxiYWNrIG9uY2UgYSBsb3Qgb2YgdGltZSBoYXMgcGFzc2VkIHNpbmNlIDEuMTcgd2FzIHJlbGVhc2VkXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVyLCBkZXNlcmlhbGl6ZXJNYW5hZ2VyKVxuICAgIH1cblxuICAgIHRoaXMuaGFzQWN0aXZlVGV4dEVkaXRvciA9IHRoaXMuZ2V0QWN0aXZlVGV4dEVkaXRvcigpICE9IG51bGxcblxuICAgIHRoaXMudXBkYXRlV2luZG93VGl0bGUoKVxuICB9XG5cbiAgZ2V0UGFja2FnZU5hbWVzV2l0aEFjdGl2ZUdyYW1tYXJzICgpIHtcbiAgICBjb25zdCBwYWNrYWdlTmFtZXMgPSBbXVxuICAgIGNvbnN0IGFkZEdyYW1tYXIgPSAoe2luY2x1ZGVkR3JhbW1hclNjb3BlcywgcGFja2FnZU5hbWV9ID0ge30pID0+IHtcbiAgICAgIGlmICghcGFja2FnZU5hbWUpIHsgcmV0dXJuIH1cbiAgICAgIC8vIFByZXZlbnQgY3ljbGVzXG4gICAgICBpZiAocGFja2FnZU5hbWVzLmluZGV4T2YocGFja2FnZU5hbWUpICE9PSAtMSkgeyByZXR1cm4gfVxuXG4gICAgICBwYWNrYWdlTmFtZXMucHVzaChwYWNrYWdlTmFtZSlcbiAgICAgIGZvciAobGV0IHNjb3BlTmFtZSBvZiBpbmNsdWRlZEdyYW1tYXJTY29wZXMgIT0gbnVsbCA/IGluY2x1ZGVkR3JhbW1hclNjb3BlcyA6IFtdKSB7XG4gICAgICAgIGFkZEdyYW1tYXIodGhpcy5ncmFtbWFyUmVnaXN0cnkuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZU5hbWUpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGVkaXRvcnMgPSB0aGlzLmdldFRleHRFZGl0b3JzKClcbiAgICBmb3IgKGxldCBlZGl0b3Igb2YgZWRpdG9ycykgeyBhZGRHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpIH1cblxuICAgIGlmIChlZGl0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAobGV0IGdyYW1tYXIgb2YgdGhpcy5ncmFtbWFyUmVnaXN0cnkuZ2V0R3JhbW1hcnMoKSkge1xuICAgICAgICBpZiAoZ3JhbW1hci5pbmplY3Rpb25TZWxlY3Rvcikge1xuICAgICAgICAgIGFkZEdyYW1tYXIoZ3JhbW1hcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfLnVuaXEocGFja2FnZU5hbWVzKVxuICB9XG5cbiAgZGlkQWN0aXZhdGVQYW5lQ29udGFpbmVyIChwYW5lQ29udGFpbmVyKSB7XG4gICAgaWYgKHBhbmVDb250YWluZXIgIT09IHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpKSB7XG4gICAgICB0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIgPSBwYW5lQ29udGFpbmVyXG4gICAgICB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtY29udGFpbmVyJywgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUnLCB0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtaXRlbScsIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lci5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgIH1cbiAgfVxuXG4gIGRpZENoYW5nZUFjdGl2ZVBhbmVPblBhbmVDb250YWluZXIgKHBhbmVDb250YWluZXIsIHBhbmUpIHtcbiAgICBpZiAocGFuZUNvbnRhaW5lciA9PT0gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lJywgcGFuZSlcbiAgICB9XG4gIH1cblxuICBkaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbU9uUGFuZUNvbnRhaW5lciAocGFuZUNvbnRhaW5lciwgaXRlbSkge1xuICAgIGlmIChwYW5lQ29udGFpbmVyID09PSB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKSkge1xuICAgICAgdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShpdGVtKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUtaXRlbScsIGl0ZW0pXG4gICAgfVxuXG4gICAgaWYgKHBhbmVDb250YWluZXIgPT09IHRoaXMuZ2V0Q2VudGVyKCkpIHtcbiAgICAgIGNvbnN0IGhhZEFjdGl2ZVRleHRFZGl0b3IgPSB0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3JcbiAgICAgIHRoaXMuaGFzQWN0aXZlVGV4dEVkaXRvciA9IGl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG5cbiAgICAgIGlmICh0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3IgfHwgaGFkQWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgICBjb25zdCBpdGVtVmFsdWUgPSB0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3IgPyBpdGVtIDogdW5kZWZpbmVkXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS10ZXh0LWVkaXRvcicsIGl0ZW1WYWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoaXRlbSkge1xuICAgIHRoaXMudXBkYXRlV2luZG93VGl0bGUoKVxuICAgIHRoaXMudXBkYXRlRG9jdW1lbnRFZGl0ZWQoKVxuICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zKSB0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuYWN0aXZlSXRlbVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBsZXQgbW9kaWZpZWRTdWJzY3JpcHRpb24sIHRpdGxlU3Vic2NyaXB0aW9uXG5cbiAgICBpZiAoaXRlbSAhPSBudWxsICYmIHR5cGVvZiBpdGVtLm9uRGlkQ2hhbmdlVGl0bGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRpdGxlU3Vic2NyaXB0aW9uID0gaXRlbS5vbkRpZENoYW5nZVRpdGxlKHRoaXMudXBkYXRlV2luZG93VGl0bGUpXG4gICAgfSBlbHNlIGlmIChpdGVtICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0ub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRpdGxlU3Vic2NyaXB0aW9uID0gaXRlbS5vbigndGl0bGUtY2hhbmdlZCcsIHRoaXMudXBkYXRlV2luZG93VGl0bGUpXG4gICAgICBpZiAodGl0bGVTdWJzY3JpcHRpb24gPT0gbnVsbCB8fCB0eXBlb2YgdGl0bGVTdWJzY3JpcHRpb24uZGlzcG9zZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aXRsZVN1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgICBpdGVtLm9mZigndGl0bGUtY2hhbmdlZCcsIHRoaXMudXBkYXRlV2luZG93VGl0bGUpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgaXRlbS5vbkRpZENoYW5nZU1vZGlmaWVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBtb2RpZmllZFN1YnNjcmlwdGlvbiA9IGl0ZW0ub25EaWRDaGFuZ2VNb2RpZmllZCh0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkKVxuICAgIH0gZWxzZSBpZiAoaXRlbSAhPSBudWxsICYmIHR5cGVvZiBpdGVtLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBtb2RpZmllZFN1YnNjcmlwdGlvbiA9IGl0ZW0ub24oJ21vZGlmaWVkLXN0YXR1cy1jaGFuZ2VkJywgdGhpcy51cGRhdGVEb2N1bWVudEVkaXRlZClcbiAgICAgIGlmIChtb2RpZmllZFN1YnNjcmlwdGlvbiA9PSBudWxsIHx8IHR5cGVvZiBtb2RpZmllZFN1YnNjcmlwdGlvbi5kaXNwb3NlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG1vZGlmaWVkU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICAgIGl0ZW0ub2ZmKCdtb2RpZmllZC1zdGF0dXMtY2hhbmdlZCcsIHRoaXMudXBkYXRlRG9jdW1lbnRFZGl0ZWQpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRpdGxlU3Vic2NyaXB0aW9uICE9IG51bGwpIHsgdGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucy5hZGQodGl0bGVTdWJzY3JpcHRpb24pIH1cbiAgICBpZiAobW9kaWZpZWRTdWJzY3JpcHRpb24gIT0gbnVsbCkgeyB0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zLmFkZChtb2RpZmllZFN1YnNjcmlwdGlvbikgfVxuXG4gICAgdGhpcy5jYW5jZWxTdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQoKVxuICAgIHRoaXMuc3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnN0b3BwZWRDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtVGltZW91dCA9IG51bGxcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtc3RvcC1jaGFuZ2luZy1hY3RpdmUtcGFuZS1pdGVtJywgaXRlbSlcbiAgICB9LCBTVE9QUEVEX0NIQU5HSU5HX0FDVElWRV9QQU5FX0lURU1fREVMQVkpXG4gIH1cblxuICBjYW5jZWxTdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQgKCkge1xuICAgIGlmICh0aGlzLnN0b3BwZWRDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtVGltZW91dCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5zdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQpXG4gICAgfVxuICB9XG5cbiAgc2V0RHJhZ2dpbmdJdGVtIChkcmFnZ2luZ0l0ZW0pIHtcbiAgICBfLnZhbHVlcyh0aGlzLnBhbmVDb250YWluZXJzKS5mb3JFYWNoKGRvY2sgPT4ge1xuICAgICAgZG9jay5zZXREcmFnZ2luZ0l0ZW0oZHJhZ2dpbmdJdGVtKVxuICAgIH0pXG4gIH1cblxuICBzdWJzY3JpYmVUb0FkZGVkSXRlbXMgKCkge1xuICAgIHRoaXMub25EaWRBZGRQYW5lSXRlbSgoe2l0ZW0sIHBhbmUsIGluZGV4fSkgPT4ge1xuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yKSB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgICAgICB0aGlzLnRleHRFZGl0b3JSZWdpc3RyeS5hZGQoaXRlbSksXG4gICAgICAgICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkubWFpbnRhaW5HcmFtbWFyKGl0ZW0pLFxuICAgICAgICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5Lm1haW50YWluQ29uZmlnKGl0ZW0pLFxuICAgICAgICAgIGl0ZW0ub2JzZXJ2ZUdyYW1tYXIodGhpcy5oYW5kbGVHcmFtbWFyVXNlZC5iaW5kKHRoaXMpKVxuICAgICAgICApXG4gICAgICAgIGl0ZW0ub25EaWREZXN0cm95KCgpID0+IHsgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCkgfSlcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1hZGQtdGV4dC1lZGl0b3InLCB7dGV4dEVkaXRvcjogaXRlbSwgcGFuZSwgaW5kZXh9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBzdWJzY3JpYmVUb0RvY2tUb2dnbGluZyAoKSB7XG4gICAgY29uc3QgZG9ja3MgPSBbdGhpcy5nZXRMZWZ0RG9jaygpLCB0aGlzLmdldFJpZ2h0RG9jaygpLCB0aGlzLmdldEJvdHRvbURvY2soKV1cbiAgICBkb2Nrcy5mb3JFYWNoKGRvY2sgPT4ge1xuICAgICAgZG9jay5vbkRpZENoYW5nZVZpc2libGUodmlzaWJsZSA9PiB7XG4gICAgICAgIGlmICh2aXNpYmxlKSByZXR1cm5cbiAgICAgICAgY29uc3Qge2FjdGl2ZUVsZW1lbnR9ID0gZG9jdW1lbnRcbiAgICAgICAgY29uc3QgZG9ja0VsZW1lbnQgPSBkb2NrLmdldEVsZW1lbnQoKVxuICAgICAgICBpZiAoZG9ja0VsZW1lbnQgPT09IGFjdGl2ZUVsZW1lbnQgfHwgZG9ja0VsZW1lbnQuY29udGFpbnMoYWN0aXZlRWxlbWVudCkpIHtcbiAgICAgICAgICB0aGlzLmdldENlbnRlcigpLmFjdGl2YXRlKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgc3Vic2NyaWJlVG9Nb3ZlZEl0ZW1zICgpIHtcbiAgICBmb3IgKGNvbnN0IHBhbmVDb250YWluZXIgb2YgdGhpcy5nZXRQYW5lQ29udGFpbmVycygpKSB7XG4gICAgICBwYW5lQ29udGFpbmVyLm9ic2VydmVQYW5lcyhwYW5lID0+IHtcbiAgICAgICAgcGFuZS5vbkRpZEFkZEl0ZW0oKHtpdGVtfSkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicgJiYgdGhpcy5lbmFibGVQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgICAgY29uc3QgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgICAgICAgICAgaWYgKHVyaSkge1xuICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHBhbmVDb250YWluZXIuZ2V0TG9jYXRpb24oKVxuICAgICAgICAgICAgICBsZXQgZGVmYXVsdExvY2F0aW9uXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5nZXREZWZhdWx0TG9jYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0TG9jYXRpb24gPSBpdGVtLmdldERlZmF1bHRMb2NhdGlvbigpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZGVmYXVsdExvY2F0aW9uID0gZGVmYXVsdExvY2F0aW9uIHx8ICdjZW50ZXInXG4gICAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gZGVmYXVsdExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtTG9jYXRpb25TdG9yZS5kZWxldGUoaXRlbS5nZXRVUkkoKSlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1Mb2NhdGlvblN0b3JlLnNhdmUoaXRlbS5nZXRVUkkoKSwgbG9jYXRpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIFVwZGF0ZXMgdGhlIGFwcGxpY2F0aW9uJ3MgdGl0bGUgYW5kIHByb3h5IGljb24gYmFzZWQgb24gd2hpY2hldmVyIGZpbGUgaXNcbiAgLy8gb3Blbi5cbiAgdXBkYXRlV2luZG93VGl0bGUgKCkge1xuICAgIGxldCBpdGVtUGF0aCwgaXRlbVRpdGxlLCBwcm9qZWN0UGF0aCwgcmVwcmVzZW50ZWRQYXRoXG4gICAgY29uc3QgYXBwTmFtZSA9ICdBdG9tJ1xuICAgIGNvbnN0IGxlZnQgPSB0aGlzLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGxlZnQgIT0gbnVsbCA/IGxlZnQgOiBbXVxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICBpZiAoaXRlbSkge1xuICAgICAgaXRlbVBhdGggPSB0eXBlb2YgaXRlbS5nZXRQYXRoID09PSAnZnVuY3Rpb24nID8gaXRlbS5nZXRQYXRoKCkgOiB1bmRlZmluZWRcbiAgICAgIGNvbnN0IGxvbmdUaXRsZSA9IHR5cGVvZiBpdGVtLmdldExvbmdUaXRsZSA9PT0gJ2Z1bmN0aW9uJyA/IGl0ZW0uZ2V0TG9uZ1RpdGxlKCkgOiB1bmRlZmluZWRcbiAgICAgIGl0ZW1UaXRsZSA9IGxvbmdUaXRsZSA9PSBudWxsXG4gICAgICAgID8gKHR5cGVvZiBpdGVtLmdldFRpdGxlID09PSAnZnVuY3Rpb24nID8gaXRlbS5nZXRUaXRsZSgpIDogdW5kZWZpbmVkKVxuICAgICAgICA6IGxvbmdUaXRsZVxuICAgICAgcHJvamVjdFBhdGggPSBfLmZpbmQoXG4gICAgICAgIHByb2plY3RQYXRocyxcbiAgICAgICAgcHJvamVjdFBhdGggPT5cbiAgICAgICAgICAoaXRlbVBhdGggPT09IHByb2plY3RQYXRoKSB8fCAoaXRlbVBhdGggIT0gbnVsbCA/IGl0ZW1QYXRoLnN0YXJ0c1dpdGgocHJvamVjdFBhdGggKyBwYXRoLnNlcCkgOiB1bmRlZmluZWQpXG4gICAgICApXG4gICAgfVxuICAgIGlmIChpdGVtVGl0bGUgPT0gbnVsbCkgeyBpdGVtVGl0bGUgPSAndW50aXRsZWQnIH1cbiAgICBpZiAocHJvamVjdFBhdGggPT0gbnVsbCkgeyBwcm9qZWN0UGF0aCA9IGl0ZW1QYXRoID8gcGF0aC5kaXJuYW1lKGl0ZW1QYXRoKSA6IHByb2plY3RQYXRoc1swXSB9XG4gICAgaWYgKHByb2plY3RQYXRoICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RQYXRoID0gZnMudGlsZGlmeShwcm9qZWN0UGF0aClcbiAgICB9XG5cbiAgICBjb25zdCB0aXRsZVBhcnRzID0gW11cbiAgICBpZiAoKGl0ZW0gIT0gbnVsbCkgJiYgKHByb2plY3RQYXRoICE9IG51bGwpKSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2goaXRlbVRpdGxlLCBwcm9qZWN0UGF0aClcbiAgICAgIHJlcHJlc2VudGVkUGF0aCA9IGl0ZW1QYXRoICE9IG51bGwgPyBpdGVtUGF0aCA6IHByb2plY3RQYXRoXG4gICAgfSBlbHNlIGlmIChwcm9qZWN0UGF0aCAhPSBudWxsKSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2gocHJvamVjdFBhdGgpXG4gICAgICByZXByZXNlbnRlZFBhdGggPSBwcm9qZWN0UGF0aFxuICAgIH0gZWxzZSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2goaXRlbVRpdGxlKVxuICAgICAgcmVwcmVzZW50ZWRQYXRoID0gJydcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcbiAgICAgIHRpdGxlUGFydHMucHVzaChhcHBOYW1lKVxuICAgIH1cblxuICAgIGRvY3VtZW50LnRpdGxlID0gdGl0bGVQYXJ0cy5qb2luKCcgXFx1MjAxNCAnKVxuICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5zZXRSZXByZXNlbnRlZEZpbGVuYW1lKHJlcHJlc2VudGVkUGF0aClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS13aW5kb3ctdGl0bGUnKVxuICB9XG5cbiAgLy8gT24gbWFjT1MsIGZhZGVzIHRoZSBhcHBsaWNhdGlvbiB3aW5kb3cncyBwcm94eSBpY29uIHdoZW4gdGhlIGN1cnJlbnQgZmlsZVxuICAvLyBoYXMgYmVlbiBtb2RpZmllZC5cbiAgdXBkYXRlRG9jdW1lbnRFZGl0ZWQgKCkge1xuICAgIGNvbnN0IGFjdGl2ZVBhbmVJdGVtID0gdGhpcy5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgY29uc3QgbW9kaWZpZWQgPSBhY3RpdmVQYW5lSXRlbSAhPSBudWxsICYmIHR5cGVvZiBhY3RpdmVQYW5lSXRlbS5pc01vZGlmaWVkID09PSAnZnVuY3Rpb24nXG4gICAgICA/IGFjdGl2ZVBhbmVJdGVtLmlzTW9kaWZpZWQoKSB8fCBmYWxzZVxuICAgICAgOiBmYWxzZVxuICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5zZXRXaW5kb3dEb2N1bWVudEVkaXRlZChtb2RpZmllZClcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IEV2ZW50IFN1YnNjcmlwdGlvblxuICAqL1xuXG4gIG9uRGlkQ2hhbmdlQWN0aXZlUGFuZUNvbnRhaW5lciAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lLWNvbnRhaW5lcicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSB0ZXh0XG4gIC8vIGVkaXRvcnMgaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggY3VycmVudCBhbmQgZnV0dXJlIHRleHQgZWRpdG9ycy5cbiAgLy8gICAqIGBlZGl0b3JgIEEge1RleHRFZGl0b3J9IHRoYXQgaXMgcHJlc2VudCBpbiB7OjpnZXRUZXh0RWRpdG9yc30gYXQgdGhlIHRpbWVcbiAgLy8gICAgIG9mIHN1YnNjcmlwdGlvbiBvciB0aGF0IGlzIGFkZGVkIGF0IHNvbWUgbGF0ZXIgdGltZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVRleHRFZGl0b3JzIChjYWxsYmFjaykge1xuICAgIGZvciAobGV0IHRleHRFZGl0b3Igb2YgdGhpcy5nZXRUZXh0RWRpdG9ycygpKSB7IGNhbGxiYWNrKHRleHRFZGl0b3IpIH1cbiAgICByZXR1cm4gdGhpcy5vbkRpZEFkZFRleHRFZGl0b3IoKHt0ZXh0RWRpdG9yfSkgPT4gY2FsbGJhY2sodGV4dEVkaXRvcikpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aCBhbGwgY3VycmVudCBhbmQgZnV0dXJlIHBhbmVzIGl0ZW1zXG4gIC8vIGluIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGN1cnJlbnQgYW5kIGZ1dHVyZSBwYW5lIGl0ZW1zLlxuICAvLyAgICogYGl0ZW1gIEFuIGl0ZW0gdGhhdCBpcyBwcmVzZW50IGluIHs6OmdldFBhbmVJdGVtc30gYXQgdGhlIHRpbWUgb2ZcbiAgLy8gICAgICBzdWJzY3JpcHRpb24gb3IgdGhhdCBpcyBhZGRlZCBhdCBzb21lIGxhdGVyIHRpbWUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVQYW5lSXRlbXMgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9ic2VydmVQYW5lSXRlbXMoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGNoYW5nZXMuXG4gIC8vXG4gIC8vIEJlY2F1c2Ugb2JzZXJ2ZXJzIGFyZSBpbnZva2VkIHN5bmNocm9ub3VzbHksIGl0J3MgaW1wb3J0YW50IG5vdCB0byBwZXJmb3JtXG4gIC8vIGFueSBleHBlbnNpdmUgb3BlcmF0aW9ucyB2aWEgdGhpcyBtZXRob2QuIENvbnNpZGVyXG4gIC8vIHs6Om9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW19IHRvIGRlbGF5IG9wZXJhdGlvbnMgdW50aWwgYWZ0ZXIgY2hhbmdlc1xuICAvLyBzdG9wIG9jY3VycmluZy5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY2hhbmdlcy5cbiAgLy8gICAqIGBpdGVtYCBUaGUgYWN0aXZlIHBhbmUgaXRlbS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lLWl0ZW0nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIHN0b3BzXG4gIC8vIGNoYW5naW5nLlxuICAvL1xuICAvLyBPYnNlcnZlcnMgYXJlIGNhbGxlZCBhc3luY2hyb25vdXNseSAxMDBtcyBhZnRlciB0aGUgbGFzdCBhY3RpdmUgcGFuZSBpdGVtXG4gIC8vIGNoYW5nZS4gSGFuZGxpbmcgY2hhbmdlcyBoZXJlIHJhdGhlciB0aGFuIGluIHRoZSBzeW5jaHJvbm91c1xuICAvLyB7OjpvbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtfSBwcmV2ZW50cyB1bm5lZWRlZCB3b3JrIGlmIHRoZSB1c2VyIGlzIHF1aWNrbHlcbiAgLy8gY2hhbmdpbmcgb3IgY2xvc2luZyB0YWJzIGFuZCBlbnN1cmVzIGNyaXRpY2FsIFVJIGZlZWRiYWNrLCBsaWtlIGNoYW5naW5nIHRoZVxuICAvLyBoaWdobGlnaHRlZCB0YWIsIGdldHMgcHJpb3JpdHkgb3ZlciB3b3JrIHRoYXQgY2FuIGJlIGRvbmUgYXN5bmNocm9ub3VzbHkuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIHN0b3BzXG4gIC8vICAgY2hhbmdpbmcuXG4gIC8vICAgKiBgaXRlbWAgVGhlIGFjdGl2ZSBwYW5lIGl0ZW0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkU3RvcENoYW5naW5nQWN0aXZlUGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXN0b3AtY2hhbmdpbmctYWN0aXZlLXBhbmUtaXRlbScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSB0ZXh0IGVkaXRvciBiZWNvbWVzIHRoZSBhY3RpdmVcbiAgLy8gdGV4dCBlZGl0b3IgYW5kIHdoZW4gdGhlcmUgaXMgbm8gbG9uZ2VyIGFuIGFjdGl2ZSB0ZXh0IGVkaXRvci5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGFjdGl2ZSB0ZXh0IGVkaXRvciBjaGFuZ2VzLlxuICAvLyAgICogYGVkaXRvcmAgVGhlIGFjdGl2ZSB7VGV4dEVkaXRvcn0gb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGxvbmdlciBhblxuICAvLyAgICAgIGFjdGl2ZSB0ZXh0IGVkaXRvci5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRDaGFuZ2VBY3RpdmVUZXh0RWRpdG9yIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtYWN0aXZlLXRleHQtZWRpdG9yJywgY2FsbGJhY2spXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aCB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSBpdGVtIGFuZFxuICAvLyB3aXRoIGFsbCBmdXR1cmUgYWN0aXZlIHBhbmUgaXRlbXMgaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gY2hhbmdlcy5cbiAgLy8gICAqIGBpdGVtYCBUaGUgY3VycmVudCBhY3RpdmUgcGFuZSBpdGVtLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlQWN0aXZlUGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sodGhpcy5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgIHJldHVybiB0aGlzLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oY2FsbGJhY2spXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aCB0aGUgY3VycmVudCBhY3RpdmUgdGV4dCBlZGl0b3JcbiAgLy8gKGlmIGFueSksIHdpdGggYWxsIGZ1dHVyZSBhY3RpdmUgdGV4dCBlZGl0b3JzLCBhbmQgd2hlbiB0aGVyZSBpcyBubyBsb25nZXJcbiAgLy8gYW4gYWN0aXZlIHRleHQgZWRpdG9yLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYWN0aXZlIHRleHQgZWRpdG9yIGNoYW5nZXMuXG4gIC8vICAgKiBgZWRpdG9yYCBUaGUgYWN0aXZlIHtUZXh0RWRpdG9yfSBvciB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm90IGFuXG4gIC8vICAgICAgYWN0aXZlIHRleHQgZWRpdG9yLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlQWN0aXZlVGV4dEVkaXRvciAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayh0aGlzLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcblxuICAgIHJldHVybiB0aGlzLm9uRGlkQ2hhbmdlQWN0aXZlVGV4dEVkaXRvcihjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuZXZlciBhbiBpdGVtIGlzIG9wZW5lZC4gVW5saWtlXG4gIC8vIHs6Om9uRGlkQWRkUGFuZUl0ZW19LCBvYnNlcnZlcnMgd2lsbCBiZSBub3RpZmllZCBmb3IgaXRlbXMgdGhhdCBhcmUgYWxyZWFkeVxuICAvLyBwcmVzZW50IGluIHRoZSB3b3Jrc3BhY2Ugd2hlbiB0aGV5IGFyZSByZW9wZW5lZC5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIGFuIGl0ZW0gaXMgb3BlbmVkLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYHVyaWAge1N0cmluZ30gcmVwcmVzZW50aW5nIHRoZSBvcGVuZWQgVVJJLiBDb3VsZCBiZSBgdW5kZWZpbmVkYC5cbiAgLy8gICAgICogYGl0ZW1gIFRoZSBvcGVuZWQgaXRlbS5cbiAgLy8gICAgICogYHBhbmVgIFRoZSBwYW5lIGluIHdoaWNoIHRoZSBpdGVtIHdhcyBvcGVuZWQuXG4gIC8vICAgICAqIGBpbmRleGAgVGhlIGluZGV4IG9mIHRoZSBvcGVuZWQgaXRlbSBvbiBpdHMgcGFuZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRPcGVuIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1vcGVuJywgY2FsbGJhY2spXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgcGFuZSBpcyBhZGRlZCB0byB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgcGFuZXMgYXJlIGFkZGVkLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYHBhbmVgIFRoZSBhZGRlZCBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZEFkZFBhbmUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uRGlkQWRkUGFuZShjYWxsYmFjaykpXG4gICAgKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgYmVmb3JlIGEgcGFuZSBpcyBkZXN0cm95ZWQgaW4gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIGJlZm9yZSBwYW5lcyBhcmUgZGVzdHJveWVkLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYHBhbmVgIFRoZSBwYW5lIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25XaWxsRGVzdHJveVBhbmUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uV2lsbERlc3Ryb3lQYW5lKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgcGFuZSBpcyBkZXN0cm95ZWQgaW4gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHBhbmVzIGFyZSBkZXN0cm95ZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIGRlc3Ryb3llZCBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZERlc3Ryb3lQYW5lIChjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIC4uLnRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5vbkRpZERlc3Ryb3lQYW5lKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgcGFuZXMgaW4gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggY3VycmVudCBhbmQgZnV0dXJlIHBhbmVzLlxuICAvLyAgICogYHBhbmVgIEEge1BhbmV9IHRoYXQgaXMgcHJlc2VudCBpbiB7OjpnZXRQYW5lc30gYXQgdGhlIHRpbWUgb2ZcbiAgLy8gICAgICBzdWJzY3JpcHRpb24gb3IgdGhhdCBpcyBhZGRlZCBhdCBzb21lIGxhdGVyIHRpbWUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVQYW5lcyAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub2JzZXJ2ZVBhbmVzKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIHRoZSBhY3RpdmUgcGFuZSBjaGFuZ2VzLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYWN0aXZlIHBhbmUgY2hhbmdlcy5cbiAgLy8gICAqIGBwYW5lYCBBIHtQYW5lfSB0aGF0IGlzIHRoZSBjdXJyZW50IHJldHVybiB2YWx1ZSBvZiB7OjpnZXRBY3RpdmVQYW5lfS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRDaGFuZ2VBY3RpdmVQYW5lIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtYWN0aXZlLXBhbmUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggdGhlIGN1cnJlbnQgYWN0aXZlIHBhbmUgYW5kIHdoZW5cbiAgLy8gdGhlIGFjdGl2ZSBwYW5lIGNoYW5nZXMuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIHRoZSBjdXJyZW50IGFuZCBmdXR1cmUgYWN0aXZlI1xuICAvLyAgIHBhbmVzLlxuICAvLyAgICogYHBhbmVgIEEge1BhbmV9IHRoYXQgaXMgdGhlIGN1cnJlbnQgcmV0dXJuIHZhbHVlIG9mIHs6OmdldEFjdGl2ZVBhbmV9LlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlQWN0aXZlUGFuZSAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayh0aGlzLmdldEFjdGl2ZVBhbmUoKSlcbiAgICByZXR1cm4gdGhpcy5vbkRpZENoYW5nZUFjdGl2ZVBhbmUoY2FsbGJhY2spXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgcGFuZSBpdGVtIGlzIGFkZGVkIHRvIHRoZVxuICAvLyB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHBhbmUgaXRlbXMgYXJlIGFkZGVkLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYGl0ZW1gIFRoZSBhZGRlZCBwYW5lIGl0ZW0uXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgYWRkZWQgaXRlbS5cbiAgLy8gICAgICogYGluZGV4YCB7TnVtYmVyfSBpbmRpY2F0aW5nIHRoZSBpbmRleCBvZiB0aGUgYWRkZWQgaXRlbSBpbiBpdHMgcGFuZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRQYW5lSXRlbSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub25EaWRBZGRQYW5lSXRlbShjYWxsYmFjaykpXG4gICAgKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiBhIHBhbmUgaXRlbSBpcyBhYm91dCB0byBiZVxuICAvLyBkZXN0cm95ZWQsIGJlZm9yZSB0aGUgdXNlciBpcyBwcm9tcHRlZCB0byBzYXZlIGl0LlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgYmVmb3JlIHBhbmUgaXRlbXMgYXJlIGRlc3Ryb3llZC4gSWYgdGhpcyBmdW5jdGlvbiByZXR1cm5zXG4gIC8vICAgYSB7UHJvbWlzZX0sIHRoZW4gdGhlIGl0ZW0gd2lsbCBub3QgYmUgZGVzdHJveWVkIHVudGlsIHRoZSBwcm9taXNlIHJlc29sdmVzLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYGl0ZW1gIFRoZSBpdGVtIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy8gICAgICogYHBhbmVgIHtQYW5lfSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy8gICAgICogYGluZGV4YCB7TnVtYmVyfSBpbmRpY2F0aW5nIHRoZSBpbmRleCBvZiB0aGUgaXRlbSB0byBiZSBkZXN0cm95ZWQgaW5cbiAgLy8gICAgICAgaXRzIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbldpbGxEZXN0cm95UGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uV2lsbERlc3Ryb3lQYW5lSXRlbShjYWxsYmFjaykpXG4gICAgKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiBhIHBhbmUgaXRlbSBpcyBkZXN0cm95ZWQuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHBhbmUgaXRlbXMgYXJlIGRlc3Ryb3llZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGBpdGVtYCBUaGUgZGVzdHJveWVkIGl0ZW0uXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgZGVzdHJveWVkIGl0ZW0uXG4gIC8vICAgICAqIGBpbmRleGAge051bWJlcn0gaW5kaWNhdGluZyB0aGUgaW5kZXggb2YgdGhlIGRlc3Ryb3llZCBpdGVtIGluIGl0c1xuICAvLyAgICAgICBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWREZXN0cm95UGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uRGlkRGVzdHJveVBhbmVJdGVtKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgdGV4dCBlZGl0b3IgaXMgYWRkZWQgdG8gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHBhbmVzIGFyZSBhZGRlZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGB0ZXh0RWRpdG9yYCB7VGV4dEVkaXRvcn0gdGhhdCB3YXMgYWRkZWQuXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgYWRkZWQgdGV4dCBlZGl0b3IuXG4gIC8vICAgICAqIGBpbmRleGAge051bWJlcn0gaW5kaWNhdGluZyB0aGUgaW5kZXggb2YgdGhlIGFkZGVkIHRleHQgZWRpdG9yIGluIGl0c1xuICAvLyAgICAgICAgcGFuZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRUZXh0RWRpdG9yIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hZGQtdGV4dC1lZGl0b3InLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlV2luZG93VGl0bGUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS13aW5kb3ctdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IE9wZW5pbmdcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IE9wZW5zIHRoZSBnaXZlbiBVUkkgaW4gQXRvbSBhc3luY2hyb25vdXNseS5cbiAgLy8gSWYgdGhlIFVSSSBpcyBhbHJlYWR5IG9wZW4sIHRoZSBleGlzdGluZyBpdGVtIGZvciB0aGF0IFVSSSB3aWxsIGJlXG4gIC8vIGFjdGl2YXRlZC4gSWYgbm8gVVJJIGlzIGdpdmVuLCBvciBubyByZWdpc3RlcmVkIG9wZW5lciBjYW4gb3BlblxuICAvLyB0aGUgVVJJLCBhIG5ldyBlbXB0eSB7VGV4dEVkaXRvcn0gd2lsbCBiZSBjcmVhdGVkLlxuICAvL1xuICAvLyAqIGB1cmlgIChvcHRpb25hbCkgQSB7U3RyaW5nfSBjb250YWluaW5nIGEgVVJJLlxuICAvLyAqIGBvcHRpb25zYCAob3B0aW9uYWwpIHtPYmplY3R9XG4gIC8vICAgKiBgaW5pdGlhbExpbmVgIEEge051bWJlcn0gaW5kaWNhdGluZyB3aGljaCByb3cgdG8gbW92ZSB0aGUgY3Vyc29yIHRvXG4gIC8vICAgICBpbml0aWFsbHkuIERlZmF1bHRzIHRvIGAwYC5cbiAgLy8gICAqIGBpbml0aWFsQ29sdW1uYCBBIHtOdW1iZXJ9IGluZGljYXRpbmcgd2hpY2ggY29sdW1uIHRvIG1vdmUgdGhlIGN1cnNvciB0b1xuICAvLyAgICAgaW5pdGlhbGx5LiBEZWZhdWx0cyB0byBgMGAuXG4gIC8vICAgKiBgc3BsaXRgIEVpdGhlciAnbGVmdCcsICdyaWdodCcsICd1cCcgb3IgJ2Rvd24nLlxuICAvLyAgICAgSWYgJ2xlZnQnLCB0aGUgaXRlbSB3aWxsIGJlIG9wZW5lZCBpbiBsZWZ0bW9zdCBwYW5lIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lJ3Mgcm93LlxuICAvLyAgICAgSWYgJ3JpZ2h0JywgdGhlIGl0ZW0gd2lsbCBiZSBvcGVuZWQgaW4gdGhlIHJpZ2h0bW9zdCBwYW5lIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lJ3Mgcm93LiBJZiBvbmx5IG9uZSBwYW5lIGV4aXN0cyBpbiB0aGUgcm93LCBhIG5ldyBwYW5lIHdpbGwgYmUgY3JlYXRlZC5cbiAgLy8gICAgIElmICd1cCcsIHRoZSBpdGVtIHdpbGwgYmUgb3BlbmVkIGluIHRvcG1vc3QgcGFuZSBvZiB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSdzIGNvbHVtbi5cbiAgLy8gICAgIElmICdkb3duJywgdGhlIGl0ZW0gd2lsbCBiZSBvcGVuZWQgaW4gdGhlIGJvdHRvbW1vc3QgcGFuZSBvZiB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSdzIGNvbHVtbi4gSWYgb25seSBvbmUgcGFuZSBleGlzdHMgaW4gdGhlIGNvbHVtbiwgYSBuZXcgcGFuZSB3aWxsIGJlIGNyZWF0ZWQuXG4gIC8vICAgKiBgYWN0aXZhdGVQYW5lYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY2FsbCB7UGFuZTo6YWN0aXZhdGV9IG9uXG4gIC8vICAgICBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBhY3RpdmF0ZUl0ZW1gIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZUl0ZW19XG4gIC8vICAgICBvbiBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBwZW5kaW5nYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIHNob3VsZCBiZSBvcGVuZWRcbiAgLy8gICAgIGluIGEgcGVuZGluZyBzdGF0ZS4gRXhpc3RpbmcgcGVuZGluZyBpdGVtcyBpbiBhIHBhbmUgYXJlIHJlcGxhY2VkIHdpdGhcbiAgLy8gICAgIG5ldyBwZW5kaW5nIGl0ZW1zIHdoZW4gdGhleSBhcmUgb3BlbmVkLlxuICAvLyAgICogYHNlYXJjaEFsbFBhbmVzYCBBIHtCb29sZWFufS4gSWYgYHRydWVgLCB0aGUgd29ya3NwYWNlIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgICAgYWN0aXZhdGUgYW4gZXhpc3RpbmcgaXRlbSBmb3IgdGhlIGdpdmVuIFVSSSBvbiBhbnkgcGFuZS5cbiAgLy8gICAgIElmIGBmYWxzZWAsIG9ubHkgdGhlIGFjdGl2ZSBwYW5lIHdpbGwgYmUgc2VhcmNoZWQgZm9yXG4gIC8vICAgICBhbiBleGlzdGluZyBpdGVtIGZvciB0aGUgc2FtZSBVUkkuIERlZmF1bHRzIHRvIGBmYWxzZWAuXG4gIC8vICAgKiBgbG9jYXRpb25gIChvcHRpb25hbCkgQSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBuYW1lIG9mIHRoZSBsb2NhdGlvblxuICAvLyAgICAgaW4gd2hpY2ggdGhpcyBpdGVtIHNob3VsZCBiZSBvcGVuZWQgKG9uZSBvZiBcImxlZnRcIiwgXCJyaWdodFwiLCBcImJvdHRvbVwiLFxuICAvLyAgICAgb3IgXCJjZW50ZXJcIikuIElmIG9taXR0ZWQsIEF0b20gd2lsbCBmYWxsIGJhY2sgdG8gdGhlIGxhc3QgbG9jYXRpb24gaW5cbiAgLy8gICAgIHdoaWNoIGEgdXNlciBoYXMgcGxhY2VkIGFuIGl0ZW0gd2l0aCB0aGUgc2FtZSBVUkkgb3IsIGlmIHRoaXMgaXMgYSBuZXdcbiAgLy8gICAgIFVSSSwgdGhlIGRlZmF1bHQgbG9jYXRpb24gc3BlY2lmaWVkIGJ5IHRoZSBpdGVtLiBOT1RFOiBUaGlzIG9wdGlvblxuICAvLyAgICAgc2hvdWxkIGFsbW9zdCBhbHdheXMgYmUgb21pdHRlZCB0byBob25vciB1c2VyIHByZWZlcmVuY2UuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UHJvbWlzZX0gdGhhdCByZXNvbHZlcyB0byB0aGUge1RleHRFZGl0b3J9IGZvciB0aGUgZmlsZSBVUkkuXG4gIGFzeW5jIG9wZW4gKGl0ZW1PclVSSSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHVyaSwgaXRlbVxuICAgIGlmICh0eXBlb2YgaXRlbU9yVVJJID09PSAnc3RyaW5nJykge1xuICAgICAgdXJpID0gdGhpcy5wcm9qZWN0LnJlc29sdmVQYXRoKGl0ZW1PclVSSSlcbiAgICB9IGVsc2UgaWYgKGl0ZW1PclVSSSkge1xuICAgICAgaXRlbSA9IGl0ZW1PclVSSVxuICAgICAgaWYgKHR5cGVvZiBpdGVtLmdldFVSSSA9PT0gJ2Z1bmN0aW9uJykgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgIH1cblxuICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdjb3JlLmFsbG93UGVuZGluZ1BhbmVJdGVtcycpKSB7XG4gICAgICBvcHRpb25zLnBlbmRpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEF2b2lkIGFkZGluZyBVUkxzIGFzIHJlY2VudCBkb2N1bWVudHMgdG8gd29yay1hcm91bmQgdGhpcyBTcG90bGlnaHQgY3Jhc2g6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTAwNzFcbiAgICBpZiAodXJpICYmICghdXJsLnBhcnNlKHVyaSkucHJvdG9jb2wgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykpIHtcbiAgICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5hZGRSZWNlbnREb2N1bWVudCh1cmkpXG4gICAgfVxuXG4gICAgbGV0IHBhbmUsIGl0ZW1FeGlzdHNJbldvcmtzcGFjZVxuXG4gICAgLy8gVHJ5IHRvIGZpbmQgYW4gZXhpc3RpbmcgaXRlbSBpbiB0aGUgd29ya3NwYWNlLlxuICAgIGlmIChpdGVtIHx8IHVyaSkge1xuICAgICAgaWYgKG9wdGlvbnMucGFuZSkge1xuICAgICAgICBwYW5lID0gb3B0aW9ucy5wYW5lXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc2VhcmNoQWxsUGFuZXMpIHtcbiAgICAgICAgcGFuZSA9IGl0ZW0gPyB0aGlzLnBhbmVGb3JJdGVtKGl0ZW0pIDogdGhpcy5wYW5lRm9yVVJJKHVyaSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIGFuIGl0ZW0gd2l0aCB0aGUgZ2l2ZW4gVVJJIGlzIGFscmVhZHkgaW4gdGhlIHdvcmtzcGFjZSwgYXNzdW1lXG4gICAgICAgIC8vIHRoYXQgaXRlbSdzIHBhbmUgY29udGFpbmVyIGlzIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIHRoYXQgVVJJLlxuICAgICAgICBsZXQgY29udGFpbmVyXG4gICAgICAgIGlmICh1cmkpIGNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lckZvclVSSSh1cmkpXG4gICAgICAgIGlmICghY29udGFpbmVyKSBjb250YWluZXIgPSB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKVxuXG4gICAgICAgIC8vIFRoZSBgc3BsaXRgIG9wdGlvbiBhZmZlY3RzIHdoZXJlIHdlIHNlYXJjaCBmb3IgdGhlIGl0ZW0uXG4gICAgICAgIHBhbmUgPSBjb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5zcGxpdCkge1xuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZExlZnRtb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIHBhbmUgPSBwYW5lLmZpbmRSaWdodG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZFRvcG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgICBwYW5lID0gcGFuZS5maW5kQm90dG9tbW9zdFNpYmxpbmcoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGFuZSkge1xuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgIGl0ZW1FeGlzdHNJbldvcmtzcGFjZSA9IHBhbmUuZ2V0SXRlbXMoKS5pbmNsdWRlcyhpdGVtKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0gPSBwYW5lLml0ZW1Gb3JVUkkodXJpKVxuICAgICAgICAgIGl0ZW1FeGlzdHNJbldvcmtzcGFjZSA9IGl0ZW0gIT0gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIGFuIGl0ZW0gYXQgdGhpcyBzdGFnZSwgd2Ugd29uJ3QgbmVlZCB0byBkbyBhbiBhc3luY1xuICAgIC8vIGxvb2t1cCBvZiB0aGUgVVJJLCBzbyB3ZSB5aWVsZCB0aGUgZXZlbnQgbG9vcCB0byBlbnN1cmUgdGhpcyBtZXRob2RcbiAgICAvLyBpcyBjb25zaXN0ZW50bHkgYXN5bmNocm9ub3VzLlxuICAgIGlmIChpdGVtKSBhd2FpdCBQcm9taXNlLnJlc29sdmUoKVxuXG4gICAgaWYgKCFpdGVtRXhpc3RzSW5Xb3Jrc3BhY2UpIHtcbiAgICAgIGl0ZW0gPSBpdGVtIHx8IGF3YWl0IHRoaXMuY3JlYXRlSXRlbUZvclVSSSh1cmksIG9wdGlvbnMpXG4gICAgICBpZiAoIWl0ZW0pIHJldHVyblxuXG4gICAgICBpZiAob3B0aW9ucy5wYW5lKSB7XG4gICAgICAgIHBhbmUgPSBvcHRpb25zLnBhbmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb25cbiAgICAgICAgaWYgKCFsb2NhdGlvbiAmJiAhb3B0aW9ucy5zcGxpdCAmJiB1cmkgJiYgdGhpcy5lbmFibGVQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgIGxvY2F0aW9uID0gYXdhaXQgdGhpcy5pdGVtTG9jYXRpb25TdG9yZS5sb2FkKHVyaSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvY2F0aW9uICYmIHR5cGVvZiBpdGVtLmdldERlZmF1bHRMb2NhdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGxvY2F0aW9uID0gaXRlbS5nZXREZWZhdWx0TG9jYXRpb24oKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsb3dlZExvY2F0aW9ucyA9IHR5cGVvZiBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMgPT09ICdmdW5jdGlvbicgPyBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMoKSA6IEFMTF9MT0NBVElPTlNcbiAgICAgICAgbG9jYXRpb24gPSBhbGxvd2VkTG9jYXRpb25zLmluY2x1ZGVzKGxvY2F0aW9uKSA/IGxvY2F0aW9uIDogYWxsb3dlZExvY2F0aW9uc1swXVxuXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lcnNbbG9jYXRpb25dIHx8IHRoaXMuZ2V0Q2VudGVyKClcbiAgICAgICAgcGFuZSA9IGNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLnNwbGl0KSB7XG4gICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBwYW5lID0gcGFuZS5maW5kTGVmdG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZE9yQ3JlYXRlUmlnaHRtb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICAgIHBhbmUgPSBwYW5lLmZpbmRUb3Btb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZE9yQ3JlYXRlQm90dG9tbW9zdFNpYmxpbmcoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5wZW5kaW5nICYmIChwYW5lLmdldFBlbmRpbmdJdGVtKCkgPT09IGl0ZW0pKSB7XG4gICAgICBwYW5lLmNsZWFyUGVuZGluZ0l0ZW0oKVxuICAgIH1cblxuICAgIHRoaXMuaXRlbU9wZW5lZChpdGVtKVxuXG4gICAgaWYgKG9wdGlvbnMuYWN0aXZhdGVJdGVtID09PSBmYWxzZSkge1xuICAgICAgcGFuZS5hZGRJdGVtKGl0ZW0sIHtwZW5kaW5nOiBvcHRpb25zLnBlbmRpbmd9KVxuICAgIH0gZWxzZSB7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShpdGVtLCB7cGVuZGluZzogb3B0aW9ucy5wZW5kaW5nfSlcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hY3RpdmF0ZVBhbmUgIT09IGZhbHNlKSB7XG4gICAgICBwYW5lLmFjdGl2YXRlKClcbiAgICB9XG5cbiAgICBsZXQgaW5pdGlhbENvbHVtbiA9IDBcbiAgICBsZXQgaW5pdGlhbExpbmUgPSAwXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4ob3B0aW9ucy5pbml0aWFsTGluZSkpIHtcbiAgICAgIGluaXRpYWxMaW5lID0gb3B0aW9ucy5pbml0aWFsTGluZVxuICAgIH1cbiAgICBpZiAoIU51bWJlci5pc05hTihvcHRpb25zLmluaXRpYWxDb2x1bW4pKSB7XG4gICAgICBpbml0aWFsQ29sdW1uID0gb3B0aW9ucy5pbml0aWFsQ29sdW1uXG4gICAgfVxuICAgIGlmIChpbml0aWFsTGluZSA+PSAwIHx8IGluaXRpYWxDb2x1bW4gPj0gMCkge1xuICAgICAgaWYgKHR5cGVvZiBpdGVtLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGl0ZW0uc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1uXSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW9wZW4nLCB7dXJpLCBwYW5lLCBpdGVtLCBpbmRleH0pXG4gICAgcmV0dXJuIGl0ZW1cbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogU2VhcmNoIHRoZSB3b3Jrc3BhY2UgZm9yIGl0ZW1zIG1hdGNoaW5nIHRoZSBnaXZlbiBVUkkgYW5kIGhpZGUgdGhlbS5cbiAgLy9cbiAgLy8gKiBgaXRlbU9yVVJJYCBUaGUgaXRlbSB0byBoaWRlIG9yIGEge1N0cmluZ30gY29udGFpbmluZyB0aGUgVVJJXG4gIC8vICAgb2YgdGhlIGl0ZW0gdG8gaGlkZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgYW55IGl0ZW1zIHdlcmUgZm91bmQgKGFuZCBoaWRkZW4pLlxuICBoaWRlIChpdGVtT3JVUkkpIHtcbiAgICBsZXQgZm91bmRJdGVtcyA9IGZhbHNlXG5cbiAgICAvLyBJZiBhbnkgdmlzaWJsZSBpdGVtIGhhcyB0aGUgZ2l2ZW4gVVJJLCBoaWRlIGl0XG4gICAgZm9yIChjb25zdCBjb250YWluZXIgb2YgdGhpcy5nZXRQYW5lQ29udGFpbmVycygpKSB7XG4gICAgICBjb25zdCBpc0NlbnRlciA9IGNvbnRhaW5lciA9PT0gdGhpcy5nZXRDZW50ZXIoKVxuICAgICAgaWYgKGlzQ2VudGVyIHx8IGNvbnRhaW5lci5pc1Zpc2libGUoKSkge1xuICAgICAgICBmb3IgKGNvbnN0IHBhbmUgb2YgY29udGFpbmVyLmdldFBhbmVzKCkpIHtcbiAgICAgICAgICBjb25zdCBhY3RpdmVJdGVtID0gcGFuZS5nZXRBY3RpdmVJdGVtKClcbiAgICAgICAgICBjb25zdCBmb3VuZEl0ZW0gPSAoXG4gICAgICAgICAgICBhY3RpdmVJdGVtICE9IG51bGwgJiYgKFxuICAgICAgICAgICAgICBhY3RpdmVJdGVtID09PSBpdGVtT3JVUkkgfHxcbiAgICAgICAgICAgICAgdHlwZW9mIGFjdGl2ZUl0ZW0uZ2V0VVJJID09PSAnZnVuY3Rpb24nICYmIGFjdGl2ZUl0ZW0uZ2V0VVJJKCkgPT09IGl0ZW1PclVSSVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgICBpZiAoZm91bmRJdGVtKSB7XG4gICAgICAgICAgICBmb3VuZEl0ZW1zID0gdHJ1ZVxuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgcmVhbGx5IGhpZGUgdGhlIGNlbnRlciBzbyB3ZSBqdXN0IGRlc3Ryb3kgdGhlIGl0ZW0uXG4gICAgICAgICAgICBpZiAoaXNDZW50ZXIpIHtcbiAgICAgICAgICAgICAgcGFuZS5kZXN0cm95SXRlbShhY3RpdmVJdGVtKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29udGFpbmVyLmhpZGUoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3VuZEl0ZW1zXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IFNlYXJjaCB0aGUgd29ya3NwYWNlIGZvciBpdGVtcyBtYXRjaGluZyB0aGUgZ2l2ZW4gVVJJLiBJZiBhbnkgYXJlIGZvdW5kLCBoaWRlIHRoZW0uXG4gIC8vIE90aGVyd2lzZSwgb3BlbiB0aGUgVVJMLlxuICAvL1xuICAvLyAqIGBpdGVtT3JVUklgIChvcHRpb25hbCkgVGhlIGl0ZW0gdG8gdG9nZ2xlIG9yIGEge1N0cmluZ30gY29udGFpbmluZyB0aGUgVVJJXG4gIC8vICAgb2YgdGhlIGl0ZW0gdG8gdG9nZ2xlLlxuICAvL1xuICAvLyBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGl0ZW0gaXMgc2hvd24gb3IgaGlkZGVuLlxuICB0b2dnbGUgKGl0ZW1PclVSSSkge1xuICAgIGlmICh0aGlzLmhpZGUoaXRlbU9yVVJJKSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4oaXRlbU9yVVJJLCB7c2VhcmNoQWxsUGFuZXM6IHRydWV9KVxuICAgIH1cbiAgfVxuXG4gIC8vIE9wZW4gQXRvbSdzIGxpY2Vuc2UgaW4gdGhlIGFjdGl2ZSBwYW5lLlxuICBvcGVuTGljZW5zZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3BlbignL3Vzci9zaGFyZS9saWNlbnNlcy9hdG9tL0xJQ0VOU0UubWQnKVxuICB9XG5cbiAgLy8gU3luY2hyb25vdXNseSBvcGVuIHRoZSBnaXZlbiBVUkkgaW4gdGhlIGFjdGl2ZSBwYW5lLiAqKk9ubHkgdXNlIHRoaXMgbWV0aG9kXG4gIC8vIGluIHNwZWNzLiBDYWxsaW5nIHRoaXMgaW4gcHJvZHVjdGlvbiBjb2RlIHdpbGwgYmxvY2sgdGhlIFVJIHRocmVhZCBhbmRcbiAgLy8gZXZlcnlvbmUgd2lsbCBiZSBtYWQgYXQgeW91LioqXG4gIC8vXG4gIC8vICogYHVyaWAgQSB7U3RyaW5nfSBjb250YWluaW5nIGEgVVJJLlxuICAvLyAqIGBvcHRpb25zYCBBbiBvcHRpb25hbCBvcHRpb25zIHtPYmplY3R9XG4gIC8vICAgKiBgaW5pdGlhbExpbmVgIEEge051bWJlcn0gaW5kaWNhdGluZyB3aGljaCByb3cgdG8gbW92ZSB0aGUgY3Vyc29yIHRvXG4gIC8vICAgICBpbml0aWFsbHkuIERlZmF1bHRzIHRvIGAwYC5cbiAgLy8gICAqIGBpbml0aWFsQ29sdW1uYCBBIHtOdW1iZXJ9IGluZGljYXRpbmcgd2hpY2ggY29sdW1uIHRvIG1vdmUgdGhlIGN1cnNvciB0b1xuICAvLyAgICAgaW5pdGlhbGx5LiBEZWZhdWx0cyB0byBgMGAuXG4gIC8vICAgKiBgYWN0aXZhdGVQYW5lYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY2FsbCB7UGFuZTo6YWN0aXZhdGV9IG9uXG4gIC8vICAgICB0aGUgY29udGFpbmluZyBwYW5lLiBEZWZhdWx0cyB0byBgdHJ1ZWAuXG4gIC8vICAgKiBgYWN0aXZhdGVJdGVtYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY2FsbCB7UGFuZTo6YWN0aXZhdGVJdGVtfVxuICAvLyAgICAgb24gY29udGFpbmluZyBwYW5lLiBEZWZhdWx0cyB0byBgdHJ1ZWAuXG4gIG9wZW5TeW5jICh1cmlfID0gJycsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHtpbml0aWFsTGluZSwgaW5pdGlhbENvbHVtbn0gPSBvcHRpb25zXG4gICAgY29uc3QgYWN0aXZhdGVQYW5lID0gb3B0aW9ucy5hY3RpdmF0ZVBhbmUgIT0gbnVsbCA/IG9wdGlvbnMuYWN0aXZhdGVQYW5lIDogdHJ1ZVxuICAgIGNvbnN0IGFjdGl2YXRlSXRlbSA9IG9wdGlvbnMuYWN0aXZhdGVJdGVtICE9IG51bGwgPyBvcHRpb25zLmFjdGl2YXRlSXRlbSA6IHRydWVcblxuICAgIGNvbnN0IHVyaSA9IHRoaXMucHJvamVjdC5yZXNvbHZlUGF0aCh1cmlfKVxuICAgIGxldCBpdGVtID0gdGhpcy5nZXRBY3RpdmVQYW5lKCkuaXRlbUZvclVSSSh1cmkpXG4gICAgaWYgKHVyaSAmJiAoaXRlbSA9PSBudWxsKSkge1xuICAgICAgZm9yIChjb25zdCBvcGVuZXIgb2YgdGhpcy5nZXRPcGVuZXJzKCkpIHtcbiAgICAgICAgaXRlbSA9IG9wZW5lcih1cmksIG9wdGlvbnMpXG4gICAgICAgIGlmIChpdGVtKSBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXRlbSA9PSBudWxsKSB7XG4gICAgICBpdGVtID0gdGhpcy5wcm9qZWN0Lm9wZW5TeW5jKHVyaSwge2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1ufSlcbiAgICB9XG5cbiAgICBpZiAoYWN0aXZhdGVJdGVtKSB7XG4gICAgICB0aGlzLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZUl0ZW0oaXRlbSlcbiAgICB9XG4gICAgdGhpcy5pdGVtT3BlbmVkKGl0ZW0pXG4gICAgaWYgKGFjdGl2YXRlUGFuZSkge1xuICAgICAgdGhpcy5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuICAgIH1cbiAgICByZXR1cm4gaXRlbVxuICB9XG5cbiAgb3BlblVSSUluUGFuZSAodXJpLCBwYW5lKSB7XG4gICAgcmV0dXJuIHRoaXMub3Blbih1cmksIHtwYW5lfSlcbiAgfVxuXG4gIC8vIFB1YmxpYzogQ3JlYXRlcyBhIG5ldyBpdGVtIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHByb3ZpZGVkIFVSSS5cbiAgLy9cbiAgLy8gSWYgbm8gVVJJIGlzIGdpdmVuLCBvciBubyByZWdpc3RlcmVkIG9wZW5lciBjYW4gb3BlbiB0aGUgVVJJLCBhIG5ldyBlbXB0eVxuICAvLyB7VGV4dEVkaXRvcn0gd2lsbCBiZSBjcmVhdGVkLlxuICAvL1xuICAvLyAqIGB1cmlgIEEge1N0cmluZ30gY29udGFpbmluZyBhIFVSSS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQcm9taXNlfSB0aGF0IHJlc29sdmVzIHRvIHRoZSB7VGV4dEVkaXRvcn0gKG9yIG90aGVyIGl0ZW0pIGZvciB0aGUgZ2l2ZW4gVVJJLlxuICBjcmVhdGVJdGVtRm9yVVJJICh1cmksIG9wdGlvbnMpIHtcbiAgICBpZiAodXJpICE9IG51bGwpIHtcbiAgICAgIGZvciAobGV0IG9wZW5lciBvZiB0aGlzLmdldE9wZW5lcnMoKSkge1xuICAgICAgICBjb25zdCBpdGVtID0gb3BlbmVyKHVyaSwgb3B0aW9ucylcbiAgICAgICAgaWYgKGl0ZW0gIT0gbnVsbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShpdGVtKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuVGV4dEZpbGUodXJpLCBvcHRpb25zKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzd2l0Y2ggKGVycm9yLmNvZGUpIHtcbiAgICAgICAgY2FzZSAnQ0FOQ0VMTEVEJzpcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgY2FzZSAnRUFDQ0VTJzpcbiAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbk1hbmFnZXIuYWRkV2FybmluZyhgUGVybWlzc2lvbiBkZW5pZWQgJyR7ZXJyb3IucGF0aH0nYClcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgY2FzZSAnRVBFUk0nOlxuICAgICAgICBjYXNlICdFQlVTWSc6XG4gICAgICAgIGNhc2UgJ0VOWElPJzpcbiAgICAgICAgY2FzZSAnRUlPJzpcbiAgICAgICAgY2FzZSAnRU5PVENPTk4nOlxuICAgICAgICBjYXNlICdVTktOT1dOJzpcbiAgICAgICAgY2FzZSAnRUNPTk5SRVNFVCc6XG4gICAgICAgIGNhc2UgJ0VJTlZBTCc6XG4gICAgICAgIGNhc2UgJ0VNRklMRSc6XG4gICAgICAgIGNhc2UgJ0VOT1RESVInOlxuICAgICAgICBjYXNlICdFQUdBSU4nOlxuICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9uTWFuYWdlci5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBvcGVuICcke2Vycm9yLnBhdGggIT0gbnVsbCA/IGVycm9yLnBhdGggOiB1cml9J2AsXG4gICAgICAgICAgICB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlfVxuICAgICAgICAgIClcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9wZW5UZXh0RmlsZSAodXJpLCBvcHRpb25zKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLnByb2plY3QucmVzb2x2ZVBhdGgodXJpKVxuXG4gICAgaWYgKGZpbGVQYXRoICE9IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLmNsb3NlU3luYyhmcy5vcGVuU3luYyhmaWxlUGF0aCwgJ3InKSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIGFsbG93IEVOT0VOVCBlcnJvcnMgdG8gY3JlYXRlIGFuIGVkaXRvciBmb3IgcGF0aHMgdGhhdCBkb250IGV4aXN0XG4gICAgICAgIGlmIChlcnJvci5jb2RlICE9PSAnRU5PRU5UJykge1xuICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBmaWxlU2l6ZSA9IGZzLmdldFNpemVTeW5jKGZpbGVQYXRoKVxuXG4gICAgY29uc3QgbGFyZ2VGaWxlTW9kZSA9IGZpbGVTaXplID49ICgyICogMTA0ODU3NikgLy8gMk1CXG4gICAgaWYgKGZpbGVTaXplID49ICh0aGlzLmNvbmZpZy5nZXQoJ2NvcmUud2Fybk9uTGFyZ2VGaWxlTGltaXQnKSAqIDEwNDg1NzYpKSB7IC8vIDIwTUIgYnkgZGVmYXVsdFxuICAgICAgY29uc3QgY2hvaWNlID0gdGhpcy5hcHBsaWNhdGlvbkRlbGVnYXRlLmNvbmZpcm0oe1xuICAgICAgICBtZXNzYWdlOiAnQXRvbSB3aWxsIGJlIHVucmVzcG9uc2l2ZSBkdXJpbmcgdGhlIGxvYWRpbmcgb2YgdmVyeSBsYXJnZSBmaWxlcy4nLFxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6ICdEbyB5b3Ugc3RpbGwgd2FudCB0byBsb2FkIHRoaXMgZmlsZT8nLFxuICAgICAgICBidXR0b25zOiBbJ1Byb2NlZWQnLCAnQ2FuY2VsJ11cbiAgICAgIH0pXG4gICAgICBpZiAoY2hvaWNlID09PSAxKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKClcbiAgICAgICAgZXJyb3IuY29kZSA9ICdDQU5DRUxMRUQnXG4gICAgICAgIHRocm93IGVycm9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvamVjdC5idWZmZXJGb3JQYXRoKGZpbGVQYXRoLCBvcHRpb25zKVxuICAgICAgLnRoZW4oYnVmZmVyID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5LmJ1aWxkKE9iamVjdC5hc3NpZ24oe2J1ZmZlciwgbGFyZ2VGaWxlTW9kZSwgYXV0b0hlaWdodDogZmFsc2V9LCBvcHRpb25zKSlcbiAgICAgIH0pXG4gIH1cblxuICBoYW5kbGVHcmFtbWFyVXNlZCAoZ3JhbW1hcikge1xuICAgIGlmIChncmFtbWFyID09IG51bGwpIHsgcmV0dXJuIH1cbiAgICByZXR1cm4gdGhpcy5wYWNrYWdlTWFuYWdlci50cmlnZ2VyQWN0aXZhdGlvbkhvb2soYCR7Z3JhbW1hci5wYWNrYWdlTmFtZX06Z3JhbW1hci11c2VkYClcbiAgfVxuXG4gIC8vIFB1YmxpYzogUmV0dXJucyBhIHtCb29sZWFufSB0aGF0IGlzIGB0cnVlYCBpZiBgb2JqZWN0YCBpcyBhIGBUZXh0RWRpdG9yYC5cbiAgLy9cbiAgLy8gKiBgb2JqZWN0YCBBbiB7T2JqZWN0fSB5b3Ugd2FudCB0byBwZXJmb3JtIHRoZSBjaGVjayBhZ2FpbnN0LlxuICBpc1RleHRFZGl0b3IgKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgaW5zdGFuY2VvZiBUZXh0RWRpdG9yXG4gIH1cblxuICAvLyBFeHRlbmRlZDogQ3JlYXRlIGEgbmV3IHRleHQgZWRpdG9yLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1RleHRFZGl0b3J9LlxuICBidWlsZFRleHRFZGl0b3IgKHBhcmFtcykge1xuICAgIGNvbnN0IGVkaXRvciA9IHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5LmJ1aWxkKHBhcmFtcylcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICB0aGlzLnRleHRFZGl0b3JSZWdpc3RyeS5tYWludGFpbkdyYW1tYXIoZWRpdG9yKSxcbiAgICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5Lm1haW50YWluQ29uZmlnKGVkaXRvcilcbiAgICApXG4gICAgZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7IHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpIH0pXG4gICAgcmV0dXJuIGVkaXRvclxuICB9XG5cbiAgLy8gUHVibGljOiBBc3luY2hyb25vdXNseSByZW9wZW5zIHRoZSBsYXN0LWNsb3NlZCBpdGVtJ3MgVVJJIGlmIGl0IGhhc24ndCBhbHJlYWR5IGJlZW5cbiAgLy8gcmVvcGVuZWQuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UHJvbWlzZX0gdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBpdGVtIGlzIG9wZW5lZFxuICByZW9wZW5JdGVtICgpIHtcbiAgICBjb25zdCB1cmkgPSB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzLnBvcCgpXG4gICAgaWYgKHVyaSkge1xuICAgICAgcmV0dXJuIHRoaXMub3Blbih1cmkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgIH1cbiAgfVxuXG4gIC8vIFB1YmxpYzogUmVnaXN0ZXIgYW4gb3BlbmVyIGZvciBhIHVyaS5cbiAgLy9cbiAgLy8gV2hlbiBhIFVSSSBpcyBvcGVuZWQgdmlhIHtXb3Jrc3BhY2U6Om9wZW59LCBBdG9tIGxvb3BzIHRocm91Z2ggaXRzIHJlZ2lzdGVyZWRcbiAgLy8gb3BlbmVyIGZ1bmN0aW9ucyB1bnRpbCBvbmUgcmV0dXJucyBhIHZhbHVlIGZvciB0aGUgZ2l2ZW4gdXJpLlxuICAvLyBPcGVuZXJzIGFyZSBleHBlY3RlZCB0byByZXR1cm4gYW4gb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSBIVE1MRWxlbWVudCBvclxuICAvLyBhIG1vZGVsIHdoaWNoIGhhcyBhbiBhc3NvY2lhdGVkIHZpZXcgaW4gdGhlIHtWaWV3UmVnaXN0cnl9LlxuICAvLyBBIHtUZXh0RWRpdG9yfSB3aWxsIGJlIHVzZWQgaWYgbm8gb3BlbmVyIHJldHVybnMgYSB2YWx1ZS5cbiAgLy9cbiAgLy8gIyMgRXhhbXBsZXNcbiAgLy9cbiAgLy8gYGBgY29mZmVlXG4gIC8vIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpKSAtPlxuICAvLyAgIGlmIHBhdGguZXh0bmFtZSh1cmkpIGlzICcudG9tbCdcbiAgLy8gICAgIHJldHVybiBuZXcgVG9tbEVkaXRvcih1cmkpXG4gIC8vIGBgYFxuICAvL1xuICAvLyAqIGBvcGVuZXJgIEEge0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiBhIHBhdGggaXMgYmVpbmcgb3BlbmVkLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHJlbW92ZSB0aGVcbiAgLy8gb3BlbmVyLlxuICAvL1xuICAvLyBOb3RlIHRoYXQgdGhlIG9wZW5lciB3aWxsIGJlIGNhbGxlZCBpZiBhbmQgb25seSBpZiB0aGUgVVJJIGlzIG5vdCBhbHJlYWR5IG9wZW5cbiAgLy8gaW4gdGhlIGN1cnJlbnQgcGFuZS4gVGhlIHNlYXJjaEFsbFBhbmVzIGZsYWcgZXhwYW5kcyB0aGUgc2VhcmNoIGZyb20gdGhlXG4gIC8vIGN1cnJlbnQgcGFuZSB0byBhbGwgcGFuZXMuIElmIHlvdSB3aXNoIHRvIG9wZW4gYSB2aWV3IG9mIGEgZGlmZmVyZW50IHR5cGUgZm9yXG4gIC8vIGEgZmlsZSB0aGF0IGlzIGFscmVhZHkgb3BlbiwgY29uc2lkZXIgY2hhbmdpbmcgdGhlIHByb3RvY29sIG9mIHRoZSBVUkkuIEZvclxuICAvLyBleGFtcGxlLCBwZXJoYXBzIHlvdSB3aXNoIHRvIHByZXZpZXcgYSByZW5kZXJlZCB2ZXJzaW9uIG9mIHRoZSBmaWxlIGAvZm9vL2Jhci9iYXoucXV1eGBcbiAgLy8gdGhhdCBpcyBhbHJlYWR5IG9wZW4gaW4gYSB0ZXh0IGVkaXRvciB2aWV3LiBZb3UgY291bGQgc2lnbmFsIHRoaXMgYnkgY2FsbGluZ1xuICAvLyB7V29ya3NwYWNlOjpvcGVufSBvbiB0aGUgVVJJIGBxdXV4LXByZXZpZXc6Ly9mb28vYmFyL2Jhei5xdXV4YC4gVGhlbiB5b3VyIG9wZW5lclxuICAvLyBjYW4gY2hlY2sgdGhlIHByb3RvY29sIGZvciBxdXV4LXByZXZpZXcgYW5kIG9ubHkgaGFuZGxlIHRob3NlIFVSSXMgdGhhdCBtYXRjaC5cbiAgYWRkT3BlbmVyIChvcGVuZXIpIHtcbiAgICB0aGlzLm9wZW5lcnMucHVzaChvcGVuZXIpXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgXy5yZW1vdmUodGhpcy5vcGVuZXJzLCBvcGVuZXIpIH0pXG4gIH1cblxuICBnZXRPcGVuZXJzICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuZXJzXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBQYW5lIEl0ZW1zXG4gICovXG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYWxsIHBhbmUgaXRlbXMgaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7QXJyYXl9IG9mIGl0ZW1zLlxuICBnZXRQYW5lSXRlbXMgKCkge1xuICAgIHJldHVybiBfLmZsYXR0ZW4odGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLmdldFBhbmVJdGVtcygpKSlcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IHRoZSBhY3RpdmUge1BhbmV9J3MgYWN0aXZlIGl0ZW0uXG4gIC8vXG4gIC8vIFJldHVybnMgYW4gcGFuZSBpdGVtIHtPYmplY3R9LlxuICBnZXRBY3RpdmVQYW5lSXRlbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFsbCB0ZXh0IGVkaXRvcnMgaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtUZXh0RWRpdG9yfXMuXG4gIGdldFRleHRFZGl0b3JzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lSXRlbXMoKS5maWx0ZXIoaXRlbSA9PiBpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcilcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IHRoZSB3b3Jrc3BhY2UgY2VudGVyJ3MgYWN0aXZlIGl0ZW0gaWYgaXQgaXMgYSB7VGV4dEVkaXRvcn0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7VGV4dEVkaXRvcn0gb3IgYHVuZGVmaW5lZGAgaWYgdGhlIHdvcmtzcGFjZSBjZW50ZXIncyBjdXJyZW50XG4gIC8vIGFjdGl2ZSBpdGVtIGlzIG5vdCBhIHtUZXh0RWRpdG9yfS5cbiAgZ2V0QWN0aXZlVGV4dEVkaXRvciAoKSB7XG4gICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGlmIChhY3RpdmVJdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcikgeyByZXR1cm4gYWN0aXZlSXRlbSB9XG4gIH1cblxuICAvLyBTYXZlIGFsbCBwYW5lIGl0ZW1zLlxuICBzYXZlQWxsICgpIHtcbiAgICB0aGlzLmdldFBhbmVDb250YWluZXJzKCkuZm9yRWFjaChjb250YWluZXIgPT4ge1xuICAgICAgY29udGFpbmVyLnNhdmVBbGwoKVxuICAgIH0pXG4gIH1cblxuICBjb25maXJtQ2xvc2UgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT5cbiAgICAgIGNvbnRhaW5lci5jb25maXJtQ2xvc2Uob3B0aW9ucylcbiAgICApKS50aGVuKChyZXN1bHRzKSA9PiAhcmVzdWx0cy5pbmNsdWRlcyhmYWxzZSkpXG4gIH1cblxuICAvLyBTYXZlIHRoZSBhY3RpdmUgcGFuZSBpdGVtLlxuICAvL1xuICAvLyBJZiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBjdXJyZW50bHkgaGFzIGEgVVJJIGFjY29yZGluZyB0byB0aGUgaXRlbSdzXG4gIC8vIGAuZ2V0VVJJYCBtZXRob2QsIGNhbGxzIGAuc2F2ZWAgb24gdGhlIGl0ZW0uIE90aGVyd2lzZVxuICAvLyB7OjpzYXZlQWN0aXZlUGFuZUl0ZW1Bc30gIyB3aWxsIGJlIGNhbGxlZCBpbnN0ZWFkLiBUaGlzIG1ldGhvZCBkb2VzIG5vdGhpbmdcbiAgLy8gaWYgdGhlIGFjdGl2ZSBpdGVtIGRvZXMgbm90IGltcGxlbWVudCBhIGAuc2F2ZWAgbWV0aG9kLlxuICBzYXZlQWN0aXZlUGFuZUl0ZW0gKCkge1xuICAgIHJldHVybiB0aGlzLmdldENlbnRlcigpLmdldEFjdGl2ZVBhbmUoKS5zYXZlQWN0aXZlSXRlbSgpXG4gIH1cblxuICAvLyBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgcGF0aCBhbmQgc2F2ZSB0aGUgYWN0aXZlIHBhbmUgaXRlbSB0byBpdC5cbiAgLy9cbiAgLy8gT3BlbnMgYSBuYXRpdmUgZGlhbG9nIHdoZXJlIHRoZSB1c2VyIHNlbGVjdHMgYSBwYXRoIG9uIGRpc2ssIHRoZW4gY2FsbHNcbiAgLy8gYC5zYXZlQXNgIG9uIHRoZSBpdGVtIHdpdGggdGhlIHNlbGVjdGVkIHBhdGguIFRoaXMgbWV0aG9kIGRvZXMgbm90aGluZyBpZlxuICAvLyB0aGUgYWN0aXZlIGl0ZW0gZG9lcyBub3QgaW1wbGVtZW50IGEgYC5zYXZlQXNgIG1ldGhvZC5cbiAgc2F2ZUFjdGl2ZVBhbmVJdGVtQXMgKCkge1xuICAgIHRoaXMuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZSgpLnNhdmVBY3RpdmVJdGVtQXMoKVxuICB9XG5cbiAgLy8gRGVzdHJveSAoY2xvc2UpIHRoZSBhY3RpdmUgcGFuZSBpdGVtLlxuICAvL1xuICAvLyBSZW1vdmVzIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGFuZCBjYWxscyB0aGUgYC5kZXN0cm95YCBtZXRob2Qgb24gaXQgaWYgb25lIGlzXG4gIC8vIGRlZmluZWQuXG4gIGRlc3Ryb3lBY3RpdmVQYW5lSXRlbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmVzXG4gICovXG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUgbW9zdCByZWNlbnRseSBmb2N1c2VkIHBhbmUgY29udGFpbmVyLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0RvY2t9IG9yIHRoZSB7V29ya3NwYWNlQ2VudGVyfS5cbiAgZ2V0QWN0aXZlUGFuZUNvbnRhaW5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lclxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCBhbGwgcGFuZXMgaW4gdGhlIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtQYW5lfXMuXG4gIGdldFBhbmVzICgpIHtcbiAgICByZXR1cm4gXy5mbGF0dGVuKHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5nZXRQYW5lcygpKSlcbiAgfVxuXG4gIGdldFZpc2libGVQYW5lcyAoKSB7XG4gICAgcmV0dXJuIF8uZmxhdHRlbih0aGlzLmdldFZpc2libGVQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLmdldFBhbmVzKCkpKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUgYWN0aXZlIHtQYW5lfS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lfS5cbiAgZ2V0QWN0aXZlUGFuZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpLmdldEFjdGl2ZVBhbmUoKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IE1ha2UgdGhlIG5leHQgcGFuZSBhY3RpdmUuXG4gIGFjdGl2YXRlTmV4dFBhbmUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKS5hY3RpdmF0ZU5leHRQYW5lKClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBNYWtlIHRoZSBwcmV2aW91cyBwYW5lIGFjdGl2ZS5cbiAgYWN0aXZhdGVQcmV2aW91c1BhbmUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKS5hY3RpdmF0ZVByZXZpb3VzUGFuZSgpXG4gIH1cblxuICAvLyBFeHRlbmRlZDogR2V0IHRoZSBmaXJzdCBwYW5lIGNvbnRhaW5lciB0aGF0IGNvbnRhaW5zIGFuIGl0ZW0gd2l0aCB0aGUgZ2l2ZW5cbiAgLy8gVVJJLlxuICAvL1xuICAvLyAqIGB1cmlgIHtTdHJpbmd9IHVyaVxuICAvL1xuICAvLyBSZXR1cm5zIGEge0RvY2t9LCB0aGUge1dvcmtzcGFjZUNlbnRlcn0sIG9yIGB1bmRlZmluZWRgIGlmIG5vIGl0ZW0gZXhpc3RzXG4gIC8vIHdpdGggdGhlIGdpdmVuIFVSSS5cbiAgcGFuZUNvbnRhaW5lckZvclVSSSAodXJpKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5maW5kKGNvbnRhaW5lciA9PiBjb250YWluZXIucGFuZUZvclVSSSh1cmkpKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUgZmlyc3QgcGFuZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgZ2l2ZW4gaXRlbS5cbiAgLy9cbiAgLy8gKiBgaXRlbWAgdGhlIEl0ZW0gdGhhdCB0aGUgcmV0dXJuZWQgcGFuZSBjb250YWluZXIgbXVzdCBjb250YWluLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0RvY2t9LCB0aGUge1dvcmtzcGFjZUNlbnRlcn0sIG9yIGB1bmRlZmluZWRgIGlmIG5vIGl0ZW0gZXhpc3RzXG4gIC8vIHdpdGggdGhlIGdpdmVuIFVSSS5cbiAgcGFuZUNvbnRhaW5lckZvckl0ZW0gKHVyaSkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVDb250YWluZXJzKCkuZmluZChjb250YWluZXIgPT4gY29udGFpbmVyLnBhbmVGb3JJdGVtKHVyaSkpXG4gIH1cblxuICAvLyBFeHRlbmRlZDogR2V0IHRoZSBmaXJzdCB7UGFuZX0gdGhhdCBjb250YWlucyBhbiBpdGVtIHdpdGggdGhlIGdpdmVuIFVSSS5cbiAgLy9cbiAgLy8gKiBgdXJpYCB7U3RyaW5nfSB1cmlcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lfSBvciBgdW5kZWZpbmVkYCBpZiBubyBpdGVtIGV4aXN0cyB3aXRoIHRoZSBnaXZlbiBVUkkuXG4gIHBhbmVGb3JVUkkgKHVyaSkge1xuICAgIGZvciAobGV0IGxvY2F0aW9uIG9mIHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKSkge1xuICAgICAgY29uc3QgcGFuZSA9IGxvY2F0aW9uLnBhbmVGb3JVUkkodXJpKVxuICAgICAgaWYgKHBhbmUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcGFuZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBHZXQgdGhlIHtQYW5lfSBjb250YWluaW5nIHRoZSBnaXZlbiBpdGVtLlxuICAvL1xuICAvLyAqIGBpdGVtYCB0aGUgSXRlbSB0aGF0IHRoZSByZXR1cm5lZCBwYW5lIG11c3QgY29udGFpbi5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lfSBvciBgdW5kZWZpbmVkYCBpZiBubyBwYW5lIGV4aXN0cyBmb3IgdGhlIGdpdmVuIGl0ZW0uXG4gIHBhbmVGb3JJdGVtIChpdGVtKSB7XG4gICAgZm9yIChsZXQgbG9jYXRpb24gb2YgdGhpcy5nZXRQYW5lQ29udGFpbmVycygpKSB7XG4gICAgICBjb25zdCBwYW5lID0gbG9jYXRpb24ucGFuZUZvckl0ZW0oaXRlbSlcbiAgICAgIGlmIChwYW5lICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHBhbmVcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBEZXN0cm95IChjbG9zZSkgdGhlIGFjdGl2ZSBwYW5lLlxuICBkZXN0cm95QWN0aXZlUGFuZSAoKSB7XG4gICAgY29uc3QgYWN0aXZlUGFuZSA9IHRoaXMuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaWYgKGFjdGl2ZVBhbmUgIT0gbnVsbCkge1xuICAgICAgYWN0aXZlUGFuZS5kZXN0cm95KClcbiAgICB9XG4gIH1cblxuICAvLyBDbG9zZSB0aGUgYWN0aXZlIGNlbnRlciBwYW5lIGl0ZW0sIG9yIHRoZSBhY3RpdmUgY2VudGVyIHBhbmUgaWYgaXQgaXNcbiAgLy8gZW1wdHksIG9yIHRoZSBjdXJyZW50IHdpbmRvdyBpZiB0aGVyZSBpcyBvbmx5IHRoZSBlbXB0eSByb290IHBhbmUuXG4gIGNsb3NlQWN0aXZlUGFuZUl0ZW1PckVtcHR5UGFuZU9yV2luZG93ICgpIHtcbiAgICBpZiAodGhpcy5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpICE9IG51bGwpIHtcbiAgICAgIHRoaXMuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0Q2VudGVyKCkuZ2V0UGFuZXMoKS5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLmdldENlbnRlcigpLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlnLmdldCgnY29yZS5jbG9zZUVtcHR5V2luZG93cycpKSB7XG4gICAgICBhdG9tLmNsb3NlKClcbiAgICB9XG4gIH1cblxuICAvLyBJbmNyZWFzZSB0aGUgZWRpdG9yIGZvbnQgc2l6ZSBieSAxcHguXG4gIGluY3JlYXNlRm9udFNpemUgKCkge1xuICAgIHRoaXMuY29uZmlnLnNldCgnZWRpdG9yLmZvbnRTaXplJywgdGhpcy5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKSArIDEpXG4gIH1cblxuICAvLyBEZWNyZWFzZSB0aGUgZWRpdG9yIGZvbnQgc2l6ZSBieSAxcHguXG4gIGRlY3JlYXNlRm9udFNpemUgKCkge1xuICAgIGNvbnN0IGZvbnRTaXplID0gdGhpcy5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKVxuICAgIGlmIChmb250U2l6ZSA+IDEpIHtcbiAgICAgIHRoaXMuY29uZmlnLnNldCgnZWRpdG9yLmZvbnRTaXplJywgZm9udFNpemUgLSAxKVxuICAgIH1cbiAgfVxuXG4gIC8vIFJlc3RvcmUgdG8gdGhlIHdpbmRvdydzIG9yaWdpbmFsIGVkaXRvciBmb250IHNpemUuXG4gIHJlc2V0Rm9udFNpemUgKCkge1xuICAgIGlmICh0aGlzLm9yaWdpbmFsRm9udFNpemUpIHtcbiAgICAgIHRoaXMuY29uZmlnLnNldCgnZWRpdG9yLmZvbnRTaXplJywgdGhpcy5vcmlnaW5hbEZvbnRTaXplKVxuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmliZVRvRm9udFNpemUgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5vbkRpZENoYW5nZSgnZWRpdG9yLmZvbnRTaXplJywgKHtvbGRWYWx1ZX0pID0+IHtcbiAgICAgIGlmICh0aGlzLm9yaWdpbmFsRm9udFNpemUgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLm9yaWdpbmFsRm9udFNpemUgPSBvbGRWYWx1ZVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvLyBSZW1vdmVzIHRoZSBpdGVtJ3MgdXJpIGZyb20gdGhlIGxpc3Qgb2YgcG90ZW50aWFsIGl0ZW1zIHRvIHJlb3Blbi5cbiAgaXRlbU9wZW5lZCAoaXRlbSkge1xuICAgIGxldCB1cmlcbiAgICBpZiAodHlwZW9mIGl0ZW0uZ2V0VVJJID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB1cmkgPSBpdGVtLmdldFVSSSgpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaXRlbS5nZXRVcmkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHVyaSA9IGl0ZW0uZ2V0VXJpKClcbiAgICB9XG5cbiAgICBpZiAodXJpICE9IG51bGwpIHtcbiAgICAgIF8ucmVtb3ZlKHRoaXMuZGVzdHJveWVkSXRlbVVSSXMsIHVyaSlcbiAgICB9XG4gIH1cblxuICAvLyBBZGRzIHRoZSBkZXN0cm95ZWQgaXRlbSdzIHVyaSB0byB0aGUgbGlzdCBvZiBpdGVtcyB0byByZW9wZW4uXG4gIGRpZERlc3Ryb3lQYW5lSXRlbSAoe2l0ZW19KSB7XG4gICAgbGV0IHVyaVxuICAgIGlmICh0eXBlb2YgaXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHVyaSA9IGl0ZW0uZ2V0VVJJKClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtLmdldFVyaSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdXJpID0gaXRlbS5nZXRVcmkoKVxuICAgIH1cblxuICAgIGlmICh1cmkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5kZXN0cm95ZWRJdGVtVVJJcy5wdXNoKHVyaSlcbiAgICB9XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgTW9kZWwgc3VwZXJjbGFzcyB3aGVuIGRlc3Ryb3llZFxuICBkZXN0cm95ZWQgKCkge1xuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyLmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdC5kZXN0cm95KClcbiAgICB0aGlzLnBhbmVDb250YWluZXJzLnJpZ2h0LmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tLmRlc3Ryb3koKVxuICAgIHRoaXMuY2FuY2VsU3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0KClcbiAgICBpZiAodGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gICAgICB0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmUgTG9jYXRpb25zXG4gICovXG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIHtXb3Jrc3BhY2VDZW50ZXJ9IGF0IHRoZSBjZW50ZXIgb2YgdGhlIGVkaXRvciB3aW5kb3cuXG4gIGdldENlbnRlciAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCB0aGUge0RvY2t9IHRvIHRoZSBsZWZ0IG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRMZWZ0RG9jayAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdFxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIHtEb2NrfSB0byB0aGUgcmlnaHQgb2YgdGhlIGVkaXRvciB3aW5kb3cuXG4gIGdldFJpZ2h0RG9jayAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHRcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IHRoZSB7RG9ja30gYmVsb3cgdGhlIGVkaXRvciB3aW5kb3cuXG4gIGdldEJvdHRvbURvY2sgKCkge1xuICAgIHJldHVybiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbVxuICB9XG5cbiAgZ2V0UGFuZUNvbnRhaW5lcnMgKCkge1xuICAgIHJldHVybiBbXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlcixcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdCxcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQsXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbVxuICAgIF1cbiAgfVxuXG4gIGdldFZpc2libGVQYW5lQ29udGFpbmVycyAoKSB7XG4gICAgY29uc3QgY2VudGVyID0gdGhpcy5nZXRDZW50ZXIoKVxuICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lQ29udGFpbmVycygpXG4gICAgICAuZmlsdGVyKGNvbnRhaW5lciA9PiBjb250YWluZXIgPT09IGNlbnRlciB8fCBjb250YWluZXIuaXNWaXNpYmxlKCkpXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBQYW5lbHNcblxuICBQYW5lbHMgYXJlIHVzZWQgdG8gZGlzcGxheSBVSSByZWxhdGVkIHRvIGFuIGVkaXRvciB3aW5kb3cuIFRoZXkgYXJlIHBsYWNlZCBhdCBvbmUgb2YgdGhlIGZvdXJcbiAgZWRnZXMgb2YgdGhlIHdpbmRvdzogbGVmdCwgcmlnaHQsIHRvcCBvciBib3R0b20uIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBwYW5lbHMgb24gdGhlIHNhbWUgd2luZG93XG4gIGVkZ2UgdGhleSBhcmUgc3RhY2tlZCBpbiBvcmRlciBvZiBwcmlvcml0eTogaGlnaGVyIHByaW9yaXR5IGlzIGNsb3NlciB0byB0aGUgY2VudGVyLCBsb3dlclxuICBwcmlvcml0eSB0b3dhcmRzIHRoZSBlZGdlLlxuXG4gICpOb3RlOiogSWYgeW91ciBwYW5lbCBjaGFuZ2VzIGl0cyBzaXplIHRocm91Z2hvdXQgaXRzIGxpZmV0aW1lLCBjb25zaWRlciBnaXZpbmcgaXQgYSBoaWdoZXJcbiAgcHJpb3JpdHksIGFsbG93aW5nIGZpeGVkIHNpemUgcGFuZWxzIHRvIGJlIGNsb3NlciB0byB0aGUgZWRnZS4gVGhpcyBhbGxvd3MgY29udHJvbCB0YXJnZXRzIHRvXG4gIHJlbWFpbiBtb3JlIHN0YXRpYyBmb3IgZWFzaWVyIHRhcmdldGluZyBieSB1c2VycyB0aGF0IGVtcGxveSBtaWNlIG9yIHRyYWNrcGFkcy4gKFNlZVxuICBbYXRvbS9hdG9tIzQ4MzRdKGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzQ4MzQpIGZvciBkaXNjdXNzaW9uLilcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgcGFuZWwgaXRlbXMgYXQgdGhlIGJvdHRvbSBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0Qm90dG9tUGFuZWxzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lbHMoJ2JvdHRvbScpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIHRvIHRoZSBib3R0b20gb2YgdGhlIGVkaXRvciB3aW5kb3cuXG4gIC8vXG4gIC8vICogYG9wdGlvbnNgIHtPYmplY3R9XG4gIC8vICAgKiBgaXRlbWAgWW91ciBwYW5lbCBjb250ZW50LiBJdCBjYW4gYmUgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIGxhdHRlci4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkQm90dG9tUGFuZWwgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRQYW5lbCgnYm90dG9tJywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBwYW5lbCBpdGVtcyB0byB0aGUgbGVmdCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0TGVmdFBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdsZWZ0JylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogQWRkcyBhIHBhbmVsIGl0ZW0gdG8gdGhlIGxlZnQgb2YgdGhlIGVkaXRvciB3aW5kb3cuXG4gIC8vXG4gIC8vICogYG9wdGlvbnNgIHtPYmplY3R9XG4gIC8vICAgKiBgaXRlbWAgWW91ciBwYW5lbCBjb250ZW50LiBJdCBjYW4gYmUgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIGxhdHRlci4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkTGVmdFBhbmVsIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ2xlZnQnLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYW4ge0FycmF5fSBvZiBhbGwgdGhlIHBhbmVsIGl0ZW1zIHRvIHRoZSByaWdodCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0UmlnaHRQYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygncmlnaHQnKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSB0byB0aGUgcmlnaHQgb2YgdGhlIGVkaXRvciB3aW5kb3cuXG4gIC8vXG4gIC8vICogYG9wdGlvbnNgIHtPYmplY3R9XG4gIC8vICAgKiBgaXRlbWAgWW91ciBwYW5lbCBjb250ZW50LiBJdCBjYW4gYmUgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIGxhdHRlci4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkUmlnaHRQYW5lbCAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCdyaWdodCcsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgcGFuZWwgaXRlbXMgYXQgdGhlIHRvcCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0VG9wUGFuZWxzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lbHMoJ3RvcCcpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIHRvIHRoZSB0b3Agb2YgdGhlIGVkaXRvciB3aW5kb3cgYWJvdmUgdGhlIHRhYnMuXG4gIC8vXG4gIC8vICogYG9wdGlvbnNgIHtPYmplY3R9XG4gIC8vICAgKiBgaXRlbWAgWW91ciBwYW5lbCBjb250ZW50LiBJdCBjYW4gYmUgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIGxhdHRlci4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkVG9wUGFuZWwgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRQYW5lbCgndG9wJywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBwYW5lbCBpdGVtcyBpbiB0aGUgaGVhZGVyLlxuICBnZXRIZWFkZXJQYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygnaGVhZGVyJylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogQWRkcyBhIHBhbmVsIGl0ZW0gdG8gdGhlIGhlYWRlci5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRIZWFkZXJQYW5lbCAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCdoZWFkZXInLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYW4ge0FycmF5fSBvZiBhbGwgdGhlIHBhbmVsIGl0ZW1zIGluIHRoZSBmb290ZXIuXG4gIGdldEZvb3RlclBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdmb290ZXInKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSB0byB0aGUgZm9vdGVyLlxuICAvL1xuICAvLyAqIGBvcHRpb25zYCB7T2JqZWN0fVxuICAvLyAgICogYGl0ZW1gIFlvdXIgcGFuZWwgY29udGVudC4gSXQgY2FuIGJlIERPTSBlbGVtZW50LCBhIGpRdWVyeSBlbGVtZW50LCBvclxuICAvLyAgICAgYSBtb2RlbCB3aXRoIGEgdmlldyByZWdpc3RlcmVkIHZpYSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9LiBXZSByZWNvbW1lbmQgdGhlXG4gIC8vICAgICBsYXR0ZXIuIFNlZSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAvLyAgICogYHZpc2libGVgIChvcHRpb25hbCkge0Jvb2xlYW59IGZhbHNlIGlmIHlvdSB3YW50IHRoZSBwYW5lbCB0byBpbml0aWFsbHkgYmUgaGlkZGVuXG4gIC8vICAgICAoZGVmYXVsdDogdHJ1ZSlcbiAgLy8gICAqIGBwcmlvcml0eWAgKG9wdGlvbmFsKSB7TnVtYmVyfSBEZXRlcm1pbmVzIHN0YWNraW5nIG9yZGVyLiBMb3dlciBwcmlvcml0eSBpdGVtcyBhcmVcbiAgLy8gICAgIGZvcmNlZCBjbG9zZXIgdG8gdGhlIGVkZ2VzIG9mIHRoZSB3aW5kb3cuIChkZWZhdWx0OiAxMDApXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZWx9XG4gIGFkZEZvb3RlclBhbmVsIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ2Zvb3RlcicsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgbW9kYWwgcGFuZWwgaXRlbXNcbiAgZ2V0TW9kYWxQYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygnbW9kYWwnKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSBhcyBhIG1vZGFsIGRpYWxvZy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBhIERPTSBlbGVtZW50LCBhIGpRdWVyeSBlbGVtZW50LCBvclxuICAvLyAgICAgYSBtb2RlbCB3aXRoIGEgdmlldyByZWdpc3RlcmVkIHZpYSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9LiBXZSByZWNvbW1lbmQgdGhlXG4gIC8vICAgICBtb2RlbCBvcHRpb24uIFNlZSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAvLyAgICogYHZpc2libGVgIChvcHRpb25hbCkge0Jvb2xlYW59IGZhbHNlIGlmIHlvdSB3YW50IHRoZSBwYW5lbCB0byBpbml0aWFsbHkgYmUgaGlkZGVuXG4gIC8vICAgICAoZGVmYXVsdDogdHJ1ZSlcbiAgLy8gICAqIGBwcmlvcml0eWAgKG9wdGlvbmFsKSB7TnVtYmVyfSBEZXRlcm1pbmVzIHN0YWNraW5nIG9yZGVyLiBMb3dlciBwcmlvcml0eSBpdGVtcyBhcmVcbiAgLy8gICAgIGZvcmNlZCBjbG9zZXIgdG8gdGhlIGVkZ2VzIG9mIHRoZSB3aW5kb3cuIChkZWZhdWx0OiAxMDApXG4gIC8vICAgKiBgYXV0b0ZvY3VzYCAob3B0aW9uYWwpIHtCb29sZWFufSB0cnVlIGlmIHlvdSB3YW50IG1vZGFsIGZvY3VzIG1hbmFnZWQgZm9yIHlvdSBieSBBdG9tLlxuICAvLyAgICAgQXRvbSB3aWxsIGF1dG9tYXRpY2FsbHkgZm9jdXMgeW91ciBtb2RhbCBwYW5lbCdzIGZpcnN0IHRhYmJhYmxlIGVsZW1lbnQgd2hlbiB0aGUgbW9kYWxcbiAgLy8gICAgIG9wZW5zIGFuZCB3aWxsIHJlc3RvcmUgdGhlIHByZXZpb3VzbHkgc2VsZWN0ZWQgZWxlbWVudCB3aGVuIHRoZSBtb2RhbCBjbG9zZXMuIEF0b20gd2lsbFxuICAvLyAgICAgYWxzbyBhdXRvbWF0aWNhbGx5IHJlc3RyaWN0IHVzZXIgdGFiIGZvY3VzIHdpdGhpbiB5b3VyIG1vZGFsIHdoaWxlIGl0IGlzIG9wZW4uXG4gIC8vICAgICAoZGVmYXVsdDogZmFsc2UpXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZWx9XG4gIGFkZE1vZGFsUGFuZWwgKG9wdGlvbnMgPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCdtb2RhbCcsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IFJldHVybnMgdGhlIHtQYW5lbH0gYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBpdGVtLiBSZXR1cm5zXG4gIC8vIGBudWxsYCB3aGVuIHRoZSBpdGVtIGhhcyBubyBwYW5lbC5cbiAgLy9cbiAgLy8gKiBgaXRlbWAgSXRlbSB0aGUgcGFuZWwgY29udGFpbnNcbiAgcGFuZWxGb3JJdGVtIChpdGVtKSB7XG4gICAgZm9yIChsZXQgbG9jYXRpb24gaW4gdGhpcy5wYW5lbENvbnRhaW5lcnMpIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMucGFuZWxDb250YWluZXJzW2xvY2F0aW9uXVxuICAgICAgY29uc3QgcGFuZWwgPSBjb250YWluZXIucGFuZWxGb3JJdGVtKGl0ZW0pXG4gICAgICBpZiAocGFuZWwgIT0gbnVsbCkgeyByZXR1cm4gcGFuZWwgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgZ2V0UGFuZWxzIChsb2NhdGlvbikge1xuICAgIHJldHVybiB0aGlzLnBhbmVsQ29udGFpbmVyc1tsb2NhdGlvbl0uZ2V0UGFuZWxzKClcbiAgfVxuXG4gIGFkZFBhbmVsIChsb2NhdGlvbiwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHsgb3B0aW9ucyA9IHt9IH1cbiAgICByZXR1cm4gdGhpcy5wYW5lbENvbnRhaW5lcnNbbG9jYXRpb25dLmFkZFBhbmVsKG5ldyBQYW5lbChvcHRpb25zLCB0aGlzLnZpZXdSZWdpc3RyeSkpXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBTZWFyY2hpbmcgYW5kIFJlcGxhY2luZ1xuICAqL1xuXG4gIC8vIFB1YmxpYzogUGVyZm9ybXMgYSBzZWFyY2ggYWNyb3NzIGFsbCBmaWxlcyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGByZWdleGAge1JlZ0V4cH0gdG8gc2VhcmNoIHdpdGguXG4gIC8vICogYG9wdGlvbnNgIChvcHRpb25hbCkge09iamVjdH1cbiAgLy8gICAqIGBwYXRoc2AgQW4ge0FycmF5fSBvZiBnbG9iIHBhdHRlcm5zIHRvIHNlYXJjaCB3aXRoaW4uXG4gIC8vICAgKiBgb25QYXRoc1NlYXJjaGVkYCAob3B0aW9uYWwpIHtGdW5jdGlvbn0gdG8gYmUgcGVyaW9kaWNhbGx5IGNhbGxlZFxuICAvLyAgICAgd2l0aCBudW1iZXIgb2YgcGF0aHMgc2VhcmNoZWQuXG4gIC8vICAgKiBgbGVhZGluZ0NvbnRleHRMaW5lQ291bnRgIHtOdW1iZXJ9IGRlZmF1bHQgYDBgOyBUaGUgbnVtYmVyIG9mIGxpbmVzXG4gIC8vICAgICAgYmVmb3JlIHRoZSBtYXRjaGVkIGxpbmUgdG8gaW5jbHVkZSBpbiB0aGUgcmVzdWx0cyBvYmplY3QuXG4gIC8vICAgKiBgdHJhaWxpbmdDb250ZXh0TGluZUNvdW50YCB7TnVtYmVyfSBkZWZhdWx0IGAwYDsgVGhlIG51bWJlciBvZiBsaW5lc1xuICAvLyAgICAgIGFmdGVyIHRoZSBtYXRjaGVkIGxpbmUgdG8gaW5jbHVkZSBpbiB0aGUgcmVzdWx0cyBvYmplY3QuXG4gIC8vICogYGl0ZXJhdG9yYCB7RnVuY3Rpb259IGNhbGxiYWNrIG9uIGVhY2ggZmlsZSBmb3VuZC5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQcm9taXNlfSB3aXRoIGEgYGNhbmNlbCgpYCBtZXRob2QgdGhhdCB3aWxsIGNhbmNlbCBhbGxcbiAgLy8gb2YgdGhlIHVuZGVybHlpbmcgc2VhcmNoZXMgdGhhdCB3ZXJlIHN0YXJ0ZWQgYXMgcGFydCBvZiB0aGlzIHNjYW4uXG4gIHNjYW4gKHJlZ2V4LCBvcHRpb25zID0ge30sIGl0ZXJhdG9yKSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihvcHRpb25zKSkge1xuICAgICAgaXRlcmF0b3IgPSBvcHRpb25zXG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICAvLyBGaW5kIGEgc2VhcmNoZXIgZm9yIGV2ZXJ5IERpcmVjdG9yeSBpbiB0aGUgcHJvamVjdC4gRWFjaCBzZWFyY2hlciB0aGF0IGlzIG1hdGNoZWRcbiAgICAvLyB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCBhbiBBcnJheSBvZiBEaXJlY3Rvcnkgb2JqZWN0cyBpbiB0aGUgTWFwLlxuICAgIGNvbnN0IGRpcmVjdG9yaWVzRm9yU2VhcmNoZXIgPSBuZXcgTWFwKClcbiAgICBmb3IgKGNvbnN0IGRpcmVjdG9yeSBvZiB0aGlzLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKSkge1xuICAgICAgbGV0IHNlYXJjaGVyID0gdGhpcy5kZWZhdWx0RGlyZWN0b3J5U2VhcmNoZXJcbiAgICAgIGZvciAoY29uc3QgZGlyZWN0b3J5U2VhcmNoZXIgb2YgdGhpcy5kaXJlY3RvcnlTZWFyY2hlcnMpIHtcbiAgICAgICAgaWYgKGRpcmVjdG9yeVNlYXJjaGVyLmNhblNlYXJjaERpcmVjdG9yeShkaXJlY3RvcnkpKSB7XG4gICAgICAgICAgc2VhcmNoZXIgPSBkaXJlY3RvcnlTZWFyY2hlclxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCBkaXJlY3RvcmllcyA9IGRpcmVjdG9yaWVzRm9yU2VhcmNoZXIuZ2V0KHNlYXJjaGVyKVxuICAgICAgaWYgKCFkaXJlY3Rvcmllcykge1xuICAgICAgICBkaXJlY3RvcmllcyA9IFtdXG4gICAgICAgIGRpcmVjdG9yaWVzRm9yU2VhcmNoZXIuc2V0KHNlYXJjaGVyLCBkaXJlY3RvcmllcylcbiAgICAgIH1cbiAgICAgIGRpcmVjdG9yaWVzLnB1c2goZGlyZWN0b3J5KVxuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgb25QYXRoc1NlYXJjaGVkIGNhbGxiYWNrLlxuICAgIGxldCBvblBhdGhzU2VhcmNoZWRcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG9wdGlvbnMub25QYXRoc1NlYXJjaGVkKSkge1xuICAgICAgLy8gTWFpbnRhaW4gYSBtYXAgb2YgZGlyZWN0b3JpZXMgdG8gdGhlIG51bWJlciBvZiBzZWFyY2ggcmVzdWx0cy4gV2hlbiBub3RpZmllZCBvZiBhIG5ldyBjb3VudCxcbiAgICAgIC8vIHJlcGxhY2UgdGhlIGVudHJ5IGluIHRoZSBtYXAgYW5kIHVwZGF0ZSB0aGUgdG90YWwuXG4gICAgICBjb25zdCBvblBhdGhzU2VhcmNoZWRPcHRpb24gPSBvcHRpb25zLm9uUGF0aHNTZWFyY2hlZFxuICAgICAgbGV0IHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkID0gMFxuICAgICAgY29uc3QgbnVtYmVyT2ZQYXRoc1NlYXJjaGVkRm9yU2VhcmNoZXIgPSBuZXcgTWFwKClcbiAgICAgIG9uUGF0aHNTZWFyY2hlZCA9IGZ1bmN0aW9uIChzZWFyY2hlciwgbnVtYmVyT2ZQYXRoc1NlYXJjaGVkKSB7XG4gICAgICAgIGNvbnN0IG9sZFZhbHVlID0gbnVtYmVyT2ZQYXRoc1NlYXJjaGVkRm9yU2VhcmNoZXIuZ2V0KHNlYXJjaGVyKVxuICAgICAgICBpZiAob2xkVmFsdWUpIHtcbiAgICAgICAgICB0b3RhbE51bWJlck9mUGF0aHNTZWFyY2hlZCAtPSBvbGRWYWx1ZVxuICAgICAgICB9XG4gICAgICAgIG51bWJlck9mUGF0aHNTZWFyY2hlZEZvclNlYXJjaGVyLnNldChzZWFyY2hlciwgbnVtYmVyT2ZQYXRoc1NlYXJjaGVkKVxuICAgICAgICB0b3RhbE51bWJlck9mUGF0aHNTZWFyY2hlZCArPSBudW1iZXJPZlBhdGhzU2VhcmNoZWRcbiAgICAgICAgcmV0dXJuIG9uUGF0aHNTZWFyY2hlZE9wdGlvbih0b3RhbE51bWJlck9mUGF0aHNTZWFyY2hlZClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb25QYXRoc1NlYXJjaGVkID0gZnVuY3Rpb24gKCkge31cbiAgICB9XG5cbiAgICAvLyBLaWNrIG9mZiBhbGwgb2YgdGhlIHNlYXJjaGVzIGFuZCB1bmlmeSB0aGVtIGludG8gb25lIFByb21pc2UuXG4gICAgY29uc3QgYWxsU2VhcmNoZXMgPSBbXVxuICAgIGRpcmVjdG9yaWVzRm9yU2VhcmNoZXIuZm9yRWFjaCgoZGlyZWN0b3JpZXMsIHNlYXJjaGVyKSA9PiB7XG4gICAgICBjb25zdCBzZWFyY2hPcHRpb25zID0ge1xuICAgICAgICBpbmNsdXNpb25zOiBvcHRpb25zLnBhdGhzIHx8IFtdLFxuICAgICAgICBpbmNsdWRlSGlkZGVuOiB0cnVlLFxuICAgICAgICBleGNsdWRlVmNzSWdub3JlczogdGhpcy5jb25maWcuZ2V0KCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnKSxcbiAgICAgICAgZXhjbHVzaW9uczogdGhpcy5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpLFxuICAgICAgICBmb2xsb3c6IHRoaXMuY29uZmlnLmdldCgnY29yZS5mb2xsb3dTeW1saW5rcycpLFxuICAgICAgICBsZWFkaW5nQ29udGV4dExpbmVDb3VudDogb3B0aW9ucy5sZWFkaW5nQ29udGV4dExpbmVDb3VudCB8fCAwLFxuICAgICAgICB0cmFpbGluZ0NvbnRleHRMaW5lQ291bnQ6IG9wdGlvbnMudHJhaWxpbmdDb250ZXh0TGluZUNvdW50IHx8IDAsXG4gICAgICAgIGRpZE1hdGNoOiByZXN1bHQgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5wcm9qZWN0LmlzUGF0aE1vZGlmaWVkKHJlc3VsdC5maWxlUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcihyZXN1bHQpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkaWRFcnJvciAoZXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3IobnVsbCwgZXJyb3IpXG4gICAgICAgIH0sXG4gICAgICAgIGRpZFNlYXJjaFBhdGhzIChjb3VudCkge1xuICAgICAgICAgIHJldHVybiBvblBhdGhzU2VhcmNoZWQoc2VhcmNoZXIsIGNvdW50KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBkaXJlY3RvcnlTZWFyY2hlciA9IHNlYXJjaGVyLnNlYXJjaChkaXJlY3RvcmllcywgcmVnZXgsIHNlYXJjaE9wdGlvbnMpXG4gICAgICBhbGxTZWFyY2hlcy5wdXNoKGRpcmVjdG9yeVNlYXJjaGVyKVxuICAgIH0pXG4gICAgY29uc3Qgc2VhcmNoUHJvbWlzZSA9IFByb21pc2UuYWxsKGFsbFNlYXJjaGVzKVxuXG4gICAgZm9yIChsZXQgYnVmZmVyIG9mIHRoaXMucHJvamVjdC5nZXRCdWZmZXJzKCkpIHtcbiAgICAgIGlmIChidWZmZXIuaXNNb2RpZmllZCgpKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYnVmZmVyLmdldFBhdGgoKVxuICAgICAgICBpZiAoIXRoaXMucHJvamVjdC5jb250YWlucyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHZhciBtYXRjaGVzID0gW11cbiAgICAgICAgYnVmZmVyLnNjYW4ocmVnZXgsIG1hdGNoID0+IG1hdGNoZXMucHVzaChtYXRjaCkpXG4gICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBpdGVyYXRvcih7ZmlsZVBhdGgsIG1hdGNoZXN9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBQcm9taXNlIHRoYXQgaXMgcmV0dXJuZWQgdG8gdGhlIGNsaWVudCBpcyBjYW5jZWxhYmxlLiBUbyBiZSBjb25zaXN0ZW50XG4gICAgLy8gd2l0aCB0aGUgZXhpc3RpbmcgYmVoYXZpb3IsIGluc3RlYWQgb2YgY2FuY2VsKCkgcmVqZWN0aW5nIHRoZSBwcm9taXNlLCBpdCBzaG91bGRcbiAgICAvLyByZXNvbHZlIGl0IHdpdGggdGhlIHNwZWNpYWwgdmFsdWUgJ2NhbmNlbGxlZCcuIEF0IGxlYXN0IHRoZSBidWlsdC1pbiBmaW5kLWFuZC1yZXBsYWNlXG4gICAgLy8gcGFja2FnZSByZWxpZXMgb24gdGhpcyBiZWhhdmlvci5cbiAgICBsZXQgaXNDYW5jZWxsZWQgPSBmYWxzZVxuICAgIGNvbnN0IGNhbmNlbGxhYmxlUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IG9uU3VjY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGlzQ2FuY2VsbGVkKSB7XG4gICAgICAgICAgcmVzb2x2ZSgnY2FuY2VsbGVkJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKG51bGwpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3Qgb25GYWlsdXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKGxldCBwcm9taXNlIG9mIGFsbFNlYXJjaGVzKSB7IHByb21pc2UuY2FuY2VsKCkgfVxuICAgICAgICByZWplY3QoKVxuICAgICAgfVxuXG4gICAgICBzZWFyY2hQcm9taXNlLnRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpXG4gICAgfSlcbiAgICBjYW5jZWxsYWJsZVByb21pc2UuY2FuY2VsID0gKCkgPT4ge1xuICAgICAgaXNDYW5jZWxsZWQgPSB0cnVlXG4gICAgICAvLyBOb3RlIHRoYXQgY2FuY2VsbGluZyBhbGwgb2YgdGhlIG1lbWJlcnMgb2YgYWxsU2VhcmNoZXMgd2lsbCBjYXVzZSBhbGwgb2YgdGhlIHNlYXJjaGVzXG4gICAgICAvLyB0byByZXNvbHZlLCB3aGljaCBjYXVzZXMgc2VhcmNoUHJvbWlzZSB0byByZXNvbHZlLCB3aGljaCBpcyB1bHRpbWF0ZWx5IHdoYXQgY2F1c2VzXG4gICAgICAvLyBjYW5jZWxsYWJsZVByb21pc2UgdG8gcmVzb2x2ZS5cbiAgICAgIGFsbFNlYXJjaGVzLm1hcCgocHJvbWlzZSkgPT4gcHJvbWlzZS5jYW5jZWwoKSlcbiAgICB9XG5cbiAgICAvLyBBbHRob3VnaCB0aGlzIG1ldGhvZCBjbGFpbXMgdG8gcmV0dXJuIGEgYFByb21pc2VgLCB0aGUgYFJlc3VsdHNQYW5lVmlldy5vblNlYXJjaCgpYFxuICAgIC8vIG1ldGhvZCBpbiB0aGUgZmluZC1hbmQtcmVwbGFjZSBwYWNrYWdlIGV4cGVjdHMgdGhlIG9iamVjdCByZXR1cm5lZCBieSB0aGlzIG1ldGhvZCB0byBoYXZlIGFcbiAgICAvLyBgZG9uZSgpYCBtZXRob2QuIEluY2x1ZGUgYSBkb25lKCkgbWV0aG9kIHVudGlsIGZpbmQtYW5kLXJlcGxhY2UgY2FuIGJlIHVwZGF0ZWQuXG4gICAgY2FuY2VsbGFibGVQcm9taXNlLmRvbmUgPSBvblN1Y2Nlc3NPckZhaWx1cmUgPT4ge1xuICAgICAgY2FuY2VsbGFibGVQcm9taXNlLnRoZW4ob25TdWNjZXNzT3JGYWlsdXJlLCBvblN1Y2Nlc3NPckZhaWx1cmUpXG4gICAgfVxuICAgIHJldHVybiBjYW5jZWxsYWJsZVByb21pc2VcbiAgfVxuXG4gIC8vIFB1YmxpYzogUGVyZm9ybXMgYSByZXBsYWNlIGFjcm9zcyBhbGwgdGhlIHNwZWNpZmllZCBmaWxlcyBpbiB0aGUgcHJvamVjdC5cbiAgLy9cbiAgLy8gKiBgcmVnZXhgIEEge1JlZ0V4cH0gdG8gc2VhcmNoIHdpdGguXG4gIC8vICogYHJlcGxhY2VtZW50VGV4dGAge1N0cmluZ30gdG8gcmVwbGFjZSBhbGwgbWF0Y2hlcyBvZiByZWdleCB3aXRoLlxuICAvLyAqIGBmaWxlUGF0aHNgIEFuIHtBcnJheX0gb2YgZmlsZSBwYXRoIHN0cmluZ3MgdG8gcnVuIHRoZSByZXBsYWNlIG9uLlxuICAvLyAqIGBpdGVyYXRvcmAgQSB7RnVuY3Rpb259IGNhbGxiYWNrIG9uIGVhY2ggZmlsZSB3aXRoIHJlcGxhY2VtZW50czpcbiAgLy8gICAqIGBvcHRpb25zYCB7T2JqZWN0fSB3aXRoIGtleXMgYGZpbGVQYXRoYCBhbmQgYHJlcGxhY2VtZW50c2AuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UHJvbWlzZX0uXG4gIHJlcGxhY2UgKHJlZ2V4LCByZXBsYWNlbWVudFRleHQsIGZpbGVQYXRocywgaXRlcmF0b3IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IGJ1ZmZlclxuICAgICAgY29uc3Qgb3BlblBhdGhzID0gdGhpcy5wcm9qZWN0LmdldEJ1ZmZlcnMoKS5tYXAoYnVmZmVyID0+IGJ1ZmZlci5nZXRQYXRoKCkpXG4gICAgICBjb25zdCBvdXRPZlByb2Nlc3NQYXRocyA9IF8uZGlmZmVyZW5jZShmaWxlUGF0aHMsIG9wZW5QYXRocylcblxuICAgICAgbGV0IGluUHJvY2Vzc0ZpbmlzaGVkID0gIW9wZW5QYXRocy5sZW5ndGhcbiAgICAgIGxldCBvdXRPZlByb2Nlc3NGaW5pc2hlZCA9ICFvdXRPZlByb2Nlc3NQYXRocy5sZW5ndGhcbiAgICAgIGNvbnN0IGNoZWNrRmluaXNoZWQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChvdXRPZlByb2Nlc3NGaW5pc2hlZCAmJiBpblByb2Nlc3NGaW5pc2hlZCkge1xuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghb3V0T2ZQcm9jZXNzRmluaXNoZWQubGVuZ3RoKSB7XG4gICAgICAgIGxldCBmbGFncyA9ICdnJ1xuICAgICAgICBpZiAocmVnZXgubXVsdGlsaW5lKSB7IGZsYWdzICs9ICdtJyB9XG4gICAgICAgIGlmIChyZWdleC5pZ25vcmVDYXNlKSB7IGZsYWdzICs9ICdpJyB9XG5cbiAgICAgICAgY29uc3QgdGFzayA9IFRhc2sub25jZShcbiAgICAgICAgICByZXF1aXJlLnJlc29sdmUoJy4vcmVwbGFjZS1oYW5kbGVyJyksXG4gICAgICAgICAgb3V0T2ZQcm9jZXNzUGF0aHMsXG4gICAgICAgICAgcmVnZXguc291cmNlLFxuICAgICAgICAgIGZsYWdzLFxuICAgICAgICAgIHJlcGxhY2VtZW50VGV4dCxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBvdXRPZlByb2Nlc3NGaW5pc2hlZCA9IHRydWVcbiAgICAgICAgICAgIGNoZWNrRmluaXNoZWQoKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIHRhc2sub24oJ3JlcGxhY2U6cGF0aC1yZXBsYWNlZCcsIGl0ZXJhdG9yKVxuICAgICAgICB0YXNrLm9uKCdyZXBsYWNlOmZpbGUtZXJyb3InLCBlcnJvciA9PiB7IGl0ZXJhdG9yKG51bGwsIGVycm9yKSB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKGJ1ZmZlciBvZiB0aGlzLnByb2plY3QuZ2V0QnVmZmVycygpKSB7XG4gICAgICAgIGlmICghZmlsZVBhdGhzLmluY2x1ZGVzKGJ1ZmZlci5nZXRQYXRoKCkpKSB7IGNvbnRpbnVlIH1cbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRzID0gYnVmZmVyLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VtZW50VGV4dCwgaXRlcmF0b3IpXG4gICAgICAgIGlmIChyZXBsYWNlbWVudHMpIHtcbiAgICAgICAgICBpdGVyYXRvcih7ZmlsZVBhdGg6IGJ1ZmZlci5nZXRQYXRoKCksIHJlcGxhY2VtZW50c30pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5Qcm9jZXNzRmluaXNoZWQgPSB0cnVlXG4gICAgICBjaGVja0ZpbmlzaGVkKClcbiAgICB9KVxuICB9XG5cbiAgY2hlY2tvdXRIZWFkUmV2aXNpb24gKGVkaXRvcikge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICBjb25zdCBjaGVja291dEhlYWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeShuZXcgRGlyZWN0b3J5KGVkaXRvci5nZXREaXJlY3RvcnlQYXRoKCkpKVxuICAgICAgICAgIC50aGVuKHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAmJiByZXBvc2l0b3J5LmNoZWNrb3V0SGVhZEZvckVkaXRvcihlZGl0b3IpKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KCdlZGl0b3IuY29uZmlybUNoZWNrb3V0SGVhZFJldmlzaW9uJykpIHtcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvbkRlbGVnYXRlLmNvbmZpcm0oe1xuICAgICAgICAgIG1lc3NhZ2U6ICdDb25maXJtIENoZWNrb3V0IEhFQUQgUmV2aXNpb24nLFxuICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkaXNjYXJkIGFsbCBjaGFuZ2VzIHRvIFwiJHtlZGl0b3IuZ2V0RmlsZU5hbWUoKX1cIiBzaW5jZSB0aGUgbGFzdCBHaXQgY29tbWl0P2AsXG4gICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgT0s6IGNoZWNrb3V0SGVhZCxcbiAgICAgICAgICAgIENhbmNlbDogbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjaGVja291dEhlYWQoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cbiAgfVxufVxuIl19