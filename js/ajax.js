function Ajax() {}

Ajax.createRequest = function (options) {
	var method = options.method;
	var url = options.url;
	var data = options.data;

	return new Promise(function (resolve, reject) {
		var req = new XMLHttpRequest();
		req.open(method, url);

		req.setRequestHeader("Authorization", "Bearer " + Dropbox.getToken());

		req.onload = function () {
			if (req.status == 200) {
				resolve(req.response);
			}
			else {
				reject(Error(req.statusText));
			}
		};

		req.onerror = function () {
			reject(Error("Network Error"));
		};

		if (data) {
			req.send(data);
		}
		else {
			req.send();
		}
	});
};
