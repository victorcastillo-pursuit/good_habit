import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_j1yaxig';
const TEMPLATE_ID = 'template_xh527cn';
const PUBLIC_KEY = 'QmaTuceXWt6odkdca';

// Utility function to convert 24-hour time to 12-hour format with AM/PM
const formatTimeTo12Hour = (time24) => {
  if (!time24) return "";
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const isPM = hour >= 12;
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
};

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

export const sendHabitReminder = async (habit, userName) => {
  try {
    const templateParams = {
      user_name: userName,
      habit_name: habit.name,
      reminder_time: formatTimeTo12Hour(habit.reminderTime),
      to_email: habit.userEmail
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Check if it's time to send reminder
export const shouldSendReminder = (habit) => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Only send if habit is not completed and time matches
  return !habit.completed && habit.reminderTime === currentTime;
};