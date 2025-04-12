import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NotificationService } from '@/services/Notification.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { type = 'system', title, description, link, metadata } = await req.json();
    
    // Create the notification
    const notification = await NotificationService.createNotification({
      userId,
      title: title || 'Test Notification',
      description: description || `This is a test ${type} notification`,
      type: type as any,
      link: link || '/notifications',
      metadata: metadata || {}
    });
    
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
