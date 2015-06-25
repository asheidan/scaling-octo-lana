var LazyInput = React.createClass({
	getInitialState: function () {
		var state = {};
		state.inputValue = this.props.value;
		return state;
	},
	handleInput: function (e) {
		this.setState({inputValue: e.target.value});
	},
	render: function () {
		var { value, onChange, ...other } = this.props;
		return (
				<input type="text" onChange={this.handleInput} value={this.state.inputValue} />
		);
	},
});


var DateInput = React.createClass({
	validationRegexp: /^\d{4}-\d{2}-\d{d} \d{2}:\d{2}:\d{2}/,
	format: function (value) {
		if (typeof value == "string") {
			return value;
		}
		else if (Date.prototype.isPrototypeOf(value)) {
			return value.toISOString();
		}
		return value;
	},
	getInitialState: function () {
		return {
			inputValue: this.format(this.props.value)
		};
	},
	onBlur: function (e) {
		//e.target.value = this.state.inputValue;
		this.props.onChange(e);
	},
	handleInput: function (e) {
		this.setState({inputValue: e.target.value});
	},
	render: function () {
		var { value, onChange, ...other } = this.props;
		return (
			<input
				type="text"
				value={this.state.inputValue}
				placeholder="yyyy-mm-dd HH:MM:SS"
				onChange={this.handleInput}
				onBlur={this.onBlur} />
		);
	},
});

ResizingTextarea = React.createClass({
	onChange: function (e) {},
	render: function () {
		var { value, onChange, ...other } = this.props;
		return (
			<div className="expandingArea">
				<pre><span></span><br /></pre>
				<textarea value={value} onChange={this.onChange}  />
			</div>
		);
	},
});
