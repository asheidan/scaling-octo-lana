QUnit.module("Actions", {});

QUnit.test("Instantiation should be thruthy", function (assert) {
	var action = Action.create();
	assert.ok(action);
});


QUnit.test("Callback should be called when action fires", function (assert) {
	assert.expect(1);
	var action = Action.create();

	var callback = function () {
		assert.ok(true);
	}
	action.listen(callback);

	action();
});

QUnit.test("Callbacks should not be shared between actions", function (assert) {
	assert.expect(0);
	var emptyAction = Action.create();
	var popularAction = Action.create();

	var callback = function () {
		assert.ok(false);
	};
	popularAction.listen(callback);

	emptyAction();
});

QUnit.test("Listening to action should return function", function (assert) {
	var action = Action.create();

	var callback = function () {};

	var result = action.listen(callback);

	assert.equal("function", typeof result);
});

QUnit.test("Calling return from listening should remove callback", function (assert) {
	assert.expect(0);

	var action = Action.create();

	var callback = function () {
		assert.ok(false);
	};

	action.listen(callback)();

	action();
});

QUnit.test("Callback should correctly bind context", function (assert) {
	assert.expect(1);

	var context = {specialAttr: 42};

	var action = Action.create();

	var callback = function () {
		assert.deepEqual(context, this);
	};

	action.listen(callback, context);

	action();
});
