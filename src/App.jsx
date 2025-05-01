import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { TaskList } from './pages/TaskList';
import './App.css';
import axios from 'axios';

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN || 'test_token',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP || 'управление расходами'}`,
      getState,
      nativePanel: {
        defaultText: 'Что вы хотите сделать?',
        screenshotMode: false,
      },
    });
  }
  return createAssistant({ getState });
};

const getOrCreateUserId = () => {
  let userId = localStorage.getItem('expenseTrackerUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('expenseTrackerUserId', userId);
  }
  return userId;
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.userId = getOrCreateUserId();
    this.state = {
      tasks: [],
      categories: ["Продукты", "Транспорт", "ЖКХ", "Развлечения", "Одежда"],
      newCategory: "",
      selectedTaskId: null,
      assistantError: null,
      isLoading: false
      
    };
  }

  setupAssistant() {
    this.assistant.on('data', (event) => {
      if (event.type === 'error') {
        this.setState({ assistantError: 'Ошибка соединения с ассистентом' });
        return;
      }
      this.processAssistantAction(event.action);
    });

    this.assistant.on('start', () => {
      this.setState({ assistantError: null });
    });
  }

  processAssistantAction(action) {
    if (!action) return;

    switch (action.type) {
      case 'add_note':
        this.handleAddTask(action.note, action.price, action.category || 'Другое');
        break;
      case 'delete_note':
        this.handleDeleteTask(action.id);
        break;
      case 'select_task':
        this.setState({ selectedTaskId: action.id });
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  handleAddTask = async (title, amount, category) => {
    const newTask = {
      id: Date.now(),
      title,
      amount: Number(amount),
      category,
      userId: this.userId
    };

    try {
      const response = await axios.post('https://servachello.onrender.com/api/expenses', newTask);
      this.setState(prevState => ({
        tasks: [...prevState.tasks, response.data]
      }));
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
      this.setState({ assistantError: 'Не удалось добавить задачу' });
    }
  };

  handleDeleteTask = async (taskId) => {
    // Жёсткая проверка ID
    if (!taskId || taskId === 'undefined') {
      alert('Ошибка: некорректный ID задачи');
      return;
    }
  
    try {
      const response = await axios.delete(
        `https://servachello.onrender.com/api/expenses/${taskId}`,
        { params: { userId: this.userId } }
      );
  
      if (response.data.success) {
        this.setState(prevState => ({
          tasks: prevState.tasks.filter(task => task.id !== taskId),
          selectedTaskId: null
        }));
      }
    } catch (error) {
      console.error('Delete Error:', error.response?.data || error.message);
      alert(`Ошибка удаления: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };
  
  handleSelectTask = (taskId) => {
    this.setState({ selectedTaskId: taskId });
  };

  handleAddCategory = (category) => {
    if (category.trim() && !this.state.categories.includes(category)) {
      this.setState(prevState => ({
        categories: [...prevState.categories, category]
      }));
      return true;
    }
    return false;
  };

  async componentDidMount() {
    try {
      const response = await axios.get('https://servachello.onrender.com/api/expenses', {
        params: { userId: this.userId },
        headers: {
          'Cache-Control': 'no-cache' // Отключаем кэширование
        }
      });
      
      this.setState({ 
        tasks: response.data || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Load Error:', error.response?.data || error.message);
      this.setState({ 
        assistantError: 'Ошибка загрузки данных',
        isLoading: false
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getStateForAssistant() {
    return {
      tasks: this.state.tasks,
      categories: this.state.categories
    };
  }

  render() {
    return (
      <div className="app-container">
        <h1>Управление расходами</h1>
        {this.state.assistantError && (
          <div className="assistant-error">{this.state.assistantError}</div>
        )}
        <TaskList
          tasks={this.state.tasks}
          categories={this.state.categories}
          onAdd={this.handleAddTask}
          onDelete={this.handleDeleteTask}
          onAddCategory={this.handleAddCategory}
          selectedTaskId={this.state.selectedTaskId}
          onSelectTask={this.handleSelectTask}
        />
      </div>
    );
  }
}

export default App;
