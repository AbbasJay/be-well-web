# Class-Calendar Integration Feature

## Overview

This feature automatically creates Google Calendar events when classes are created in the application. When a user creates a new class, the system will:

1. Save the class to the database
2. Create a corresponding event in the user's Google Calendar
3. Include class details like instructor, location, price, and capacity in the calendar event

## How It Works

### Automatic Event Creation

When a class is created via the `/api/classes` endpoint:

1. The class is saved to the database
2. The system calls `createEventFromClass()` from the Google Calendar service
3. A calendar event is created with:
   - **Title**: `{ClassName} - {Instructor}`
   - **Start/End Time**: Based on the class date, time, and duration
   - **Description**: Includes class description, instructor, price, capacity, and available slots
   - **Location**: The class location

### Event Updates

When a class is updated via the `/api/classes/[id]` PUT endpoint:

1. The class is updated in the database
2. A new calendar event is created to replace the old one
3. The old event remains in the calendar (future enhancement: store Google Event IDs for proper updates)

### Event Deletion

When a class is deleted:

1. The class is removed from the database
2. A log message is created (future enhancement: delete the corresponding calendar event)

## Technical Implementation

### Key Files

- `app/utils/calendar.ts` - Utility function to create calendar events from class data
- `app/services/google-calendar.ts` - Service to handle Google Calendar operations
- `app/api/classes/route.ts` - Class creation endpoint with calendar integration
- `app/api/classes/[id]/route.ts` - Class update/delete endpoints with calendar integration
- `app/types/calendar.ts` - Type definitions for calendar events
- `app/api/calendar/route.ts` - Google Calendar API endpoints

### Data Flow

```
Class Form → API → Database → Google Calendar Service → Google Calendar API
```

### Error Handling

- If calendar event creation fails, the class creation still succeeds
- Errors are logged but don't prevent the main operation
- Users are notified when calendar events are created successfully

## Usage

### For Users

1. Navigate to a business page
2. Click "Add Class" or use the "Class & Calendar Integration" component
3. Fill out the class form with:
   - Class name
   - Description
   - Date and time
   - Duration
   - Instructor
   - Location
   - Price
   - Capacity
4. Submit the form
5. The class will be created and a calendar event will appear in your Google Calendar

### For Developers

To manually create a calendar event from class data:

```typescript
import { createEventFromClass } from "@/app/services/google-calendar";

const classData = {
  name: "Yoga Class",
  instructor: "John Doe",
  startDate: "2024-01-15",
  time: "14:00",
  duration: 60,
  location: "Studio A",
  price: 25,
  capacity: 20,
  // ... other class properties
};

const calendarEventId = await createEventFromClass(classData);
```

## Future Enhancements

1. **Store Google Event IDs**: Save the Google Calendar event ID in the database to enable proper updates and deletions
2. **Recurring Events**: Support for recurring classes
3. **Event Templates**: Customizable event templates for different class types
4. **Calendar Sync**: Two-way sync between the app and Google Calendar
5. **Multiple Calendars**: Support for multiple calendar accounts
6. **Event Notifications**: Send notifications when calendar events are created/updated

## Configuration

The feature requires:

1. **Google Calendar API**: Set up Google OAuth2 credentials
2. **Environment Variables**:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. **User Authentication**: Users must connect their Google Calendar account

## Troubleshooting

### Common Issues

1. **Calendar events not created**: Check if the user has connected their Google Calendar account
2. **Authentication errors**: Verify Google OAuth2 credentials are properly configured
3. **Missing class data**: Ensure all required fields are provided in the class form

### Debugging

- Check browser console for error messages
- Review server logs for API errors
- Verify Google Calendar API quotas and limits
