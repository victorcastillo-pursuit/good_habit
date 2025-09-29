import React, { useState } from "react";
import { Plus, Check, X, Bell } from "lucide-react";
import "./App.css";

export default function HabitTracker() {
  const [habits, setHabits] = useState([
    {
      id: 1,
      name: "Morning Workout",
      completed: false,
      streak: 5,
      reminderTime: "08:00",
    },
    {
      id: 2,
      name: "Drink 8 Glasses of Water",
      completed: false,
      streak: 3,
      reminderTime: "12:00",
    },
    {
      id: 3,
      name: "Evening Meditation",
      completed: true,
      streak: 7,
      reminderTime: "18:00",
    },
  ]);
  const [newHabit, setNewHabit] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleHabit = (id) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([
        ...habits,
        {
          id: Date.now(),
          name: newHabit,
          completed: false,
          streak: 0,
          reminderTime: "09:00",
        },
      ]);
      setNewHabit("");
      setShowAddForm(false);
    }
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header">
          <h1>Good Habit</h1>
          <p>Build better habits, one day at a time</p>
        </div>

        <div className="stats-card">
          <div className="stat-item">
            <p className="stat-number">{habits.length}</p>
            <p className="stat-label">Total Habits</p>
          </div>
          <div className="stat-item">
            <p className="stat-number completed">
              {habits.filter((h) => h.completed).length}
            </p>
            <p className="stat-label">Completed Today</p>
          </div>
          <div className="stat-item">
            <p className="stat-number streak">
              {Math.max(...habits.map((h) => h.streak), 0)}
            </p>
            <p className="stat-label">Best Streak</p>
          </div>
        </div>

        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="add-button">
            <Plus size={20} />
            Add New Habit
          </button>
        )}

        {showAddForm && (
          <div className="add-form-card">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Enter habit name..."
              className="habit-input"
              onKeyPress={(e) => e.key === "Enter" && addHabit()}
            />
            <div className="form-buttons">
              <button onClick={addHabit} className="submit-button">
                Add Habit
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="habits-list">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`habit-card ${habit.completed ? "completed" : ""}`}
            >
              <div className="habit-content">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`check-button ${habit.completed ? "checked" : ""}`}
                >
                  {habit.completed && <Check size={20} />}
                </button>

                <div className="habit-info">
                  <h3
                    className={
                      habit.completed
                        ? "habit-name completed-text"
                        : "habit-name"
                    }
                  >
                    {habit.name}
                  </h3>
                  <div className="habit-meta">
                    <span className="streak-badge">
                      🔥 {habit.streak} day streak
                    </span>
                    <span className="reminder-time">
                      <Bell size={14} />
                      {habit.reminderTime}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="delete-button"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {habits.length === 0 && (
          <div className="empty-state">
            <p className="empty-title">No habits yet!</p>
            <p className="empty-subtitle">
              Click "Add New Habit" to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
