# Simple Zero Source Todo App

## Description

A minimalist todo list application that allows users to create, manage, and track tasks. This application demonstrates the Zero Source methodology, where software is generated from README specifications.

## Functionality

### Core Features

- Add new tasks with title and optional description
- Mark tasks as complete/incomplete
- Delete tasks
- Filter tasks by status (all, active, completed)
- Store tasks in local storage for persistence

### User Interface

The application should have a clean, minimalist interface with:

```
+----------------------------------------------+
| My Todo List                       [+ Add]   |
+----------------------------------------------+
| Filters: [All] [Active] [Completed]          |
+----------------------------------------------+
| ☐ Buy groceries                      [✕]    |
| ☑ Pay bills                          [✕]    |
| ☐ Call doctor                        [✕]    |
+----------------------------------------------+
| 2 items left                                 |
+----------------------------------------------+
```

- Header with app title and add button
- Filter options
- Task list with checkbox, task name, and delete button
- Footer with count of remaining tasks

### Task Interactions

- Click on checkbox to toggle completion status
- Click on task name to edit it
- Click the delete button to remove a task
- Click the add button to create a new task

## Technical Implementation

### Data Model

Each task should be represented as an object with:

```javascript
{
  id: string,       // Unique identifier
  title: string,    // Task name
  completed: boolean, // Completion status
  createdAt: Date   // Creation timestamp
}
```

### Architecture

The application should follow a simple MVC architecture:

- **Model**: Manage the task data and business logic
- **View**: Render the UI and handle user interaction
- **Controller**: Connect the model and view, handle events

### Storage

Use the browser's localStorage API to persist tasks between sessions:

```javascript
// Save tasks
localStorage.setItem('todos', JSON.stringify(tasks));

// Load tasks
const tasks = JSON.parse(localStorage.getItem('todos')) || [];
```

## Style Guide

- Use a neutral color palette
- Primary color: #4a90e2
- Font: System default sans-serif
- Completed tasks should have a line-through style and muted color
- Hover effects on interactive elements
- Smooth transitions for status changes

## Accessibility Requirements

- Ensure proper focus management
- Use semantic HTML elements
- Include appropriate ARIA attributes
- Support keyboard navigation
- High contrast between text and background

<!-- ZS:PLATFORM:WEB -->
<!-- ZS:LANGUAGE:JAVASCRIPT -->
<!-- ZS:COMPLEXITY:LOW -->
