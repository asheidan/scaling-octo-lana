function Action() {}

Action.create = function () {
	var self = function () {
		self.fire();
	};
	self.__proto__ = Action.prototype;

	self.listeners = [];

	return self;
};

/**
 *
 * @method listen
 * @param {Function} callback The Callback to register as event handler
 * @param {Mixed} [optional] context The Context to bind the callback with
 * @returns {Function} Callback that unsubscribes the registered event handler
 */
Action.prototype.listen = function (callback, context) {
	var action = this;
	var eventHandler = function (args) {
		callback.apply(context, args);
	};

	this.listeners.push(eventHandler);

	return function () {
		var index = action.listeners.indexOf(eventHandler);
		if (0 > index) {
			console.warning("Trying to remove eventhandler not present in listeners");
			return;
		}
		action.listeners.splice(index, 1);
	};
};

Action.prototype.fire = function () {
	for (var i = 0; i < this.listeners.length; ++i) {
		this.listeners[i]();
	}
};

//module.exports = Action;
