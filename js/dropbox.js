function Dropbox() {}

Dropbox.userData = {
	token: localStorage["dropboxToken"],
	uid: null,
};

Dropbox.options = {
	url: "https://www.dropbox.com/1/oauth2/authorize",
	params: {
		response_type: "token",
		client_id: "15mirj7ghqtoh6h",
		redirect_uri: "http://localhost:8000/offline.html",
	},
};

Dropbox.redirectToAuth = function () {
	var query = [];
	for (var key in this.authData.params) {
		var value = encodeURIComponent(this.authData.params[key]);
		query.push(key + "=" + value);
	}

	// console.log(query.join("&"));
	window.location = this.authData.url + "?" + query.join("&");
};

Dropbox.parseResponse = function (response) {
	var params = new Map(response.split(/&/).map(function (keyVal) {
		return keyVal.split(/=/);
	}));

	Dropbox.userData.token = params.get("token");
	Dropbox.userData.uid = params.get("uid");
};

Dropbox.getToken = function () {
	return Dropbox.userData.token;
};

Dropbox.setToken = function (token) {
	localStorage["dropboxToken"] = token;
	Dropbox.userData.token = token;
};
