import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingOrder } from '../../types';
import { X, Send, Phone, Paperclip, CheckCheck, Truck, User } from 'lucide-react';

interface ChatModalProps {
  order: BookingOrder;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ order, onClose }) => {
  const { user, role, chatMessages, sendMessage, showToast } = useApp();
  const [inputText, setInputText] = useState('');

  const messages = chatMessages[order.id] || [];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(order.id, inputText.trim());
    setInputText('');
  };

  const quickReplies = role === 'customer' 
    ? [
        "Is the truck on time for loading?",
        "Please share driver contact number",
        "E-way bill document is ready",
        "What is current location ETA?"
      ]
    : [
        "Vehicle is at pickup warehouse",
        "Loading is in progress",
        "Vehicle has started on highway",
        "Estimated arrival in 3 hours"
      ];

  const otherPersonName = role === 'customer' 
    ? `${order.transporterName} (Transporter)`
    : `${order.customerName} (Customer)`;

  const otherPersonPhone = role === 'customer' ? order.transporterPhone : order.customerPhone;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full h-[600px] max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {role === 'customer' ? <Truck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{otherPersonName}</h3>
              <p className="text-xs text-slate-300">
                Order: <span className="font-mono text-blue-300 font-semibold">{order.id}</span> • {order.vehicleType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => showToast(`Calling ${otherPersonName} at ${otherPersonPhone}...`)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div className="text-center my-2">
            <span className="text-[11px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-medium">
              Encrypted Chat • Transport Wala Order Coordination
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-12 text-xs">
              No messages yet. Send a message or pick a quick response below.
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === user.id;
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                    {msg.senderName} ({msg.senderRole})
                  </span>
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      <span>{msg.createdAt}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Replies Bar */}
        <div className="p-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => {
                sendMessage(order.id, reply);
              }}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full transition shadow-2xs font-medium"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Attached image/document for coordination.')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Attach File"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or delivery update..."
            className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
