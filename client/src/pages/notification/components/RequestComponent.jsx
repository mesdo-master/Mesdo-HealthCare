// client/src/components/ConnectionRequestCard.jsx
import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ConnectionRequestCard({
  fromName,
  avatarUrl,
  createdAt,
  onAccept,
  onReject
}) {
  return (
    <div className="relative bg-white border border-gray-100 rounded-lg p-4 flex flex-col space-y-3 shadow-sm">
      {/* action icons */}
      <div className="absolute top-2 right-2 flex space-x-2 text-gray-400 hover:text-gray-600">
        <button aria-label="Copy"><Copy size={16} /></button>
        <button aria-label="Delete"><Trash2 size={16} /></button>
      </div>

      {/* main content */}
      <div className="flex items-center space-x-3">
        <img
          src={avatarUrl}
          alt={`${fromName}’s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <p className="text-gray-800">
          <span className="font-medium">{fromName}</span>{' '}
          <span className="text-gray-500">has sent you a connection request</span>
        </p>
      </div>

      {/* buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onAccept}
          className="px-4 py-1 rounded-full bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="px-4 py-1 rounded-full bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition"
        >
          Reject
        </button>
      </div>

      {/* timestamp */}
      <p className="text-xs text-gray-400">
        {format(new Date(createdAt), "'Today at' h:mm a")}
      </p>
    </div>
  );
}
