import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiSearch, FiUser } from 'react-icons/fi';
import { ref, push, onValue, off, serverTimestamp, set, onDisconnect } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import { rtdb, db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const generateChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

const roleEmoji = {
  farmer: '👨‍🌾',
  buyer: '🏪',
  transporter: '🚛',
};

export default function Chat() {
  const { currentUser, userProfile, profileLoading } = useAuth();
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [rtdbError, setRtdbError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  const currentListenerRef = useRef(null);

  const role = userProfile?.role || 'buyer';

  // Load all registered users from Firestore
  useEffect(() => {
    async function fetchUsers() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users = [];
        snap.forEach(doc => {
          const d = doc.data();
          if (d.uid !== currentUser?.uid) {
            users.push({
              id: d.uid,
              name: d.name || 'User',
              role: d.role || 'buyer',
              avatar: roleEmoji[d.role] || '👤',
              email: d.email || '',
            });
          }
        });
        setAllUsers(users);
      } catch (err) {
        console.warn('[Chat] Could not load users from Firestore:', err.message);
      }
      setLoadingUsers(false);
    }
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Listen to presence changes for online status
  useEffect(() => {
    const presRef = ref(rtdb, 'presence');
    const unsub = onValue(presRef, (snapshot) => {
      const data = snapshot.val() || {};
      setOnlineUsers(data);
    }, () => {});
    return () => off(presRef, 'value', unsub);
  }, []);

  // Check if we were redirected from Marketplace "Chat with Farmer"
  useEffect(() => {
    try {
      const chatTarget = JSON.parse(localStorage.getItem('fc_chat_target') || 'null');
      if (chatTarget && chatTarget.name) {
        const farmerContact = {
          id: chatTarget.farmerId || `farmer_${chatTarget.name.replace(/\s/g, '_').toLowerCase()}`,
          name: chatTarget.name,
          role: 'Farmer',
          avatar: '👨‍🌾',
          product: chatTarget.product || ''
        };
        // Auto-select this contact
        setSelectedContact(farmerContact);
        localStorage.removeItem('fc_chat_target');
      }
    } catch (e) {
      console.warn('Chat target parse err:', e);
    }
  }, []);

  // Build contacts list: merge real users + injected farmer contact
  const contacts = (() => {
    const chatTarget = selectedContact;
    
    // Start with all real users
    let list = allUsers.map(u => ({
      ...u,
      online: onlineUsers[u.id]?.online || false,
    }));

    // If we have a chat target that's not in the list, inject it at top
    if (chatTarget && !list.find(c => c.id === chatTarget.id)) {
      list = [{
        id: chatTarget.id,
        name: chatTarget.name,
        role: chatTarget.role || 'Farmer',
        avatar: chatTarget.avatar || '👨‍🌾',
        online: onlineUsers[chatTarget.id]?.online || false,
      }, ...list];
    }

    return list;
  })();

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set user presence
  useEffect(() => {
    if (!currentUser) return;
    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      set(presenceRef, {
        online: true,
        name: userProfile?.name || currentUser?.displayName || 'User',
        role: userProfile?.role || 'user',
        lastSeen: serverTimestamp()
      });
      onDisconnect(presenceRef).update({ online: false, lastSeen: serverTimestamp() });
      return () => set(presenceRef, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
    } catch (err) {
      console.warn('[Chat] RTDB presence error:', err.message);
    }
  }, [currentUser, userProfile]);

  // Listen to messages for selected conversation
  useEffect(() => {
    if (!selectedContact || !currentUser) {
      setMessages([]);
      return;
    }

    if (currentListenerRef.current) {
      off(currentListenerRef.current);
    }

    try {
      const chatId = generateChatId(currentUser.uid, selectedContact.id);
      const msgsRef = ref(rtdb, `chats/${chatId}/messages`);
      currentListenerRef.current = msgsRef;

      const unsubscribe = onValue(msgsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const msgList = Object.entries(data).map(([key, val]) => ({ key, ...val }));
          msgList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          setMessages(msgList);
        } else {
          setMessages([{
            key: 'welcome',
            sender: 'system',
            text: `Start a conversation with ${selectedContact.name}`,
            timestamp: Date.now()
          }]);
        }
      }, (err) => {
        console.error('[Chat] RTDB listen error:', err);
        setRtdbError('Cannot connect to realtime database. Check Firebase settings.');
      });

      return () => off(msgsRef, 'value', unsubscribe);
    } catch (err) {
      console.error('[Chat] RTDB setup error:', err);
      setRtdbError('Could not initialize chat. Please refresh.');
    }
  }, [selectedContact, currentUser]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !selectedContact) return;
    setSending(true);
    const chatId = generateChatId(currentUser.uid, selectedContact.id);
    try {
      await push(ref(rtdb, `chats/${chatId}/messages`), {
        sender: currentUser.uid,
        senderName: userProfile?.name || currentUser?.displayName || 'User',
        senderRole: userProfile?.role || 'user',
        text: newMessage.trim(),
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error('Send failed:', err);
      setRtdbError('Message failed to send. Check your connection.');
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(typeof ts === 'number' ? ts : Date.now());
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (profileLoading) {
    return (
      <div className="chat-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 12px' }} />
          <p>Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {rtdbError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '10px 16px', marginBottom: '12px',
          color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          ⚠️ {rtdbError}
          <button
            onClick={() => setRtdbError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >✕</button>
        </div>
      )}
      <motion.div
        className={`chat-container ${selectedContact ? 'chat-active' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Contacts List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>💬 Messages</h2>
            <span className="chat-live-badge">🔴 Live</span>
          </div>
          <div className="chat-search">
            <FiSearch className="chat-search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="chat-search"
            />
          </div>
          <div className="contacts-list">
            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
                <p style={{ fontSize: '0.85rem' }}>Loading users...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <FiUser style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                No users found
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="contact-avatar-wrap">
                    <span className="contact-avatar">{contact.avatar}</span>
                    <span className={`online-dot ${contact.online ? 'online' : ''}`} />
                  </div>
                  <div className="contact-info">
                    <div className="contact-name-row">
                      <span className="contact-name">{contact.name}</span>
                    </div>
                    <div className="contact-meta">
                      <span className="contact-role-tag">{contact.role}</span>
                      <span className={`contact-status ${contact.online ? 'text-green' : ''}`}>
                        {contact.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {selectedContact ? (
            <>
              <div className="chat-main-header">
                <div className="chat-user">
                  <button className="mobile-back-btn" onClick={() => setSelectedContact(null)}>
                    ‹ Back
                  </button>
                  <div className="chat-user-avatar-wrap">
                    <span className="chat-user-avatar">{selectedContact.avatar}</span>
                    <span className={`online-dot ${selectedContact.online ? 'online' : ''}`} />
                  </div>
                  <div>
                    <span className="chat-user-name">{selectedContact.name}</span>
                    <span className="chat-user-role">
                      {selectedContact.role} • {selectedContact.online ? '🟢 Online' : '⚫ Offline'}
                    </span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <span className="realtime-indicator">⚡ Real-time</span>
                </div>
              </div>

              <div className="messages-area">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMe = msg.sender === currentUser?.uid;
                    const isSystem = msg.sender === 'system';
                    if (isSystem) {
                      return (
                        <div key={msg.key} className="system-msg">
                          <span>{msg.text}</span>
                        </div>
                      );
                    }
                    return (
                      <motion.div
                        key={msg.key}
                        className={`message ${isMe ? 'me' : 'them'}`}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 20 }}
                      >
                        {!isMe && (
                          <div className="msg-sender-name">{msg.senderName}</div>
                        )}
                        <div className="message-bubble">
                          <p>{msg.text}</p>
                          <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type a message... (Enter to send)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  id="chat-message-input"
                  disabled={sending}
                />
                <button
                  className="btn btn-primary send-btn"
                  onClick={handleSend}
                  id="send-message"
                  disabled={sending || !newMessage.trim()}
                >
                  <FiSend />
                </button>
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <span style={{ fontSize: '4rem' }}>💬</span>
                <h3>Start a Conversation</h3>
                <p>Select a contact to start real-time messaging</p>
                <p className="chat-empty-note">⚡ Messages are delivered instantly via Firebase</p>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
