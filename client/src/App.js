/* eslint-disable */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { getClient } from 'kesen';
import { compose } from 'react-komposer';

import './App.css';
import Task from './Task.js';
import { Tasks } from './collections/Tasks';
import { getTrackerLoader } from './utils/tracker';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    const client = getClient();
    client.call('tasks.insert', text).catch(err => console.error(err.message));

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks || [];
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map(task => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return <Task key={task._id} task={task} showPrivateButton={showPrivateButton} />;
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

          {/* {this.props.currentUser ? ( */}
          <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
            <input type="text" ref="textInput" placeholder="Type to add new tasks" />
          </form>
          {/* ) : (
            ''
          )} */}
        </header>

        <ul>{this.renderTasks()}</ul>
      </div>
    );
  }
}

function reactiveMapper(subscribe, props, onData) {
  const handle = subscribe('tasks');
  const client = getClient();
  if (handle.ready) {
    onData(null, {
      tasks: Tasks.find(),
      incompleteCount: Tasks.find({ checked: { $ne: true } }).length,
      currentUser: client.getUserId()
    });
  }
}

export default compose(getTrackerLoader(reactiveMapper))(App);
