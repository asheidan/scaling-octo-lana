var TaskStore = Store.create();
TaskStore.addNote = function (taskId, noteBody) {
	var task = this.items.get(taskId);
	if (task) {
		task.notes = task.notes || [];
		task.notes.push({timestamp: new Date(), body: noteBody});

		this.events.change();
	}
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
	handleClick: function (event) {
		event.preventDefault();
		this.props.selectTask(this.props.task);
	},
	render: function () {
		var task = this.props.task;
		var tags = task.tags.join(", ");
		return (
			<li className="taskItem" onClick={this.handleClick}>
				<div className="tags">{tags}</div>
				<div className="project"></div>
				<a href="#" className="title">{task.title}</a>
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
		if (this.state.task.id) {
			var payload = {};
			payload[field] = value;
			console.log(this.state.task.id, payload);
			TaskStore.update(this.state.task.id, payload);
		}
	},
	handleTitleChange: function (e) {
		this._updateTask("title", e.target.value);
	},
	handleTagsChange: function (e) {
		this._updateTask("tags", e.target.value);
	},
	handleDescriptionChange: function (e) {
		this._updateTask("description", e.target.value);
	},
	render: function () {
		return (
			<div>
			<div className="detailsView">
				<TextInput label="Title" id="task_title" placeholder="Do dishes" onBlur={this.handleTitleChange} value={this.props.task.title} />
				<TextInput label="Tags" id="task_tags" placeholder="apa, bepa, cepa" onBlur={this.handleTagsChange} value={this.props.task.tags} />
				<TextArea label="Description" id="task_description" placeholder="Longform description of the task" onBlur={this.handleDescriptionChange} value={this.props.task.description} />
			</div>
				<NotesList notes={this.props.task.notes} taskId={this.props.task.id} />
				</div>
		);
	},
});

var NotesList = React.createClass({
	addNote: function (event) {
		event.preventDefault();
		var element = event.target["body"];
		var body = element.value.trim();
		console.log(body);
		if (body == "") { return; }

		TaskStore.addNote(this.props.taskId, body);

		this.refs.body.setState({inputValue: ""});
	},
	render: function () {
		var notes;
		if (this.props.notes) {
			notes = this.props.notes.map(function (note) {
				return (
					<li>
						{note.body}
						<div className="timestamp">{note.timestamp.toISOString()}</div>
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
				<TextInput label="Add note" id="task_add_note" placeholder="Text of note" ref="body" name="body" />
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
		var {id, label, value, placeholder, onBlur, ...other} = this.props;
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
			{...other}
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
	handleInput: function (e) {
		this.setState({inputValue: e.target.value});
	},
	handleBlur: function (e) {
		this.setState({isFocused: false});
	},
	handleFocus: function (e) {
		this.setState({isFocused: true});
	},
	render: function () {
		var {id, label, value, placeholder, ...other} = this.props;
		var inputValue = this.state.inputValue;
		var empty = (! inputValue);
		var classes = ["textInput", "expandingArea"];
		if (empty) {
			classes.push("empty");
		}
		if (this.state.isFocused) {
			classes.push("focused");
		}
		// 				<pre><span>{this.state.inputValue}</span><br /></pre>
		return (
			<div className={classes.join(" ")}>
				<label htmlFor={id}>{label}</label>
				<textarea
					id={id}
					type="text"
					value={this.state.inputValue}
					placeholder={placeholder}
					onChange={this.handleInput}
					onBlur={this.handleBlur}
					onFocus={this.handleFocus}
					{...other}></textarea>
			</div>
		);
	},
});

var AppBar = React.createClass({
	render: function () {
		return (
			<div className="appBar">
				<h1>{this.props.title}</h1>
				<a href="#">+</a>
			</div>
		);
	},
});

var InboxView = React.createClass({
	getInitialState: function() {
		return {
			tasks: TaskStore.getAll(),
			selectedTask: null,
		};
	},
	selectTask: function (task) {
		this.setState({selectedTask: task});
	},
	createTask: function () {
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
		var bar;
		var content;
		if (this.state.selectedTask) {
			title = this.state.selectedTask.title;
			bar = (
				<AppBar title={title} />
			);
			content = (
				<DetailsView task={this.state.selectedTask} />
			);
		}
		else {
			bar = (
				<AppBar title="Inbox" />
			);
			content = (
				<TaskList tasks={this.state.tasks} select={this.selectTask} />
			);
		}
		return (
			<div className="inboxView">
				{bar}
				{content}
			</div>
		);
	},
});

var NewTaskView = React.createClass({
	getInitialState: function () {
		return {
			task: {},
		};
	},
	render: function () {
		return (
			<div className="newTaskView">
				<AppBar title="NewTask" />
				<DetailsView task={this.state.task} />
			</div>
		);
	},
});



var Application = React.createClass({
	render: function () {
		var content;
		content = ( <InboxView select={this.selectTask} /> );
		return (
			<div>
				{content}
			</div>
		);
	},
});

React.render((
	<Router history={history}>
		<Route path="/" component={Application}>
			<Route path="inbox" component={InboxView}/>
		</Route>
	</Router>
), document.getElementById('content'));
