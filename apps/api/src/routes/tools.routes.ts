import { Router, Request, Response } from 'express';

export interface ClipboardItem {
  id: string;
  type: 'text' | 'code' | 'url' | 'file';
  title?: string;
  content: string; // text, code, url, or base64 data / url for file
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
}

export interface ClipboardRoom {
  pin: string;
  title: string;
  createdAt: number;
  expiresAt: number;
  burnAfterRead: boolean;
  items: ClipboardItem[];
}

// In-memory room store (can be backed by Redis if available)
const rooms = new Map<string, ClipboardRoom>();

// Clean up expired rooms periodically
setInterval(() => {
  const now = Date.now();
  for (const [pin, room] of rooms.entries()) {
    if (room.expiresAt <= now) {
      rooms.delete(pin);
    }
  }
}, 60 * 1000);

export const toolsRoutes = Router();

/**
 * POST /api/tools/clipboard/rooms
 * Create a new temporary clipboard room
 */
toolsRoutes.post('/clipboard/rooms', (req: Request, res: Response) => {
  try {
    const { title, durationMinutes = 60, burnAfterRead = false } = req.body;

    // Generate unique 6-digit PIN (e.g. 582-194)
    let pin: string;
    let attempts = 0;
    do {
      const num = Math.floor(100000 + Math.random() * 900000).toString();
      pin = `${num.slice(0, 3)}-${num.slice(3)}`;
      attempts++;
    } while (rooms.has(pin) && attempts < 100);

    const now = Date.now();
    const duration = Math.min(Math.max(Number(durationMinutes) || 60, 5), 1440) * 60 * 1000;

    const newRoom: ClipboardRoom = {
      pin,
      title: title || `Room ${pin}`,
      createdAt: now,
      expiresAt: now + duration,
      burnAfterRead: Boolean(burnAfterRead),
      items: [],
    };

    rooms.set(pin, newRoom);

    res.status(201).json({
      success: true,
      data: {
        pin: newRoom.pin,
        title: newRoom.title,
        expiresAt: new Date(newRoom.expiresAt).toISOString(),
        burnAfterRead: newRoom.burnAfterRead,
        itemsCount: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/tools/clipboard/rooms/:pin
 * Get room status and all clipboard items
 */
toolsRoutes.get('/clipboard/rooms/:pin', (req: Request, res: Response) => {
  try {
    const pin = String(req.params.pin || '').trim();
    const room = rooms.get(pin);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Clipboard room not found or has expired.',
      });
    }

    if (Date.now() > room.expiresAt) {
      rooms.delete(pin);
      return res.status(410).json({
        success: false,
        error: 'This temporary clipboard room has expired.',
      });
    }

    res.json({
      success: true,
      data: {
        pin: room.pin,
        title: room.title,
        createdAt: new Date(room.createdAt).toISOString(),
        expiresAt: new Date(room.expiresAt).toISOString(),
        remainingSeconds: Math.max(0, Math.floor((room.expiresAt - Date.now()) / 1000)),
        burnAfterRead: room.burnAfterRead,
        items: room.items,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/tools/clipboard/rooms/:pin/items
 * Add text, code, or file item to the temporary clipboard room
 */
toolsRoutes.post('/clipboard/rooms/:pin/items', (req: Request, res: Response) => {
  try {
    const pin = String(req.params.pin || '').trim();
    const room = rooms.get(pin);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Clipboard room not found or has expired.',
      });
    }

    const { type, content, title, fileName, fileSize, fileType } = req.body;

    if (!content && type !== 'file') {
      return res.status(400).json({
        success: false,
        error: 'Content is required.',
      });
    }

    const newItem: ClipboardItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: type || 'text',
      title: title || undefined,
      content: content || '',
      fileName,
      fileSize,
      fileType,
      createdAt: new Date().toISOString(),
    };

    room.items.unshift(newItem);

    // Limit maximum 50 items per room
    if (room.items.length > 50) {
      room.items.pop();
    }

    res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/tools/clipboard/rooms/:pin
 * Burn / immediately destroy a clipboard room
 */
toolsRoutes.delete('/clipboard/rooms/:pin', (req: Request, res: Response) => {
  try {
    const pin = String(req.params.pin || '').trim();
    const existed = rooms.delete(pin);

    res.json({
      success: true,
      message: existed ? 'Room burned and destroyed successfully.' : 'Room already gone.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
