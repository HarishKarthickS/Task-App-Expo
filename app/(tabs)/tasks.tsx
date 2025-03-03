// app/(tabs)/tasks.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  Animated,
  Modal,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-datetimepicker/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useTasks } from '../../hooks/useTasks';
import TaskItem from '../../components/ui/TaskItem';

export default function TasksScreen() {
  const {
    tasks,
    addTask,
    deleteTask,
    toggleTaskComplete,
    updateTask,
    clearCompleted
  } = useTasks();
  const [taskInput, setTaskInput] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('Personal');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'category'>('dueDate');
  const [showStats, setShowStats] = useState(false);

  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Education', 'Other'];

  const handleAddTask = () => {
    if (!taskInput.trim()) return Alert.alert('Error', 'Please enter a valid task.');
    const formattedDueDate = dueDate ? dueDate.toISOString().split('T')[0] : undefined;
    addTask(taskInput.trim(), priority, formattedDueDate, category);
    setTaskInput('');
    setDueDate(null);
    setPriority('Medium');
    setCategory('Personal');
  };

  const sortedAndFilteredTasks = tasks
    .filter(task => {
      if (filter === 'Completed' && !task.completed) return false;
      if (filter === 'Pending' && task.completed) return false;
      if (searchQuery.trim() && !task.text.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return (a.dueDate || '') > (b.dueDate || '') ? 1 : -1;
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'category':
          return (a.category || '') > (b.category || '') ? 1 : -1;
        default:
          return 0;
      }
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'High').length,
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    // For Android, dismiss the picker after selection or cancel.
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <LinearGradient colors={['#FF6F61', '#FF9A8D']} style={styles.gradientContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>My Tasks</Text>

        {/* Stats Card */}
        <TouchableOpacity 
          style={styles.statsCard}
          onPress={() => setShowStats(!showStats)}
        >
          <Text style={styles.statsTitle}>Task Statistics</Text>
          {showStats && (
            <View style={styles.statsContent}>
              <Text style={styles.statText}>Total Tasks: {stats.total}</Text>
              <Text style={styles.statText}>Completed: {stats.completed}</Text>
              <Text style={styles.statText}>Pending: {stats.pending}</Text>
              <Text style={styles.statText}>High Priority: {stats.highPriority}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Search and Sort Section */}
        <View style={styles.searchSortContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#fff"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => {
              const options = ['dueDate', 'priority', 'category'];
              const currentIndex = options.indexOf(sortBy);
              setSortBy(options[(currentIndex + 1) % options.length] as any);
            }}
          >
            <Ionicons name="funnel" size={20} color="#fff" />
            <Text style={styles.sortButtonText}>{`Sort: ${sortBy}`}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {(['All', 'Completed', 'Pending'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === f && styles.filterButtonTextActive
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task List */}
        <FlatList
          data={sortedAndFilteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View>
              <TaskItem
                task={item}
                onDelete={() => deleteTask(item.id)}
                onToggleComplete={() => toggleTaskComplete(item.id)}
                onUpdate={(newText) => updateTask(item.id, newText)}
              />
            </Animated.View>
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      category === cat && styles.categoryOptionSelected
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={styles.categoryOptionText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Bottom Input Section */}
        <View style={styles.bottomInputSection}>
          <TextInput
            style={styles.taskInput}
            placeholder="New Task"
            placeholderTextColor="#999"
            value={taskInput}
            onChangeText={setTaskInput}
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.calendarButton}
          >
            <Ionicons name="calendar-outline" size={24} color="#FF6F61" />
            <Text style={styles.calendarText}>
              {dueDate ? dueDate.toISOString().split('T')[0] : 'Due Date'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name="folder-outline" size={24} color="#FF6F61" />
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
          <View style={styles.dropdownContainer}>
            <Picker
              selectedValue={priority}
              style={styles.picker}
              onValueChange={(itemValue) => setPriority(itemValue)}
              mode="dropdown"
            >
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </View>
          <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* DateTime Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* Clear Completed Button */}
        {tasks.some(task => task.completed) && (
          <TouchableOpacity onPress={clearCompleted} style={styles.clearButton}>
            <Ionicons name="trash-bin" size={20} color="#fff" />
            <Text style={styles.clearText}>Clear Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterButtonText: {
    color: '#fff',
  },
  filterButtonTextActive: {
    color: '#FF6F61',
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  bottomInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  taskInput: {
    flex: 2,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: '#333',
  },
  calendarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarText: {
    marginLeft: 4,
    color: '#333',
  },
  dropdownContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#FF6F61',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 10,
    alignItems: 'center',
  },
  clearText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  statsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    width: '48%',
    marginBottom: 5,
  },
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  sortButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryOptionSelected: {
    backgroundColor: '#FF6F61',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  categoryText: {
    marginLeft: 4,
    color: '#333',
    fontSize: 12,
  },
});
