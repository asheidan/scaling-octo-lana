"use strict";

var ProjectStore = Store.create();
var cleanup = ProjectStore.add({title: "Cleanup"});
ProjectStore.add({title: "The Seasoning"});
ProjectStore.add({title: "Fixa bilen"});


var TaskStore = Store.create();
TaskStore.add({title: "Bada nisse", projectId: cleanup, description: "Nisse är riktigt smutsig och behöver verkligen bada. Att inte bada är inte vore katastrofalt och skulle kunna leda till en sanitär olägenhet.", tags: ["apa", "bepa", "cepa"], created: "2015-01-01 12:24:40"});
TaskStore.add({title: "Herpa derp", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae lectus ac libero consectetur congue tincidunt vitae turpis. Mauris placerat ex et purus luctus varius. Vivamus elit enim, semper eu arcu at, dignissim sollicitudin lectus. Morbi non magna vitae eros lobortis scelerisque sit amet vel turpis. Nullam risus felis, ornare sed nisi ac, fringilla elementum nunc. Fusce tempus, quam ut eleifend luctus, lacus odio euismod risus, eu sagittis leo lorem in sem. Vestibulum tristique neque scelerisque, rutrum libero non, placerat nibh. Maecenas ut dolor vitae ligula tempus finibus ut nec erat. In et arcu nec massa rutrum ultricies.", tags: ["derp", "derp", "derp"]});
TaskStore.getTasksForProject = function (projectId) {
	var it = this.items.values();
	var result = [];
	for (var task of it) {
		if (projectId === task.projectId) {
			result.push(task);
		}
	}

	return result;
};

var ProjectItem = React.createClass({
	clickHandler: function (event) {
		event.preventDefault();
		this.props.select(this.props.project);
	},
	render: function () {
		var className;
		if (this.props.current) {
			className = "current";
		}
		return (
			<li className={className} onClick={this.clickHandler} >{this.props.project.title}</li>
		);
	},
});

var ProjectList = React.createClass({
	render: function () {
		var currentProject = this.props.currentProject;
		var selectHandler = this.props.select;
		var projectNodes = this.props.projects.map(function (project) {
			var isCurrent = (project.id == currentProject.id);
			return (
					<ProjectItem key={project.id} project={project} current={isCurrent} select={selectHandler} />
			);
		});
		return (
				<ul className="projectList">{projectNodes}</ul>
		);
	},
});

var TaskItem = React.createClass({
	clickHandler: function (event) {
		event.preventDefault();
		this.props.select(this.props.task);
	},
	render: function () {
		var tags = (this.props.task.tags || []).join(", ");
		var className = ["taskItem"];
		if (this.props.current) {
			className.push("current");
		}
		return (
				<div className={className.join(" ")} onClick={this.clickHandler}>
				<div className="tags">
					{tags}
				</div>
				<div className="title">
					{this.props.task.title}
				</div>
			</div>
		);
	}
});

var TaskList = React.createClass({
	render: function () {
		var callback = this.props.select;
		var currentTaskId = this.props.currentTask.id
		var taskNodes = this.props.tasks.map(function (task) {
			var isCurrent = (task.id == currentTaskId);
			return (
				<TaskItem key={task.id} task={task} current={isCurrent} select={callback} />
			);
		});
		return (
			<div className="taskList">
				<SmartBox />
				{taskNodes}
			</div>
		);
	}
});

var ProjectView = React.createClass({
	getInitialState: function () {
		return {
			currentProject: {id: null},
			currentTask: {id: null},
			projects: ProjectStore.getAll(),
			tasks: [],
		};
	},
	storeDidChange: function () {},
	componentDidMount: function () {
		var unregister = ProjectStore.events.change.listen(this.storeDidChange, this);
		this.setState({unregister: unregister});
	},
	componentWillUnmount: function () {
		this.state.unregister();
	},
	selectProject: function (project) {
		var tasks = TaskStore.getTasksForProject(project.id);
		this.setState({
			currentProject: ProjectStore.getId(project.id),
			currentTask: {id: null},
			tasks: tasks,
		});
	},
	selectTask: function (task) {
		this.setState({currentTask: TaskStore.getId(task.id)});
	},
	render: function () {
		return (
			<div className="projectView">
				<ProjectList projects={this.state.projects} currentProject={this.state.currentProject} select={this.selectProject} />
				<DetailView project={this.state.currentProject} task={this.state.currentTask} />
				<SmartBox />
				<TaskList tasks={this.state.tasks} currentTask={this.state.currentTask} select={this.selectTask} />
			</div>
		);
	},
});

var ViewSelection = React.createClass({
	render: function () {
		return (
			<ul className="viewSelection">
				<li className="current"><div className="icon">I</div>Inbox</li>
				<li><div className="icon">P</div>Projects</li>
				<li><div className="icon">C</div>Contexts</li>
				<li><div className="icon">R</div>Review</li>
				<li><div className="icon">S</div>Search</li>
			</ul>
		);
	},
});

var DetailView = React.createClass({
	getInitialState: function () {
		return {
			title: this.props.title,
			description: this.props.description,
			notes: [],
		};
	},
	taskTitleChanged: function (event) {
		TaskStore.update(this.props.task.id, {title: event.target.value});
	},
	taskDescriptionChanged: function (event) {
		TaskStore.update(this.props.task.id, {description: event.target.value});
	},
	taskCreatedChanged: function (event) {
		TaskStore.update(this.props.task.id, {created: event.target.value});
	},
	taskModifiedChanged: function (event) {
		TaskStore.update(this.props.task.id, {modified: event.target.value});
	},
	render: function () {
		var task = this.props.task;
		var tags = (task.tags || []).sort().join(", ");
		return (
			<div className="detailView">
				<StoreStatus store={TaskStore} />
				<h4>Title</h4>
				<input type="text" value={task.title} onChange={this.taskTitleChanged} />

				<h4>Description</h4>
				<textarea key={task.id} value={task.description} onChange={this.taskDescriptionChanged}  />

				<h4>Tags</h4>
				<input type="text" value={tags} />
				<hr />

				<h4>Project</h4>
				<hr />

				<h4>Dates</h4>
				<p>
				<div>
					<label>Due</label>
					<DateInput key={task.id} value={task.due} onChange={this.taskCreatedChanged} />
				</div>
				<div>
					<label>Deferred</label>
					<DateInput key={task.id} value={task.deferred} onChange={this.taskCreatedChanged} />
				</div>
				</p>
				<p>
				<div>
					<label>Created</label>
					<DateInput key={task.id} value={task.created} onChange={this.taskCreatedChanged} />
				</div>
				<div>
					<label>Modified</label>
					<DateInput key={task.id} value={task.modified} onChange={this.taskModifiedChanged} />
				</div>
				</p>
				<hr />

				<h4>Notes</h4>
				<textarea></textarea>
				<TaskNotesList notes={this.state.notes} />

			</div>
		);
	},
});

var TaskNotesList = React.createClass({
	render: function () {
		return (
				<p>
				<div>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
				<div><em>2015-05-25 23:55:56</em></div>
				</p>
		);
	},
});

var SmartBox = React.createClass({
	getInitialState: function () {
		return {inputValue:""};
	},
	handleInput: function (e) {
		this.setState({inputValue: e.target.value});
	},
	onBlur: function (e) {
		TaskStore.add({title: e.target.value});
		this.setState({inputValue: ""});
	},
	render: function () {
		return (
			<div className="smartBox">
				<input type="text" placeholder="Create new task" value={this.state.inputValue} onChange={this.handleInput} onBlur={this.onBlur} />
			</div>
		);
	},
});

var InboxView = React.createClass({
	getInitialState: function () {
		return {
			currentTask: {id: null},
			tasks: TaskStore.getAll(),
		};
	},
	updateTask: function (id, payload) {
		TaskStore.update(id, payload);
		//this.setState({currentTask: payload});
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
	selectTask: function (task) {
		this.setState({currentTask: TaskStore.getId(task.id)});
	},
	render: function () {
		return (
			<div className="inboxView">
				<DetailView task={this.state.currentTask} updateTask={this.updateTask} />
				<TaskList tasks={this.state.tasks} currentTask={this.state.currentTask} select={this.selectTask} />
			</div>
		);
	},
});

var Application = React.createClass({
	render: function () {
		return (
			<div>
				<ViewSelection />
				<InboxView />
			</div>
		);
	}
});

var StoreStatus = React.createClass({
	getInitialState: function () {
		return {
			inSync: this.props.store.inSync,
			unsubscribe: function () {},
		};
	},
	componentDidMount: function () {
		var store = this.props.store;
		var outOfSync = store.events.change.listen(this.storeOutOfSync, this);
		var inSync = store.events.synced.listen(this.storeInSync, this);

		this.setState({unsubscribe: function () {
			outOfSync();
			inSync();
		}});
	},
	componentWillUnmount: function () {
		this.state.unsubscribe();
	},
	storeOutOfSync: function () {
		this.setState({inSync: false});
	},
	storeInSync: function () {
		this.setState({inSync: true});
	},
	render: function () {
		var icon = this.state.inSync ? "yes" : "no";
		return (
			<div>In sync: {icon}</div>
		);
	},
});


React.render(<Application />, document.getElementById('content'));
