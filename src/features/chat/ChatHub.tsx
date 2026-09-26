import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConnectionRequest, ChatThread, ChatMessage, UserProfile } from '../../types';
import { connectionRepository, chatRepository, userRepository } from '../../services/dataService';
import { 
  Send, 
  MessageSquare, 
  UserCheck, 
  Clock, 
  Check, 
  X, 
  Paperclip, 
  Image as ImageIcon,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Search,
  CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

interface ChatHubProps {
  onRequireAuth?: () => void;
}

export const ChatHub: React.FC<ChatHubProps> = ({ onRequireAuth }) => {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  
  // Real-time states
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'none' | 'file' | 'image'>('none');
  const [mockFileName, setMockFileName] = useState('');

  // 1. Subscribe to Chat Threads
  useEffect(() => {
    if (!profile) return;
    const unsub = chatRepository.subscribeToUserChats(profile.id, (threadList) => {
      setChats(threadList);
      if (threadList.length > 0 && !selectedChat) {
        setSelectedChat(threadList[0]);
      }
    });
    return () => unsub();
  }, [profile]);

  // 2. Subscribe to Incoming Requests (primarily for Seniors)
  useEffect(() => {
    if (!profile) return;
    const unsub = connectionRepository.subscribeToIncomingRequests(profile.id, (reqs) => {
      setIncomingRequests(reqs);
    });
    return () => unsub();
  }, [profile]);

  // 3. Subscribe to active chat messages
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    const unsub = chatRepository.subscribeToMessages(selectedChat.id, (msgList) => {
      setMessages(msgList);
    });
    return () => unsub();
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedChat) return;
    if (!newMessageText.trim() && attachmentType === 'none') return;

    setSending(true);
    try {
      const otherParticipantId = selectedChat.participants.find(p => p !== profile.id) || '';
      
      await chatRepository.sendMessage(selectedChat.id, {
        chatId: selectedChat.id,
        senderId: profile.id,
        receiverId: otherParticipantId,
        text: newMessageText.trim(),
        type: attachmentType === 'none' ? 'text' : attachmentType,
        fileName: attachmentType !== 'none' ? mockFileName || 'Study_Notes_Chapter3.pdf' : undefined,
        fileUrl: attachmentType !== 'none' ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : undefined
      });

      setNewMessageText('');
      setAttachmentType('none');
      setMockFileName('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptRequest = async (req: ConnectionRequest) => {
    if (!profile) return;
    try {
      await connectionRepository.acceptRequest(req.id, req.fromUserId, profile.id, profile.name);
      confetti({ particleCount: 70, spread: 60 });
      setActiveTab('chats');
    } catch (err: any) {
      alert(err.message || 'Error accepting request');
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await connectionRepository.rejectRequest(reqId);
    } catch (err: any) {
      alert(err.message || 'Error rejecting request');
    }
  };

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Student Messaging & Requests</h2>
        <p className="text-xs text-slate-500">
          Sign in with your university account to accept connection requests and chat real-time with your mentors and peers.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const getOtherParticipant = (chat: ChatThread) => {
    const otherId = chat.participants.find(p => p !== profile.id);
    if (!otherId || !chat.participantDetails) {
      return { name: 'Student Peer', role: 'junior', avatarUrl: '', college: '' };
    }
    return chat.participantDetails[otherId] || { name: 'Student Peer', role: 'junior', avatarUrl: '', college: '' };
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[640px] flex flex-col md:flex-row">
      {/* Left Sidebar: Threads and Requests */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50">
        {/* Tab Toggle */}
        <div className="p-3 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'chats'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chats ({chats.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 relative ${
              activeTab === 'requests'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Requests
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {activeTab === 'chats' ? (
            chats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>No active chats yet.</p>
                <p className="text-[11px] text-slate-400">
                  Connect with a senior mentor from the Discover tab to start chatting.
                </p>
              </div>
            ) : (
              chats.map((chat) => {
                const other = getOtherParticipant(chat);
                const isSelected = selectedChat?.id === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition ${
                      isSelected ? 'bg-indigo-50/70 border-r-4 border-indigo-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <img
                      src={other.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={other.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{other.name}</h4>
                        <span className="text-[10px] text-slate-400">
                          {chat.lastMessageAt ? format(chat.lastMessageAt, 'HH:mm') : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{chat.lastMessage}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-100 text-indigo-700">
                        {other.role === 'senior' ? 'Mentor' : 'Junior'}
                      </span>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            /* Incoming Requests List */
            incomingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
                <p>No pending connection requests.</p>
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req.id} className="p-4 space-y-2 bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={req.senderName}
                      className="w-10 h-10 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{req.senderName}</h4>
                      <p className="text-[10px] text-slate-500">{req.senderCourse} • Year {req.senderYear}</p>
                    </div>
                  </div>
                  {req.note && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{req.note}"
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="flex-1 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept & Chat
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Right Area: Active Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Header */}
            {(() => {
              const other = getOtherParticipant(selectedChat);
              return (
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
                  <div className="flex items-center gap-3">
                    <img
                      src={other.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={other.name}
                      className="w-10 h-10 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{other.name}</h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                          {other.role === 'senior' ? 'Campus Senior' : 'Mentee'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{other.college}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                </div>
              );
            })()}

            {/* Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Say hello! Ask your senior about interview prep, campus courses, or exam tips.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === profile.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.type === 'file' && (
                          <div className="mb-1 p-2 rounded-xl bg-black/10 flex items-center gap-2">
                            <Paperclip className="w-4 h-4 shrink-0" />
                            <span className="truncate font-medium underline">{m.fileName || 'Attachment.pdf'}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                        <span>{format(m.createdAt, 'HH:mm')}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white space-y-2">
              {attachmentType !== 'none' && (
                <div className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attached: <strong>{mockFileName || 'Lecture_Notes.pdf'}</strong> (2.4 MB)</span>
                  </div>
                  <button
                    onClick={() => setAttachmentType('none')}
                    className="p-1 hover:bg-indigo-100 rounded-full text-indigo-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentType('file');
                    setMockFileName('Algorithms_Midterm_Notes.pdf');
                  }}
                  className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                  title="Attach File / Study Notes"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Ask a question or reply..."
                  className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={sending || (!newMessageText.trim() && attachmentType === 'none')}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Select a chat to start conversation</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Your conversations with senior campus mentors and peer study partners will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
