// components/ui/TaskItem.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, StyleSheet, View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface Task {
  id: string;
  text: string;
  completed?: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  category: string;
  createdAt: string;
  completedAt?: string;
}

interface TaskItemProps {
  task: Task;
  onDelete: () => void;
  onToggleComplete: () => void;
  onUpdate: (newText: string) => void;
  onUpdateCategory: (category: string) => void;
  onUpdatePriority: (priority: 'Low' | 'Medium' | 'High') => void;
  onUpdateDueDate: (dueDate?: string) => void;
  categories: string[];
}

export default function TaskItem({
  task,
  onDelete,
  onToggleComplete,
  onUpdate,
  onUpdateCategory,
  onUpdatePriority,
  onUpdateDueDate,
  categories,
}: TaskItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSaveEdit = () => {
    if (editedText.trim() === '') return;
    onUpdate(editedText.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(task.text);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#FF4444';
      case 'Medium':
        return '#FFA000';
      case 'Low':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={onToggleComplete} style={styles.textWrapper}>
        <View style={styles.taskHeader}>
          <View style={styles.priorityBadge}>
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            />
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
          {task.dueDate && (
            <Text style={styles.dueDate}>
              Due: {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
        {isEditing ? (
          <TextInput
            style={[styles.taskText, styles.editInput]}
            value={editedText}
            onChangeText={setEditedText}
            autoFocus
            onSubmitEditing={handleSaveEdit}
          />
        ) : (
          <Text style={[styles.taskText, task.completed && styles.completedText]}>
            {task.text}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        {isEditing ? (
          <>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.iconButton}>
              <Ionicons name="checkmark-done-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelEdit} style={styles.iconButton}>
              <Ionicons name="close-circle-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setShowOptionsModal(true)}
              style={styles.iconButton}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#FF6F61" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color="#FF6F61" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
              <Ionicons name="trash-bin-outline" size={20} color="#FF6F61" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Task Options</Text>

            <Text style={styles.label}>Category</Text>
            <Picker
              selectedValue={task.category}
              style={styles.picker}
              onValueChange={(value) => {
                onUpdateCategory(value);
                setShowOptionsModal(false);
              }}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>

            <Text style={styles.label}>Priority</Text>
            <Picker
              selectedValue={task.priority}
              style={styles.picker}
              onValueChange={(value) => {
                onUpdatePriority(value);
                setShowOptionsModal(false);
              }}
            >
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>

            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {task.dueDate ? formatDate(task.dueDate) : 'Set Due Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={task.dueDate ? new Date(task.dueDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              onUpdateDueDate(selectedDate.toISOString());
            }
          }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
  },
  textWrapper: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  editInput: {
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#FF6F61',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  iconButton: {
    marginHorizontal: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  picker: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF6F61',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
