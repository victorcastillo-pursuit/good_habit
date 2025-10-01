import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_j1yaxig';
const TEMPLATE_ID = 'template_xh527cn';
const PUBLIC_KEY = 'QmaTuceXWt6odkdca';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

export const sendHabitReminder = async (habit, userName) => {
  try {
    const templateParams = {
      user_name: userName,
      habit_name: habit.name,
      reminder_time: habit.reminderTime,
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