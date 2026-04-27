import AsyncStorage from '@react-native-async-storage/async-storage';

const CREATED_EVENTS_KEY = 'created_calendar_events';

/**
 * Gets the map of email message IDs to created Google Calendar event IDs.
 */
export async function getCreatedEvents(): Promise<Record<string, string>> {
  try {
    const cached = await AsyncStorage.getItem(CREATED_EVENTS_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Saves the mapping of an email message ID to a newly created event ID.
 */
export async function saveCreatedEvent(emailId: string, eventId: string) {
  try {
    const events = await getCreatedEvents();
    events[emailId] = eventId;
    await AsyncStorage.setItem(CREATED_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save created event mapping', e);
  }
}

/**
 * Creates a Google Calendar event using the provided event data.
 * POST https://www.googleapis.com/calendar/v3/calendars/primary/events
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  emailId: string,
  eventData: { title: string; date: string; time: string; duration_minutes: number }
) {
  // Prevent duplicate calendar events
  const createdEvents = await getCreatedEvents();
  if (createdEvents[emailId]) {
    console.log(`Event for email ${emailId} already created: ${createdEvents[emailId]}`);
    return createdEvents[emailId];
  }

  // Gemini returns date as YYYY-MM-DD and time as HH:mm
  // Construct ISO string for start time.
  // We'll use the user's local timezone for simplicity if not specified.
  // Google API expects dateTime in RFC3339 format.
  const startDateTime = `${eventData.date}T${eventData.time}:00`;
  
  // Calculate end time
  const startDate = new Date(startDateTime);
  const durationMs = (eventData.duration_minutes || 60) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);
  
  // Format to YYYY-MM-DDTHH:mm:ss (local time)
  const formatLocalISO = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const event = {
    summary: eventData.title,
    description: 'Created via Sortify AI',
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    end: {
      dateTime: formatLocalISO(endDate),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
    reminders: {
      useDefault: true,
    },
  };

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      const data = await response.json();
      await saveCreatedEvent(emailId, data.id);
      console.log('Successfully created calendar event:', data.id);
      return data.id;
    } else {
      const err = await response.json();
      console.error('Failed to create calendar event:', err);
      return null;
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}
