import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectDB } from '@/Utility/db';
import { Notification } from '@/models/Notification';

// Store active SSE connections
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Ensure userId is a string
  const userId = session.user.id.toString();

  // Create a new ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this user
      clients.set(userId, controller);

      // Send initial message
      const data = `data: ${JSON.stringify({ type: 'connection', message: 'Connected to notification stream' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Send any existing unread notifications
      sendUnreadNotifications(userId, controller);
    },
    cancel() {
      // Remove the client when the connection is closed
      clients.delete(userId);
    }
  });

  // Return the stream with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// Function to send unread notifications to a client
async function sendUnreadNotifications(userId: string, controller: ReadableStreamDefaultController) {
    try {
        await connectDB();

        // Get unread notifications for the user
        const notifications = await Notification.find({
          userId,
          read: false
        }).sort({ createdAt: -1 }).limit(10);

        if (notifications.length > 0) {
          // console.log(`Sending ${notifications.length} unread notifications to user:`, userId);

          const data = `data: ${JSON.stringify({
            type: 'notifications',
            notifications: notifications
          })}\n\n`;

          controller.enqueue(new TextEncoder().encode(data));
        }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
        // console.error('Error sending unread notifications:', error);
    }
}

// Export a function to send a notification to a specific user
export async function sendNotificationToUser(userId: string | any, notification: any) {
  // Ensure userId is a string (handle MongoDB ObjectId)
  const userIdStr = userId?.toString ? userId.toString() : userId;

  // console.log('Clients Map:', clients);
  // console.log('Looking for userId:', userIdStr);
  // console.log('Notification:', notification);

  const controller = clients.get(userIdStr);
  // console.log('Found controller:', controller ? 'Yes' : 'No');

  if (controller) {
    try {
      const data = `data: ${JSON.stringify({
        type: 'notification',
        notification
      })}\n\n`;

      controller.enqueue(new TextEncoder().encode(data));
      // console.log('Notification sent successfully to user:', userIdStr);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // console.error('Error sending notification:', error);
      return false;
    }
  } else {
    // console.log('No active connection found for user:', userIdStr);
    return false;
  }
}
