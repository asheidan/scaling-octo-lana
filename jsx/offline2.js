var TaskStore = Store.create();
TaskStore.add({title: "Bada nisse", description: "Nisse är riktigt smutsig och behöver verkligen bada. Att inte bada är inte vore katastrofalt och skulle kunna leda till en sanitär olägenhet.", tags: ["apa", "bepa", "cepa"], created: "2015-01-01 12:24:40"});
TaskStore.add({title: "Herpa derp", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae lectus ac libero consectetur congue tincidunt vitae turpis. Mauris placerat ex et purus luctus varius. Vivamus elit enim, semper eu arcu at, dignissim sollicitudin lectus. Morbi non magna vitae eros lobortis scelerisque sit amet vel turpis. Nullam risus felis, ornare sed nisi ac, fringilla elementum nunc. Fusce tempus, quam ut eleifend luctus, lacus odio euismod risus, eu sagittis leo lorem in sem. Vestibulum tristique neque scelerisque, rutrum libero non, placerat nibh. Maecenas ut dolor vitae ligula tempus finibus ut nec erat. In et arcu nec massa rutrum ultricies.", tags: ["derp", "derp", "derp"]});

var TaskList = React.createClass({
	getInitialState: function() {
		return {
			tasks: TaskStore.getAll(),
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
		var select = this.props.select;
		var taskNodes = this.state.tasks.map(function (task) {
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
				<div className="title">{task.title}</div>
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
	handleTitleChange: function (e) {
		console.log("update task title", e.target.value);
	},
	handleTagsChange: function (e) {
		console.log("update task tags", e.target.value);
	},
	handleDescriptionChange: function (e) {
		console.log("update task description", e.target.value);
	},
	render: function () {
		return (
				<div className="detailsView">
					<TextInput label="Title" id="task_title" placeholder="Do dishes" onBlur={this.handleTitleChange} value={this.props.task.title} />
				<TextInput label="Tags" id="task_tags" placeholder="apa, bepa, cepa" onBlur={this.handleTagsChange} value={this.props.task.tags} />
				<TextArea label="Description" id="task_description" placeholder="Longform description of the task" onBlur={this.handleDescriptionChange} value={this.props.task.description} />
				</div>
		);
	},
});

var TaskView = React.createClass({
	render: function () {
		return (
			<div className="taskView">
				<AppBar title={this.props.task.title} />
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
	},
	handleFocus: function (e) {
		this.setState({isFocused: true});
	},
	render: function () {
		var {id, label, value, placeholder, ...other} = this.props;
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
		//<pre>span></span><br /></pre>
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
	render: function () {
		return (
			<div className="inboxView">
				<AppBar title="Inbox" />
				<TaskList select={this.props.select} />
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
	getInitialState: function () {
		return {
			selectedTask: null,
		};
	},
	selectTask: function (task) {
		this.setState({selectedTask: task});
	},
	render: function () {
		var content;
		if (null === this.state.selectedTask) {
			content = ( <InboxView select={this.selectTask} /> );
		}
		else {
			content = ( <TaskView task={this.state.selectedTask} /> );
		}
		return (
			<div>
				<NewTaskView />
			</div>
		);
	},
});

React.render(<Application />, document.getElementById('content'));
