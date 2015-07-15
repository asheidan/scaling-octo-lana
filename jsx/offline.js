//var React = require('react');
//var Store = require('../js/store.js');

var Route = ReactRouter.Route;
var NotFoundRoute = ReactRouter.NotFoundRoute;
var RouteHandler = ReactRouter.RouteHandler;
var Link = ReactRouter.Link;
var Navigation = ReactRouter.Navigation;

function formatDate(date) {
	if (! date) {
		return "";
	}

	function pad(i) {
		if (i < 10) {
			return "0" + i;
		}
		else {
			return "" + i;
		}
	}
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();

	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	return "" + year +"-" +  pad(month) + "-" + pad(day) + " " + pad(hour) + ":" + pad(minute) + ":" + pad(second);
}

var TokenStore = Store.create();

var TaskStore = Store.create();
TaskStore.addNote = function (taskId, noteBody) {
	var task = this.items.get(taskId);
	if (task) {
		task.notes = task.notes || [];
		task.notes.push({timestamp: new Date(), body: noteBody});

		this.events.change();
	}
};
TaskStore.getAllUncompleted = function () {
	var it = this.getIterator();
	var result = [];
	for (var value of it) {
		if (! value.completed) {
			result.push(value);
		}
	}
	return result;
};

TaskStore.add({title: "Bada nisse", description: "Nisse är riktigt smutsig och behöver verkligen bada. Att inte bada är inte vore katastrofalt och skulle kunna leda till en sanitär olägenhet.", tags: ["apa", "bepa", "cepa"], created: "2015-01-01 12:24:40"});
TaskStore.add({title: "Herpa derp", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae lectus ac libero consectetur congue tincidunt vitae turpis. Mauris placerat ex et purus luctus varius. Vivamus elit enim, semper eu arcu at, dignissim sollicitudin lectus. Morbi non magna vitae eros lobortis scelerisque sit amet vel turpis. Nullam risus felis, ornare sed nisi ac, fringilla elementum nunc. Fusce tempus, quam ut eleifend luctus, lacus odio euismod risus, eu sagittis leo lorem in sem. Vestibulum tristique neque scelerisque, rutrum libero non, placerat nibh. Maecenas ut dolor vitae ligula tempus finibus ut nec erat. In et arcu nec massa rutrum ultricies.", tags: ["derp", "derp", "derp"]});

var TaskList = React.createClass({
	render: function () {
		var select = this.props.select;
		var taskNodes = this.props.tasks.map(function (task) {
			return (
				<TaskItem key={task.id} task={task} selectTask={select} />
			);
		});
		return (
			<ul className="taskList">
				{taskNodes}
			</ul>
		);
	},
});

var TaskItem = React.createClass({
	/*
	handleClick: function (event) {
		event.preventDefault();
		this.props.selectTask(this.props.task);
	},
	*/
	render: function () {
		var task = this.props.task;
		var tags;
		if (task.tags) {
			tags = task.tags.join(", ");
		}
		return (
			<li className="taskItem">
				<div className="tags">{tags}</div>
				<div className="project"></div>
				<Link to="inboxTask" params={{taskId: task.id}} className="title">{task.title}</Link>
			</li>
		);
	},
});

var DetailsView = React.createClass ({
	getInitialState: function () {
		return {
			task: this.props.task,
		};
	},
	_updateTask: function(field, value) {
		var payload;
		if (this.state.task.id) {
			payload = {};
			payload[field] = value;
			TaskStore.update(this.state.task.id, payload);
		}
		else {
			payload = {task: this.state.task};
			payload.task[field] = value;
			this.setState(payload);
		}
	},
	handleTitleChange: function (e) {
		this._updateTask("title", e.target.value);
	},
	handleTagsChange: function (e) {
		var tags = e.target.value.trim().split(/ *, */).sort();
		var uniqTags = [];
		if (tags.length > 0) {
			for (var i = 0; i < tags.length; ++i) {
				var tag = tags[i];
				if (tag) {
					if (0 == uniqTags.length) {
						uniqTags.push(tag);
					}
					else {
						if (uniqTags[uniqTags.length - 1] != tag) {
							uniqTags.push(tag);
						}
					}
				}
			}
		}
		this._updateTask("tags", uniqTags);
	},
	handleDescriptionChange: function (e) {
		this._updateTask("description", e.target.value);
	},
	render: function () {
		var task = this.props.task;
		var added = formatDate(task.added);
		var tags = this.props.task.tags ? this.props.task.tags.join(", ") : "";
		if (added) {
			added = (
				<div className="timestamp"><label>Added</label> {added}</div>
			);
		}
		var modified = formatDate(task.modified);
		if (modified) {
			modified = (
				<div className="timestamp"><label>Modified</label> {modified}</div>
			);
		}
		var completed = formatDate(task.completed);
		if (completed) {
			completed = (
				<div className="timestamp"><label>Completed</label> {completed}</div>
			);
		}
		return (
			<div className="detailsView">
				<TextInput key={"task_title_" + task.id} label="Title" id="task_title" placeholder="Do dishes" onBlur={this.handleTitleChange} value={this.props.task.title} />
				<TextInput key={"task_tags_" + task.id} label="Tags" id="task_tags" placeholder="apa, bepa, cepa" onBlur={this.handleTagsChange} value={tags} />
				<TextArea key={"task_description_" + task.id} label="Description" id="task_description" placeholder="Longform description of the task" onBlur={this.handleDescriptionChange} value={this.props.task.description} />

				{added}
				{modified}
				{completed}
				{this.props.extra}
			</div>
		);
	},
});

var NotesList = React.createClass({
	addNote: function () {
		var body = this.refs.body.state.inputValue.trim();
		if (body == "") { return; }

		TaskStore.addNote(this.props.taskId, body);

		this.refs.body.setState({inputValue: ""});
	},
	handleSubmit: function (e) {
		e.preventDefault();
		this.addNote();
	},
	handleKeyUp: function (e) {
		e.preventDefault();
		if (e.ctrlKey && 13 === e.which) {
			this.addNote();
		}
	},
	render: function () {
		var notes;
		if (this.props.notes) {
			notes = this.props.notes.map(function (note) {
				return (
					<li>
						{note.body}
						<div className="timestamp">{formatDate(note.timestamp)}</div>
					</li>
				);
			});
		}
		return (
			<div className="taskNotesList">
				<h5>Notes</h5>
				<ul>
					{notes}
				</ul>
				<form onSubmit={this.addNote}>
					<TextArea label="Add note" id="task_add_note" placeholder="Text of note" ref="body" name="body" onKeyUp={this.handleKeyUp} />
				</form>
			</div>
		);
	},
});

var TaskView = React.createClass({
	render: function () {
		return (
			<div className="taskView">
				<DetailsView task={this.props.task} />
				<NotesList notes={this.props.task.notes} taskId={this.props.task.id} />
			</div>);
	},
});

var TextInput = React.createClass({
	getInitialState: function () {
		return {
			inputValue: this.props.value,
			isFocused: false,
		};
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({inputValue: nextProps.value});
	},
	handleInput: function (e) {
		this.setState({inputValue: e.target.value});
	},
	handleBlur: function (e) {
		this.setState({isFocused: false});
		if (this.props.onBlur) {
			this.props.onBlur(e);
		}
		if (this.props.clearOnBlur) {
			this.setState({inputValue: ""});
		}
	},
	handleFocus: function (e) {
		this.setState({isFocused: true});
	},
	render: function () {
		var id = this.props.id,
			label = this.props.label,
			//value = this.props.value,
			placeholder = this.props.placeholder;
		var inputValue = this.state.inputValue;
		var empty = (! inputValue);
		var classes = ["textInput"];
		if (empty) {
			classes.push("empty");
		}
		if (this.state.isFocused) {
			classes.push("focused");
		}
		return (
			<div className={classes.join(" ")}>
				<label htmlFor={id}>{label}</label>
				<input
					id={id}
					type="text"
					value={this.state.inputValue}
					placeholder={placeholder}
					onChange={this.handleInput}
					onBlur={this.handleBlur}
					onFocus={this.handleFocus}
					/>
			</div>
		);
	},
});
var TextArea = React.createClass({
	getInitialState: function () {
		return {
			inputValue: this.props.value,
			isFocused: false,
		};
	},
	resizeField: function () {
		var pre = React.findDOMNode(this.refs.pre);
		var field = React.findDOMNode(this.refs.field);
		var height = pre.offsetHeight;

		field.setAttribute("style", "height:" + height + "px");
		//field.clientHeight = pre.clientHeight;
	},
	handleInput: function (e) {
		setTimeout(this.resizeField, 100);
		this.setState({inputValue: e.target.value});
	},
	handleBlur: function (e) {
		this.setState({isFocused: false});
		if (this.props.onBlur) {
			this.props.onBlur(e);
		}
		if (this.props.clearOnBlur) {
			this.setState({inputValue: ""});
		}
	},
	handleFocus: function (e) {
		this.setState({isFocused: true});
	},
	componentDidMount: function () {
		this.resizeField();
	},
	render: function () {
		var id = this.props.id,
			label = this.props.label,
			value = this.props.value,
			placeholder = this.props.placeholder,
			onKeyUp = this.props.onKeyUp;
		var inputValue = this.state.inputValue;
		var empty = (! inputValue);
		var classes = ["textInput", "expandingArea"];
		if (empty) {
			classes.push("empty");
		}
		if (this.state.isFocused) {
			classes.push("focused");
		}
		return (
			<div className={classes.join(" ")}>
				<label htmlFor={id}>{label}</label>
				<pre ref="pre"><span>{this.state.inputValue}</span><br /></pre>
				<textarea
					id={id}
					ref="field"
					type="text"
					value={this.state.inputValue}
					placeholder={placeholder}
					onChange={this.handleInput}
					onBlur={this.handleBlur}
					onFocus={this.handleFocus}
					onKeyUp={onKeyUp}
					></textarea>
			</div>
		);
	},
});

var AppBar = React.createClass({
	render: function () {
		return (
			<div className="appBar">
				<div className="firstLine">
					<h1>{this.props.title}</h1>
					<Link className="newTaskLink" to="inboxNew">+</Link>
				</div>
				<ul className="navigation">
					<li><Link to="inbox">Inbox</Link></li>
					<li><Link to="projects">Projects</Link></li>
					<li><Link to="search">Search</Link></li>
					<li><Link to="auth">Auth</Link></li>
				</ul>
			</div>
		);
	},
});

var InboxView = React.createClass({
	getInitialState: function() {
		return {
			tasks: TaskStore.getAllUncompleted()
		};
	},
	storeDidChange: function () {
		this.setState({tasks: TaskStore.getAll()});
	},
	componentDidMount: function () {
		var unregister = TaskStore.events.change.listen(this.storeDidChange, this);
		this.setState({unregister: unregister});
	},
	componentWillUnmount: function () {
		this.state.unregister();
	},
	render: function () {
		return (
			<div className="inboxView">
				<AppBar title="Inbox" />
				<TaskList tasks={this.state.tasks} />
			</div>
		);
	},
});

var InboxTask = React.createClass({
	mixins: [Navigation],
	getInitialState: function() {
		var taskId = parseInt(this.props.params.taskId);
		return {
			task: TaskStore.getId(taskId),
		};
	},
	storeDidChange: function () {
		var taskId = parseInt(this.props.params.taskId);
		this.setState({
			task: TaskStore.getId(taskId),
		});
	},
	componentDidMount: function () {
		var unregister = TaskStore.events.change.listen(this.storeDidChange, this);
		this.setState({unregister: unregister});
	},
	componentWillUnmount: function () {
		this.state.unregister();
	},
	removeTask: function () {
		TaskStore.remove(parseInt(this.props.params.taskId));
		this.transitionTo("inbox");
	},
	completeTask: function () {
		var now = new Date();
		TaskStore.update(parseInt(this.props.params.taskId),
						 {completed: now});
	},
	render: function () {
		var task = this.state.task;
		var notesList = task.notes || [];
		var extra = (
				<div className="textInput">
				<button className="button primary" onClick={this.completeTask}>Complete</button>
				<button className="button" onClick={this.removeTask} >Remove</button>
				</div>
		);
		return (
			<div className="inboxView">
				<AppBar title={task.title} />
				<DetailsView task={task} extra={extra} />
				<NotesList notes={notesList} taskId={task.id} />
			</div>
		);
	},
});
var InboxNew = React.createClass({
	mixins: [Navigation],
	getInitialState: function () {
		return {
			task: {},
		};
	},
	handleSubmit: function (e) {
		e.preventDefault();
		TaskStore.add(this.state.task);
		this.transitionTo("inbox");
	},
	render: function () {
		var submit = (
				<div className="textInput">
				<input className="button primary" type="submit" value="Add" />
				<input className="button" type="reset" value="Clear" />
				</div>
		);
		return (
			<div className="inboxView">
				<AppBar title="NewTask" />
				<form onSubmit={this.handleSubmit} >
				<DetailsView task={this.state.task} extra={submit} />
				</form>
			</div>
		);
	},
});

var ProjectView = React.createClass({
	render: function () {
		return (
			<div className="projectView">
				<AppBar title="Projects" />
			</div>
		);
	},
});

var SearchView = React.createClass({
	render: function () {
		return (
			<div className="searchView">
				<AppBar title="Search" />
			</div>
		);
	},
});

var DropboxAuthView = React.createClass({
	getInitialState: function () {
		return {
			token: Dropbox.getToken(),
			data: null,
		};
	},
	handleTokenUpdate: function (e) {
		Dropbox.setToken(e.target.value);
		var data = JSON.stringify(TaskStore.getAll());
		var self = this;
		Ajax.createRequest({
			url: 'https://api-content.dropbox.com/1/files_put/auto/tasks.json',
			method: "PUT",
			data: data,
		})
			.then(JSON.parse)
			.then(function (response) {
				console.log("success", response);
				var date = new Date(response.modified);
				console.log(formatDate(date));
				//self.setState({data: response});
			})
			.then(function (response) {
				Ajax.createRequest({
					url: 'https://api-content.dropbox.com/1/files/auto/tasks.json',
					method: "GET",
				})
					.then(JSON.parse)
					.then(function (response) {
						console.log(response);
					});
			});
	},
	render: function () {
		return (
			<div className="dropboxAuthView">
				<AppBar title="Dropbox Authentication" />
				<TextInput id="token" label="Token" onBlur={this.handleTokenUpdate} value={this.state.token} />
				<div>{this.state.data}</div>
			</div>
		);
	},
});

var Application = React.createClass({
	render: function () {
		return (
			<div>
				<RouteHandler />
			</div>
		);
	},
});

var routes = [
	<Route handler={Application}>
		<Route name="inbox" path="/" handler={InboxView} />
		<Route name="inboxNew" path="/inbox/new" handler={InboxNew} />
		<Route name="inboxTask" path="/inbox/:taskId" handler={InboxTask} />

		<Route name="projects" path="/projects/" handler={ProjectView} />

		<Route name="search" path="/search/" handler={SearchView} />

		<Route name="auth" path="/auth/" handler={DropboxAuthView} />
		<NotFoundRoute handler={DropboxAuthView} />
		<Route name="authReturn" path="/access_token" handler={DropboxAuthView} />
	</Route>
];

ReactRouter.run(routes, function (Handler) {
	React.render(<Handler />, document.getElementById('content'));
});

/*
React.render((
	<Application />
), document.getElementById('content'));
*/
