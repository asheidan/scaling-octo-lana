//var Action = require("./actions.js")

function Store() {}

/*
Store.copy = function (o) {
	var n = {};
	for (var name in o) {
		if (o.hasOwnProperty(name)) {
			n[name] = o[name];
		}
	}

	return n;
};
*/

Store.create = function () {
	var self = {};
	self.__proto__ = Store.prototype;

	self.items = new Map();
	self.autoIncrement = 0;

	self.events = {};
	self.events.change = Action.create();
	self.events.synced = Action.create();

	self.inSync = true;

	var syncTimeout = function () {
		window.clearTimeout(self.sync.timer);
		self.inSync = false;
		self.sync.timer = window.setTimeout(self.sync.doSync, self.sync.timeout);
	};
	self.events.change.listen(syncTimeout, self);

	self.sync = {
		timeout: 5000,
		timer: null,
		doSync: function () {},
	};

	if (Store.localStoreSupport()) {
		self.sync.doSync = function () {
			//console.log(JSON.stringify(self.getAll()));
			console.log("Store tried to sync");
			self.inSync = true;
			self.events.synced();
		};
	}

	return self;
};

Store.localStoreSupport = function () {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	}
	catch (e) {
		return false;
	}
};

Store.prototype.add = function (payload) {
	var id = ++this.autoIncrement;
	/*
	while (this.items.has(id)) {
		++id; // Dagens fulhack
	}
	*/
	payload.id = id;
	payload.added = new Date();
	this.items.set(id, payload);

	this.events.change();
	return id;
};

Store.prototype.count = function () {
	return this.items.size;
};

Store.prototype.getIterator = function () {
	return this.items.values();
};

Store.prototype.getAll = function () {
	var it = this.items.values();
	var result = [];
	for (var value of it) {
		result.push(value);
	}
	return result;
};

Store.prototype.getId = function (id) {
	return this.items.get(id);
};

Store.prototype.update = function (id, payload) {
	var o = this.getId(id);
	for(var key in payload) {
		if (key != "id") {
			o[key] = payload[key];
		}
		o.modified = new Date();
	}

	this.events.change();
};

Store.prototype.remove = function (id) {
	console.log(typeof id);
	if (this.items.delete(id)) {
		console.log("stuff deleted");

		this.events.change();
	}
};
//module.exports = Store;
