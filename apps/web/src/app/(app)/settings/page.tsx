'use client';

import React, { useState } from 'react';
import { Settings, User, Bell, GraduationCap, Key, ShieldCheck, Check } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState('Jash');
  const [lastName, setLastName] = useState('T.');
  const [department, setDepartment] = useState('Computer Engineering');
  const [semester, setSemester] = useState('4');
  const [scheme, setScheme] = useState('K-Scheme');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-slate-400" />
          Student Account & Preferences
        </h1>
        <p className="text-xs text-slate-400">
          Manage your academic track, notification preferences, and platform credentials
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Academic Context Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-400" />
            Academic Track Settings
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Current Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">MSBTE Curriculum Scheme</label>
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="K-Scheme">K-Scheme (Latest Syllabus)</option>
              <option value="I-Scheme">I-Scheme</option>
            </select>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-purple-400" />
            Personal Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Settings Saved Successfully!
            </span>
          ) : <span />}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            Save Changes
          </button>
        </div>

      </form>

    </div>
  );
}
