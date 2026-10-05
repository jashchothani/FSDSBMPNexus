'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Share2,
  QrCode,
  Copy,
  Check,
  Trash2,
  Clock,
  Code2,
  FileText,
  Upload,
  ArrowLeft,
  Flame,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Laptop,
  Lock,
  Unlock,
  Radio,
  Download,
  Eye,
  CheckCircle2,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ClipboardItem {
  id: string;
  type: 'text' | 'code' | 'url' | 'file';
  title?: string;
  content: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
  codeLang?: string;
  isEncrypted?: boolean;
}

// ---------------------------------------------------------------------------
// Zero-Knowledge Web Crypto Utilities (Inspired by PrivateBin & MicroBin)
// ---------------------------------------------------------------------------
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptZeroKnowledge(text: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(text)
  );

  const combined = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.byteLength);
  combined.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

async function decryptZeroKnowledge(cipherBase64: string, passphrase: string): Promise<string> {
  try {
    const raw = atob(cipherBase64);
    const rawBytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      rawBytes[i] = raw.charCodeAt(i);
    }

    const salt = rawBytes.slice(0, 16);
    const iv = rawBytes.slice(16, 28);
    const data = rawBytes.slice(28);

    const key = await deriveKey(passphrase, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    return '[Encrypted — Invalid Passphrase]';
  }
}

