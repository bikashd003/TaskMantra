import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Notification } from '@/models/Notification';

// Store active SSE connections
const clients = new Map<string, ReadableStreamDefaultController>();

// Store heartbeat intervals for each client
const heartbeatIntervals = new Map<string, ReturnType<typeof setInterval>>();

// Heartbeat interval in milliseconds (30 seconds)
const HEARTBEAT_INTERVAL = 30000;

// Set to true to enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

// Use force-dynamic to ensure the route is not statically optimized
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Check for Last-Event-ID header or query parameter which indicates a reconnection
  const lastEventIdHeader = req.headers.get('Last-Event-ID') || '';
  const url = new URL(req.url);
  const lastEventIdParam = url.searchParams.get('lastEventId') || '';
  const lastEventId = lastEventIdHeader || lastEventIdParam;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Ensure userId is a string
  const userId = session.user.id.toString();

  if (DEBUG) {
    console.log(`SSE connection request from user: ${userId}, lastEventId: ${lastEventId}`);
  }

  // Clear any existing heartbeat interval for this user
  if (heartbeatIntervals.has(userId)) {
    clearInterval(heartbeatIntervals.get(userId));
    heartbeatIntervals.delete(userId);
  }

  // Create a new ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this user
      clients.set(userId, controller);

      // Send initial message with an ID that can be used for reconnection
      const connectionId = Date.now().toString();
      const data = `id: ${connectionId}\ndata: ${JSON.stringify({ type: 'connection', message: 'Connected to notification stream' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Send any existing unread notifications
      sendUnreadNotifications(userId, controller);

      // Set up heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          // Send a ping event to keep the connection alive with an incrementing ID
          const heartbeatId = Date.now().toString();
          const heartbeat = `id: ${heartbeatId}\ndata: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeat));

          if (DEBUG) {
            console.log(`Heartbeat sent to user: ${userId}, id: ${heartbeatId}`);
          }
        } catch (error) {
          // If there's an error sending the heartbeat, clear the interval and remove the client
          if (DEBUG) {
            console.error(`Error sending heartbeat to user: ${userId}`, error);
          }
          clearInterval(heartbeatInterval);
          heartbeatIntervals.delete(userId);
          clients.delete(userId);
        }
      }, HEARTBEAT_INTERVAL);

      // Store the interval reference
      heartbeatIntervals.set(userId, heartbeatInterval);
    },
    cancel() {
      // Remove the client when the connection is closed
      clients.delete(userId);

      if (DEBUG) {
        console.log(`SSE connection closed for user: ${userId}`);
      }

      // Clear the heartbeat interval
      if (heartbeatIntervals.has(userId)) {
        clearInterval(heartbeatIntervals.get(userId));
        heartbeatIntervals.delete(userId);
      }
    },
  });

  // Return the stream with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for Nginx
    },
  });
}

// Function to send unread notifications to a client
async function sendUnreadNotifications(
  userId: string,
  controller: ReadableStreamDefaultController
) {
  try {
    await connectDB();

    // Get unread notifications for the user
    const notifications = await Notification.find({
      userId,
      read: false,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    if (notifications.length > 0) {
      if (DEBUG) {
        console.log(`Sending ${notifications.length} unread notifications to user: ${userId}`);
      }

      // Generate a unique event ID
      const eventId = `batch-${Date.now()}`;

      const data = `id: ${eventId}\ndata: ${JSON.stringify({
        type: 'notifications',
        notifications: notifications,
      })}\n\n`;

      controller.enqueue(new TextEncoder().encode(data));
    }
  } catch (error) {
    if (DEBUG) {
      console.error(`Error sending unread notifications to user: ${userId}`, error);
    }
  }
}

// Export a function to send a notification to a specific user
export async function sendNotificationToUser(userId: string | any, notification: any) {
  // Ensure userId is a string (handle MongoDB ObjectId)
  const userIdStr = userId?.toString ? userId.toString() : userId;

  if (DEBUG) {
    console.log(`Attempting to send notification to user: ${userIdStr}`);
  }

  const controller = clients.get(userIdStr);

  if (controller) {
    try {
      // Generate a unique event ID based on notification ID or timestamp
      const eventId = notification._id ? notification._id.toString() : `notif-${Date.now()}`;

      const data = `id: ${eventId}\ndata: ${JSON.stringify({
        type: 'notification',
        notification,
      })}\n\n`;

      controller.enqueue(new TextEncoder().encode(data));

      if (DEBUG) {
        console.log(`Notification sent successfully to user: ${userIdStr}, id: ${eventId}`);
      }

      return true;
    } catch (error) {
      if (DEBUG) {
        console.error(`Error sending notification to user: ${userIdStr}`, error);
      }
      return false;
    }
  } else {
    if (DEBUG) {
      console.log(`No active connection found for user: ${userIdStr}`);
    }
    return false;
  }
}
