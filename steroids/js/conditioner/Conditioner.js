/**
 * @module conditioner/Conditioner
 */
var Conditioner = (function() {

    'use strict';


    /**
     * Tests
     */
    var Tests = {

        _tests:[],

        registerTest:function(key,arrange,assert) {

            var test = this._tests[key] = {};
                test.arrange = arrange;
                test.assert = assert;


        },

        getTestByKey:function(key) {
            return this._tests[key];
        }

    };



    // Conditioner singleton reference
    var _instance;

    /**
     * @class Conditioner (Singleton)
     * @constructor
     */
    var Conditioner = function() {
        this._controllers = [];
    };

    var p = Conditioner.prototype;





    /**
     * @method registerTest
     * @param {string} key - Test identifier
     * @param {function} arrange - Test arrange method
     * @param {function} assert - Test assert method
     */
    p.registerTest = function(key,arrange,assert) {

        if (!key) {
            throw new Error('Conditioner.registerTest(key,arrange,assert): "key" is a required parameter.');
        }

        Tests.registerTest(key,arrange,assert);
    };

    /**
     * @method getTestByKey
     * @param {string} key - Test identifier
     * @return {Object} a Test
     */
    p.getTestByKey = function(key) {

        if (!key) {
            throw new Error('Conditioner.getTestByKey(key): "key" is a required parameter.');
        }

        return Tests.getTestByKey(key);
    };



    /**
     * Applies behavior on object within given context.
     *
     * @method applyBehavior
     * @param {Node} context - Context to apply behavior to
     * @param {Object} options - Options to be passed to the behavior
     * @return {Array} - Array of initialized BehaviorControllers
     */
    p.applyBehavior = function(context,options) {

        // if no context supplied throw error
        if (!context) {
            throw new Error('Conditioner.applyBehavior(context,options): "context" is a required parameter.');
        }

        // if no options, set empty options object
        options = options || {};

        // register vars and get elements
        var controllers = [],
            behaviorPath,element,elements = context.querySelectorAll('[data-behavior]:not([data-processed])',context),
            i=0,l = elements.length;

        // if no elements do nothing
        if (!elements) {
            return [];
        }

        // process elements
        for (; i<l; i++) {

            // set element reference
            element = elements[i];

            // has been processed
            element.setAttribute('data-processed','true');

            // get behavior path from element
            behaviorPath = element.getAttribute('data-behavior');

            // feed to controller
            controllers.push(

                new conditioner.BehaviorController(
                    behaviorPath,
                    options[behaviorPath],
                    {
                        'target':element,
                        'conditions':element.getAttribute('data-conditions')
                    }
                )

            );

        }

        // merge with current controllers
        this._controllers = this._controllers.concat(controllers);

        // returns copy of loaders so it is possible to later unload them manually if necessary
        return controllers;
    };


    /**
     * Returns BehaviorControllers matching the selector
     *
     * @method getBehavior
     * @param {Object} query - Query to match the controller to, could be ClassPath, Element or CSS Selector
     * @return
     */
    p.getBehavior = function(query) {
        var controller,i=0,l = this._controllers.length,results=[];
        for (;i<l;i++) {
            controller = this._controllers[i];
            if (controller.matchesQuery(query)) {
                results.push(controller);
            }
        }
        return results;
    };


    // Singleton
    return {

        /**
         * Returns an instance of the Conditioner
         * @method getInstance
         * @return instance of Conditioner
         */
        getInstance:function() {
            if (!_instance) {_instance = new Conditioner();}
            return _instance;
        }

    };

}());