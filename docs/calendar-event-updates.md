# Calendar Event Updates

## Overview

The system now properly handles calendar event updates instead of creating duplicate events. When a class is updated, the corresponding Google Calendar event is updated in place rather than creating a new event.

## How It Works

### Database Schema Changes

Added a `googleEventId` field to the `classes` table to store the Google Calendar event ID:

```sql
ALTER TABLE classes ADD COLUMN google_event_id TEXT;
```

### Event Lifecycle

1. **Class Creation**:

   - Class is saved to database
   - Calendar event is created in Google Calendar
   - Google Event ID is stored in the `googleEventId` field

2. **Class Update**:

   - If `googleEventId` exists: Update the existing calendar event
   - If `googleEventId` doesn't exist: Create a new calendar event and store the ID

3. **Class Deletion**:
   - If `googleEventId` exists: Delete the calendar event from Google Calendar
   - If no `googleEventId`: No cleanup needed

## Technical Implementation

### New Functions

#### `updateEventFromClassServer`

Updates an existing Google Calendar event:

```typescript
updateEventFromClassServer(
  classData: Partial<Class>,
  accessToken: string,
  googleEventId: string
): Promise<boolean>
```

#### `deleteEventFromClassServer`

Deletes a Google Calendar event:

```typescript
deleteEventFromClassServer(
  accessToken: string,
  googleEventId: string
): Promise<boolean>
```

### API Changes

#### Class Creation (`POST /api/classes`)

- Creates calendar event
- Stores Google Event ID in database
- Logs: `[SERVER] Stored Google Event ID {id} for class {classId}`

#### Class Update (`PUT /api/classes/[id]`)

- Checks if `googleEventId` exists
- Updates existing event if ID exists
- Creates new event if no ID exists
- Logs: `[SERVER] Calendar event updated for class: {name}`

#### Class Deletion (`DELETE /api/classes/[id]`)

- Deletes calendar event if `googleEventId` exists
- Logs: `[SERVER] Calendar event deleted for class: {name}`

## Testing the Update Functionality

### 1. Create a New Class

1. Navigate to a business page
2. Use "Class & Calendar Integration" component
3. Create a class with all details
4. Check success message shows Google Event ID
5. Verify event appears in Google Calendar

### 2. Update the Class

1. Find the class in your app
2. Edit the class details (name, time, location, etc.)
3. Save the changes
4. Check browser console for update logs
5. Verify the Google Calendar event is updated (not duplicated)

### 3. Delete the Class

1. Delete the class from your app
2. Check browser console for deletion logs
3. Verify the Google Calendar event is removed

## Expected Console Output

### Class Creation

```
Creating class with data: {name: "Yoga Class", ...}
Class created successfully: {id: 123, name: "Yoga Class", ...}
[SERVER] Calendar event created for class: Yoga Class with ID: google_event_id_123
[SERVER] Stored Google Event ID google_event_id_123 for class 123
```

### Class Update

```
[SERVER] Calendar event updated for class: Updated Yoga Class
```

### Class Deletion

```
[SERVER] Calendar event deleted for class: Yoga Class
```

## Error Handling

- **Update fails**: Logs error but doesn't fail class update
- **Delete fails**: Logs error but doesn't fail class deletion
- **No access token**: Logs warning and skips calendar operations
- **No Google Event ID**: Creates new event for updates, skips deletion

## Migration Notes

### For Existing Classes

- Existing classes without `googleEventId` will create new calendar events on first update
- This is expected behavior for classes created before this feature

### Database Migration

- Run `npx drizzle-kit migrate` to apply schema changes
- New `google_event_id` column will be added to existing `classes` table

## Benefits

- ✅ **No more duplicate events** when updating classes
- ✅ **Proper cleanup** when deleting classes
- ✅ **Consistent state** between app and Google Calendar
- ✅ **Better user experience** with accurate calendar data
- ✅ **Debugging support** with detailed logging
