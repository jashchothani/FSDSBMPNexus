import { Notification } from '@repo/database';
import { emitToUsers } from './realtime.js';

export interface NotifyOptions {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  resourceType?: string;
  resourceId?: string;
}

export async function notify(opts: NotifyOptions): Promise<any> {
  const notif = await Notification.create({
    userId: opts.userId,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    link: opts.link,
    resourceType: opts.resourceType,
    resourceId: opts.resourceId,
    isRead: false,
  });

  emitToUsers([opts.userId], 'notification:new', {
    id: String(notif._id),
    type: opts.type,
    title: opts.title,
    message: opts.message,
    link: opts.link,
    timestamp: notif.createdAt,
  });

  return notif;
}
