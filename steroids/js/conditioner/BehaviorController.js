/**
 * @module conditioner/BehaviorController
 */
Namespace.register('conditioner').BehaviorController = (function() {

    'use strict';



    var _matchesMethod = null;
    var _matchesSelector = function(element,selector) {

        if (!element) {
            return false;
        }

        if (!_matchesMethod) {
            var el = document.body;
            if (el.matches) {
                _matchesMethod = '';
            }
            else if (el.webkitMatchesSelector) {
                _matchesMethod = 'webkitMatchesSelector';
            }
            else if (el.mozMatchesSelector) {
                _matchesMethod = 'mozMatchesSelector';
            }
            else if (el.msMatchesSelector) {
                _matchesMethod = 'msMatchesSelector';
            }
            else if (el.oMatchesSelector) {
                _matchesMethod = 'oMatchesSelector';
            }
        }

        return element[_matchesMethod](selector);
    };



    /**
     * Constructs BehaviorController objects.
     *
     * @class BehaviorController
     * @constructor
     * @param {String} classPath - path to this behavior
     * @param {Object} classOptions - options for this behavior
     * @param {Object} options - options for this behavior controller
     */
    var BehaviorController = function(classPath,classOptions,options) {

        // if no element, throw error
        if (!classPath) {
            throw new Error('BehaviorController(classPath,classOptions,options): "classPath" is a required parameter.');
        }

        // options for class behavior controller should load
        this._classPath = classPath;
        this._classOptions = classOptions;

        // options for behavior controller
        this._options = options || {};

        // check if conditions specified
        this._conditionManager = new conditioner.ConditionManager(
            this._options.conditions,
            this._options.target
        );

        // listen to changes in conditions
        Observer.subscribe(this._conditionManager,'change',this._onConditionsChange.bind(this));

        // if already suitale, load behavior
        if (this._conditionManager.getSuitability()) {
            this._loadBehavior();
        }

    };


    // prototype shortcut
    var p = BehaviorController.prototype;


    /**
     * Called when the conditions change.
     * @method _onConditionsChange
     */
    p._onConditionsChange = function() {

        var suitable = this._conditionManager.getSuitability();

        if (this._behavior && !suitable) {
            this.unloadBehavior();
        }

        if (!this._behavior && suitable) {
            this._loadBehavior();
        }

    };


    /**
     * Load the behavior set in the data-behavior attribute
     * @method _loadBehavior
     */
    p._loadBehavior = function() {

        var self = this;

        Namespace.load(
            this._classPath,
            function(Class){
                self._initBehavior(Class);
            },
            function(error) {
                console.warn(error);
            }
        );

    };

    /**
     * Initialize the class passed and decide what parameters to pass
     * @method _initBehavior
     */
    p._initBehavior = function(Class) {

        if (this._options.target) {
            this._behavior = new Class(this._options.target,this._classOptions);
        }
        else {
            this._behavior = new Class(this._classOptions);
        }

        // route events triggered by behavior to this object
        Observer.setupPropagationTarget(this._behavior,this);

    };


    /**
     * Public method for unload the behavior
     * @method unloadBehavior
     * @return {Boolean}
     */
    p.unloadBehavior = function() {

        if (!this._behavior) {
            return false;
        }

        this._behavior._unload();
        this._behavior = null;

        return true;
    };


    /**
     * Public method for unload the behavior
     * @method matchesQuery
     * @param {Object} query - query to match
     * @return {Boolean}
     */
    p.matchesQuery = function(query) {

        if (typeof query == 'string') {

            // if matches classpath
            if (query == this._classPath) {
                return true;
            }

            // check if matches query
            if (_matchesSelector(this._options.target,query)) {
                return true;
            }

        }

        return (query == this._options.target);
    };



    /**
     * Public method for safely executing methods on the loaded behavior
     * @method execute
     * @param {String} method - method key
     * @param {Array} params - array containing the method parameters
     * @return
     */
    p.execute = function(method,params) {

        // if behavior not loaded
        if (!this._behavior) {
            return null;
        }

        // once loaded call method and pass parameters
        return this._behavior[method].apply(this._behavior,params);

    };

    return BehaviorController;

}());