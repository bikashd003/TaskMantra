import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/Notification.service';

export async function POST(req: NextRequest) {
  try {
    const { userId, title, description, type = 'system' } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    // Create the notification
    const notification = await NotificationService.createNotification({
      userId,
      title: title || 'Test Notification',
      description: description || `This is a test ${type} notification`,
      type: type as any,
      link: '/dashboard/notifications',
    });
    
    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Notification created and sent to user'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
