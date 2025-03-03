// hooks/useTasks.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  category: string;
  createdAt: string;
  completedAt?: string;
}

const TASKS_STORAGE_KEY = '@tasks_storage_key';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from storage on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    if (!loading) {
      saveTasks();
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = (text: string, priority: 'Low' | 'Medium' | 'High', dueDate?: string, category: string = 'Personal') => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      dueDate,
      category,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  };

  const updateTask = (id: string, newText: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
  };

  const updateTaskCategory = (id: string, newCategory: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, category: newCategory } : task
      )
    );
  };

  const updateTaskPriority = (id: string, newPriority: 'Low' | 'Medium' | 'High') => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, priority: newPriority } : task
      )
    );
  };

  const updateTaskDueDate = (id: string, newDueDate?: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, dueDate: newDueDate } : task
      )
    );
  };

  const clearCompleted = () => {
    setTasks(prev => prev.filter(task => !task.completed));
  };

  return {
    tasks,
    loading,
    addTask,
    deleteTask,
    toggleTaskComplete,
    updateTask,
    updateTaskCategory,
    updateTaskPriority,
    updateTaskDueDate,
    clearCompleted,
  };
}
