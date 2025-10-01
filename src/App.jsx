import React, { useState, useEffect } from "react";
import { Plus, Check, X, Bell, LogOut } from "lucide-react";
import "./App.css";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { sendHabitReminder, shouldSendReminder } from "./emailService";

export default function HabitTracker() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastChecked, setLastChecked] = useState({});
  const [reminderTime, setReminderTime] = useState("09:00");

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHabits(currentUser.uid);
      } else {
        setHabits([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check for reminders every minute
  useEffect(() => {
    if (!user || habits.length === 0) return;

    const checkReminders = async () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      for (const habit of habits) {
        // Check if we should send reminder and haven't sent one today
        if (shouldSendReminder(habit)) {
          const checkKey = `${habit.id}-${currentTime}`;

          // Only send if we haven't sent for this habit at this time today
          if (!lastChecked[checkKey]) {
            console.log(`Sending reminder for: ${habit.name}`);
            const result = await sendHabitReminder(habit, user.displayName);

            if (result.success) {
              setLastChecked((prev) => ({ ...prev, [checkKey]: true }));
              console.log(`Email sent for ${habit.name}`);
            }
          }
        }
      }
    };

    // Check immediately
    checkReminders();

    // Then check every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [user, habits, lastChecked]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setHabits([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchHabits = async (userId) => {
    try {
      const q = query(collection(db, "habits"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const habitsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(habitsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching habits:", error);
      setLoading(false);
    }
  };

  const toggleHabit = async (id) => {
    try {
      const habit = habits.find((h) => h.id === id);
      const habitRef = doc(db, "habits", id);

      await updateDoc(habitRef, {
        completed: !habit.completed,
      });

      setHabits(
        habits.map((habit) =>
          habit.id === id ? { ...habit, completed: !habit.completed } : habit
        )
      );
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const addHabit = async () => {
    if (newHabit.trim() && user) {
      try {
        const newHabitData = {
          name: newHabit,
          completed: false,
          streak: 0,
          reminderTime: reminderTime, // Use the state instead of hardcoded
          userId: user.uid,
          userEmail: user.email,
          createdAt: new Date(),
        };

        const docRef = await addDoc(collection(db, "habits"), newHabitData);

        setHabits([...habits, { id: docRef.id, ...newHabitData }]);
        setNewHabit("");
        setReminderTime("09:00"); // Reset to default
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding habit:", error);
      }
    }
  };

  const deleteHabit = async (id) => {
    try {
      await deleteDoc(doc(db, "habits", id));
      setHabits(habits.filter((habit) => habit.id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="app-container">
        <div className="content-wrapper">
          <div className="header">
            <h1>Good Habit</h1>
            <p>Build better habits, one day at a time</p>
          </div>
          <div className="login-card">
            <h2>Welcome!</h2>
            <p>Sign in to start tracking your habits</p>
            <button onClick={signInWithGoogle} className="google-signin-button">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z"
                  fill="#4285F4"
                />
                <path
                  d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z"
                  fill="#FBBC05"
                />
                <path
                  d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="content-wrapper">
          <div className="header">
            <h1>Good Habit</h1>
            <p>Loading your habits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header">
          <div className="header-content">
            <div>
              <h1>Good Habit</h1>
              <p>Build better habits, one day at a time</p>
            </div>
            <div className="user-info">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="user-avatar"
              />
              <span className="user-name">{user.displayName}</span>
              <button onClick={handleSignOut} className="signout-button">
                <LogOut size={18} />
              </button>
            </div>
          </div>
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
              {habits.length > 0
                ? Math.max(...habits.map((h) => h.streak), 0)
                : 0}
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
            <div className="time-input-container">
              <label htmlFor="reminder-time">Reminder Time:</label>
              <input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="time-input"
              />
            </div>
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