export default function TemporaryClipboardPage() {
  const [pin, setPin] = useState<string>('');
  const [inputPin, setInputPin] = useState<string>('');
  const [roomTitle, setRoomTitle] = useState('Campus Lab Sync Room');
  const [duration, setDuration] = useState('60'); // minutes
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(3600);
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  // Security / Encryption (PrivateBin mode)
  const [useEncryption, setUseEncryption] = useState(false);
  const [passphrase, setPassphrase] = useState('');

  // New Item State
  const [activeTab, setActiveTab] = useState<'text' | 'code' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [codeLang, setCodeLang] = useState('cpp');
  const [itemTitle, setItemTitle] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fetch room items from API
  const fetchRoomData = useCallback(async (roomPin: string) => {
    if (!roomPin) return;
    try {
      setIsLiveSyncing(true);
      const res = await fetch(`${API_BASE}/tools/clipboard/rooms/${roomPin}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRemainingTime(json.data.remainingSeconds || 3600);
          setItems(json.data.items || []);
        }
      }
    } catch {
      // Local fallback in browser
    } finally {
      setIsLiveSyncing(false);
    }
  }, []);

  // Check URL search parameters on mount (e.g. from QR code scan: ?pin=482-913)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryPin = urlParams.get('pin');
      if (queryPin) {
        setPin(queryPin);
        setIsInRoom(true);
        fetchRoomData(queryPin);
        return;
      }
    }
    // Default create new room
    createNewRoom();
  }, [fetchRoomData]);

  // Periodic polling every 3 seconds for live peer synchronization
  useEffect(() => {
    if (!isInRoom || !pin) return;
    const pollInterval = setInterval(() => {
      fetchRoomData(pin);
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [isInRoom, pin, fetchRoomData]);

  // Countdown timer
  useEffect(() => {
    if (!isInRoom) return;
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          burnRoom();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isInRoom]);

  const createNewRoom = async () => {
    try {
      const res = await fetch(`${API_BASE}/tools/clipboard/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: roomTitle,
          durationMinutes: parseInt(duration, 10),
          burnAfterRead,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPin(json.data.pin);
          setIsInRoom(true);
          setRemainingTime(parseInt(duration, 10) * 60);
          setItems([]);
          return;
        }
      }
    } catch {
      // Fallback local PIN
    }

    // Client fallback PIN
    const num = Math.floor(100000 + Math.random() * 900000).toString();
    const fallbackPin = `${num.slice(0, 3)}-${num.slice(3)}`;
    setPin(fallbackPin);
    setIsInRoom(true);
    setRemainingTime(parseInt(duration, 10) * 60);

    // Initial student demo item
    setItems([
      {
        id: '1',
        type: 'code',
        title: 'Binary Search Algorithm (Semester 4 DSA Lab)',
        content: `#include <iostream>\nusing namespace std;\n\nint binarySearch(int arr[], int l, int r, int x) {\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == x) return m;\n        if (arr[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}\n\nint main() {\n    int arr[] = { 2, 3, 4, 10, 40 };\n    int n = sizeof(arr) / sizeof(arr[0]);\n    int x = 10;\n    int result = binarySearch(arr, 0, n - 1, x);\n    cout << "Element found at index " << result << endl;\n    return 0;\n}`,
        codeLang: 'cpp',
        createdAt: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const joinExistingRoom = async () => {
    if (!inputPin.trim()) return;
    const cleanPin = inputPin.trim();
    setPin(cleanPin);
    setIsInRoom(true);
    await fetchRoomData(cleanPin);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addItem = async () => {
    if (activeTab === 'text' && !textContent.trim()) return;
    if (activeTab === 'code' && !codeContent.trim()) return;

    setIsSending(true);
    let payloadContent = activeTab === 'text' ? textContent.trim() : codeContent.trim();
    let isEncrypted = false;

    if (useEncryption && passphrase.trim()) {
      payloadContent = await encryptZeroKnowledge(payloadContent, passphrase.trim());
      isEncrypted = true;
    }

    const title = itemTitle.trim() || (activeTab === 'code' ? `${codeLang.toUpperCase()} Code` : 'Quick Note');

    const newItem: ClipboardItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: activeTab,
      title,
      content: payloadContent,
      codeLang: activeTab === 'code' ? codeLang : undefined,
      createdAt: new Date().toLocaleTimeString(),
      isEncrypted,
    };

    // Try posting to API
    try {
      await fetch(`${API_BASE}/tools/clipboard/rooms/${pin}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
    } catch {
      // Offline fallback
    }

    setItems([newItem, ...items]);
    setTextContent('');
    setCodeContent('');
    setItemTitle('');
    setIsSending(false);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const newItem: ClipboardItem = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'file',
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        content: dataUrl,
        createdAt: new Date().toLocaleTimeString(),
      };

      try {
        await fetch(`${API_BASE}/tools/clipboard/rooms/${pin}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        });
      } catch {}

      setItems([newItem, ...items]);
    };
    reader.readAsDataURL(file);
  };

  const burnRoom = async () => {
    try {
      await fetch(`${API_BASE}/tools/clipboard/rooms/${pin}`, { method: 'DELETE' });
    } catch {}
    setItems([]);
    setIsInRoom(false);
    setPin('');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tools/clipboard?pin=${pin}`
    : `http://localhost:3000/tools/clipboard?pin=${pin}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/tools"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Tools</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Open-Source Architecture (PrivateBin / MicroBin Inspired)
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5" />
            Zero-Trace Sync
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Share2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Private Online Temporary Clipboard
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Radio className={`h-2.5 w-2.5 text-emerald-400 ${isLiveSyncing ? 'animate-ping' : ''}`} />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end temporary pastebin & file drop between college lab PCs, mobile phones, and laptops. Zero trace after destruction.
              </p>
            </div>
          </div>

          {/* Quick PIN Badge */}
          {isInRoom && (
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">Room Access PIN</p>
                  <p className="text-base font-black text-rose-400 font-mono tracking-wider">{pin}</p>
                </div>
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  title="Show QR Code for Mobile"
                >
                  <QrCode className="h-4 w-4 text-rose-400" />
                </button>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs">
                <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                <span className="font-mono text-amber-400 font-bold">{formatTimer(remainingTime)}</span>
              </div>
            </div>
          )}
        </div>

        {/* QR Code Modal Overlay */}
        {showQr && isInRoom && (
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fadeIn">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Smartphone className="h-4 w-4" />
                <span>Scan with your Smartphone Camera</span>
              </div>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                Open this temporary clipboard room on your phone instantly. No college login required, zero history stored on shared lab computers.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  Room PIN: <strong className="text-rose-400">{pin}</strong>
                </span>
                <button
                  onClick={() => handleCopy('url', currentUrl)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-rose-400" />
                  <span>Copy Join URL</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
              <QRCodeSVG value={currentUrl} size={140} />
              <span className="text-[10px] text-slate-900 font-mono font-bold mt-2">PIN: {pin}</span>
            </div>
          </div>
        )}

        {/* Room Controls Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter 6-digit PIN (e.g. 582-194)"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            />
            <button
              onClick={joinExistingRoom}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
            >
              Join Room
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Zero-knowledge Encryption Toggle */}
            <button
              onClick={() => setUseEncryption(!useEncryption)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                useEncryption
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Client-Side AES-GCM 256-bit encryption (PrivateBin style)"
            >
              {useEncryption ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              <span>{useEncryption ? 'E2E Encrypted' : 'Plain Text'}</span>
            </button>

            <button
              onClick={createNewRoom}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>New Room</span>
            </button>

            <button
              onClick={burnRoom}
              className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Burn Room Now</span>
            </button>
          </div>
        </div>

        {/* E2E Passphrase input when encryption is active */}
        {useEncryption && (
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-xs animate-fadeIn">
            <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-semibold whitespace-nowrap">Encryption Passphrase:</span>
            <input
              type="password"
              placeholder="Set a secret password for this room..."
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 whitespace-nowrap">AES-GCM 256-bit</span>
          </div>
        )}

        {/* Add Item Panel */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('text')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'text'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Text / Markdown</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'code'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Code Snippet</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white flex items-center gap-1.5 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>File Drop (Up to 25MB)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>

            {activeTab === 'code' && (
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="cpp">C++ (MSBTE Lab)</option>
                <option value="python">Python</option>
                <option value="java">Java (OOP)</option>
                <option value="sql">SQL / Oracle</option>
                <option value="html">HTML / CSS / JS</option>
              </select>
            )}
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title or note label (optional)..."
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            {activeTab === 'text' ? (
              <textarea
                placeholder="Paste code links, formula notes, or text to transfer between devices..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-sans"
              />
            ) : (
              <textarea
                placeholder="Paste source code snippet here (syntax formatted automatically)..."
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                rows={6}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            )}

            <div className="flex justify-end">
              <button
                onClick={addItem}
                disabled={isSending}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>{isSending ? 'Syncing...' : 'Add to Temporary Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Items Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Laptop className="h-4 w-4 text-rose-400" />
              <span>Synced Items in Room ({items.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Auto-destructs when timer expires
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">Room is empty. Add a note, code snippet, or file above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 uppercase text-slate-300">
                        {item.type}
                      </span>
                      {item.isEncrypted && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Lock className="h-2.5 w-2.5" />
                          Encrypted
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{item.createdAt}</span>
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1 transition-colors"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  {item.type === 'code' ? (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 overflow-x-auto">
                      <pre className="text-xs font-mono text-emerald-300 whitespace-pre leading-relaxed">
                        {item.content}
                      </pre>
                    </div>
                  ) : item.type === 'file' ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                          FILE
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{item.fileName}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.fileSize ? (item.fileSize / 1024).toFixed(1) + ' KB' : 'Attachment'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={item.content}
                        download={item.fileName || 'download'}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
