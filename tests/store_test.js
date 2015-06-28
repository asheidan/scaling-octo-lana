QUnit.module("Store");

QUnit.test("Instantiation should be thruthy", function (assert) {
	var store = Store.create();

	assert.ok(store);
});

QUnit.test("Should be able to add object to store", function (assert) {
	var store = Store.create();

	var o = {};

	store.add(o);

	var count = store.count();

	assert.equal(count, 1);
});

QUnit.test("Add should return correct id", function (assert) {
	var store = Store.create();

	var o = {
		apa: 42,
		bepa: "lilla lisa",
		cepa: "kalle anka",
	};

	var id = store.add(o);

	var result = store.getId(id);

	assert.deepEqual(result, o);
	assert.equal(id, result.id);
	assert.equal(id, o.id);
});

QUnit.test("Add should fire change", function (assert) {
	assert.expect(1);
	var store = Store.create();

	var o = {};

	var callback = function () {
		assert.ok(true);
	};
	store.events.change.listen(callback);

	store.add(o);
});


QUnit.test("Get should return identical copy", function (assert) {
	var store = Store.create();

	var o = {
		apa: 42,
		bepa: "lilla lisa",
		cepa: "kalle anka",
	};

	var id = store.add(o);

	var result = store.getId(id);

	assert.deepEqual(result, o);

	assert.ok( result === o );
});
