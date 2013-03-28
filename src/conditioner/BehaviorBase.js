/**
 * @module BehaviorBase
 */
define(['./Options'],function(Options) {

    'use strict';

    /**
     * @class BehaviorBase
     * @constructor
     * @param {Element} element - DOM Element to apply this behavior to
     * @param {Object} options - Custom options to pass to this behavior
     */
    var BehaviorBase = function(element,options) {

        // if no element, throw error
        if (!element) {
            throw new Error('BehaviorBase(element,options): "element" is a required parameter.');
        }

        // element reference
        this._element = element;
        this._element.setAttribute('data-initialized','true');

        // declare options as empty
        this._options = this._options || {};
        this._options = options ? Options.merge(this._options,options) : this._options;

    };


    /**
     * Unloads behaviour by removing data initialized property
     * Override to clean up your control, remove event listeners, restore original state, etc.
     * @method _unload
     */
    BehaviorBase.prototype._unload = function() {
        this._element.removeAttribute('data-initialized');
    };

    return BehaviorBase;

});