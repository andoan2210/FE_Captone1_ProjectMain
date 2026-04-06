import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch, FiSend, FiArrowLeft,
  FiMoreVertical, FiSmile, FiMessageCircle, FiLoader, FiArrowDown,
  FiImage, FiX
} from 'react-icons/fi';
import { useSocket } from '../../hooks/useSocket';
import chatService from '../../services/chatService';
import './ChatPage.css';

// ──────────────────────────────────────────────
// Helper: lấy tên hiển thị + avatar của đối phương
// ──────────────────────────────────────────────
function getConvDisplay(conv, myUserId) {
  const isShopOwner = conv.ShopOwnerId === myUserId;
  if (isShopOwner) {
    // Tôi là shop owner → đối phương là client
    const client = conv.Users_Conversations_ClientIdToUsers;
    return {
      name: client?.FullName || 'Khách hàng',
      avatar: client?.AvatarUrl || null,
      otherId: conv.ClientId,
    };
  } else {
    // Tôi là client → đối phương là shop owner
    const shop = conv.Users_Conversations_ShopOwnerIdToUsers;
    const storeName = shop?.Stores?.[0]?.StoreName || shop?.Stores?.StoreName || 'Cửa hàng';
    const logoUrl   = shop?.Stores?.[0]?.LogoUrl   || shop?.Stores?.LogoUrl   || null;
    return {
      name: storeName,
      avatar: logoUrl,
      otherId: conv.ShopOwnerId,
    };
  }
}

function AvatarPlaceholder({ name, size = 48 }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className="avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

function ConvAvatar({ avatar, name, size = 48 }) {
  if (avatar) return (
    <img
      src={avatar}
      alt={name}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block'
      }}
    />
  );
  return <AvatarPlaceholder name={name} size={size} />;
}

// ──────────────────────────────────────────────
// Lấy myUserId từ token
// ──────────────────────────────────────────────
function getMyUserId() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Format thời gian
// ──────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatLastTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isShopOwnerMode = location.pathname.startsWith('/shop-owner');
  const myUserId = getMyUserId();

  // ── State ──
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback((force = false) => {
    if (force || (!loadingMore && !loadingMsgs)) {
      messagesEndRef.current?.scrollIntoView({ behavior: force ? 'auto' : 'smooth' });
      setHasNewMessages(false);
      setShowScrollBottom(false);
    }
  }, [loadingMore, loadingMsgs]);

  // ── Load thêm tin nhắn cũ (cursor pagination) ──
  const loadMoreMessages = useCallback(async () => {
    if (!nextCursor || loadingMore || !activeConvId) return;
    
    // Lưu lại chiều cao trước khi load
    const scrollContainer = chatScrollRef.current;
    const previousScrollHeight = scrollContainer ? scrollContainer.scrollHeight : 0;

    try {
      setLoadingMore(true);
      const result = await chatService.getMessages(activeConvId, nextCursor);
      
      const newMessages = result.data || [];
      if (newMessages.length > 0) {
        setMessages((prev) => [...newMessages, ...prev]);
        setNextCursor(result.nextCursor || null);

        // Restore scroll position
        if (scrollContainer) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const newScrollHeight = scrollContainer.scrollHeight;
              scrollContainer.scrollTop = newScrollHeight - previousScrollHeight;
            });
          });
        }
      }
    } catch (err) {
      console.error('Lỗi load thêm tin nhắn:', err);
    } finally {
      // Delay việc tắt loadingMore một chút để tránh trigger scroll liên tục
      setTimeout(() => setLoadingMore(false), 200);
    }
  }, [nextCursor, loadingMore, activeConvId]);

  // Lắng nghe scroll để hiện nút "Cuộn xuống" & Infinite Scroll
  const handleScroll = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // 1. Hiện nút Scroll Bottom nếu cuộn lên quá 300px
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
    setShowScrollBottom(isScrolledUp);
    
    // 2. Tắt thông báo tin mới nếu cuộn xuống sát đáy
    if (!isScrolledUp) {
      setHasNewMessages(false);
    }
    
    // 3. ── Infinite Scroll: Tự động load tin cũ khi cuộn lên sát đầu (100px) ──
    if (scrollTop < 100 && nextCursor && !loadingMore && !loadingMsgs) {
      loadMoreMessages();
    }
  }, [nextCursor, loadingMore, loadingMsgs, loadMoreMessages]);

  // ── Socket ──
  const { joinConversation, sendMessage } = useSocket({
    onMessage: (msg) => {
      // Chỉ thêm nếu tin nhắn thuộc conversation đang xem
      setMessages((prev) => {
        if (prev.some((m) => m.MessageId === msg.MessageId)) return prev;
        
        // Nếu đang xem tin cũ, báo có tin mới thay vì tự cuộn
        if (showScrollBottom) {
          setHasNewMessages(true);
        }
        
        return [...prev, msg];
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.ConversationId === msg.ConversationId
            ? { ...c, Messages: [msg] }
            : c
        )
      );
    },
    onError: (err) => {
      setSocketError(err);
      if (err === 'TokenExpired' || err === 'Unauthorized') {
        setTimeout(() => navigate('/login'), 1500);
      }
    },
    onConnect: (socket) => {
      if (activeConvId) {
        socket.emit('joinConversation', { conversationId: activeConvId });
      }
    },
  });

  // Tự động cuộn xuống khi có tin nhắn mới (chỉ khi đang ở đáy)
  useEffect(() => {
    if (messages.length === 0) {
      lastMsgIdRef.current = null;
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const isNewLastMsg = lastMsg.MessageId !== lastMsgIdRef.current;

    // Chỉ tự động cuộn xuống nếu có tin mới VÀ người dùng KHÔNG đang xem tin cũ
    if (isNewLastMsg && !loadingMore && !showScrollBottom) {
      scrollToBottom();
    }

    lastMsgIdRef.current = lastMsg.MessageId;
  }, [messages, loadingMore, showScrollBottom, scrollToBottom]);

  // ── Load danh sách conversations ──
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingConvs(true);
        const data = await chatService.getConversations();
        setConversations(data);

        const stateConvId = location.state?.conversationId;
        if (stateConvId) {
          setTimeout(() => selectConversation(stateConvId), 100);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách chat:', err);
      } finally {
        setLoadingConvs(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chọn conversation ──
  const selectConversation = useCallback(async (convId) => {
    setActiveConvId(convId);
    setMessages([]);
    setNextCursor(null);
    joinConversation(convId);

    try {
      setLoadingMsgs(true);
      setInitialLoad(true);
      const result = await chatService.getMessages(convId);
      setMessages(result.data || []);
      setNextCursor(result.nextCursor || null);
      // Khi mới chọn conversation, luôn cuộn xuống đáy
      setTimeout(() => scrollToBottom(true), 100);
    } catch (err) {
      console.error('Lỗi tải tin nhắn:', err);
    } finally {
      setLoadingMsgs(false);
      setInitialLoad(false);
    }
  }, [joinConversation, scrollToBottom]);

  // ── Gửi tin nhắn ──
  const handleSend = useCallback(() => {
    const content = messageInput.trim();
    if (!content || !activeConvId) return;
    sendMessage(activeConvId, content);
    setMessageInput('');
    inputRef.current?.focus();
  }, [messageInput, activeConvId, sendMessage]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConvId) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh.');
      return;
    }

    // Kiểm tra dung lượng (VD: < 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh quá lớn (tối đa 5MB).');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await chatService.uploadImage(file);
      if (result && result.imageUrl) {
        // Gửi URL hình ảnh như một tin nhắn
        sendMessage(activeConvId, result.imageUrl);
      }
    } catch (err) {
      console.error('Lỗi tải ảnh lên:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered conversations ──
  const filteredConvs = conversations.filter((c) => {
    const { name } = getConvDisplay(c, myUserId);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const activeConv = conversations.find((c) => c.ConversationId === activeConvId);

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <div className={`chat-container ${isShopOwnerMode ? 'in-dashboard' : ''}`}>

      {/* Header - chỉ hiện khi không ở shop-owner mode */}
      {!isShopOwnerMode && (
        <header className="chat-header">
          <div className="chat-header-left">
            <button onClick={() => navigate(-1)} className="back-btn">
              <FiArrowLeft size={20} />
            </button>
            <h1>Trò chuyện</h1>
          </div>
          {socketError && (
            <div className="socket-error-badge">⚠️ {socketError}</div>
          )}
        </header>
      )}

      <div className="chat-main-layout">
        {/* ──── SIDEBAR ──── */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Tin nhắn</h2>
          </div>
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="conversation-list custom-scrollbar">
            {loadingConvs ? (
              <div className="loading-state">
                <FiLoader className="spin-icon" size={22} />
                <span>Đang tải...</span>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="empty-state">
                <FiMessageCircle size={36} />
                <p>Chưa có cuộc hội thoại nào</p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const { name, avatar } = getConvDisplay(conv, myUserId);
                const lastMsg = conv.Messages?.[0];
                const isActive = conv.ConversationId === activeConvId;

                return (
                  <div
                    key={conv.ConversationId}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => selectConversation(conv.ConversationId)}
                  >
                    <div className="avatar-wrapper">
                      <ConvAvatar avatar={avatar} name={name} size={48} />
                    </div>
                    <div className="conv-info">
                      <div className="conv-name-row">
                        <span className="conv-name">{name}</span>
                        <span className="conv-time">
                          {lastMsg ? formatLastTime(lastMsg.SentAt) : ''}
                        </span>
                      </div>
                      <div className="conv-msg-row">
                        <span className="conv-last-msg">
                          {lastMsg?.MessageContent || 'Bắt đầu trò chuyện...'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ──── MAIN PANEL ──── */}
        <main className="chat-panel">
          {!activeConv ? (
            /* Màn hình chờ chọn conversation */
            <div className="no-conversation-state">
              <FiMessageCircle size={64} className="no-conv-icon" />
              <h3>Chọn cuộc trò chuyện</h3>
              <p>Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin</p>
            </div>
          ) : (
            <>
              {/* Panel Header */}
              <div className="panel-header">
                <div className="active-user-info">
                  {(() => {
                    const { name, avatar } = getConvDisplay(activeConv, myUserId);
                    return (
                      <>
                        <ConvAvatar avatar={avatar} name={name} size={40} />
                        <div className="active-status-info">
                          <h3>{name}</h3>
                          <span className="online-status">
                            <span className="status-dot online" />
                            Đang hoạt động
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button className="more-btn" title="Tùy chọn">
                  <FiMoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="chat-content custom-scrollbar" ref={chatScrollRef} onScroll={handleScroll}>
                {/* Load more spinner (Automatic now) */}
                {loadingMore && (
                  <div className="load-more-wrapper">
                    <div className="load-more-spinner">
                      <FiLoader className="spin-icon" size={18} /> 
                      <span>Đang tải tin nhắn cũ...</span>
                    </div>
                  </div>
                )}

                {loadingMsgs ? (
                  <div className="loading-state">
                    <FiLoader className="spin-icon" size={22} />
                    <span>Đang tải tin nhắn...</span>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg) => {
                      const isMine = msg.SenderId === myUserId;
                      return (
                        <div
                          key={msg.MessageId}
                          className={`message-bubble-wrapper ${isMine ? 'sent' : 'received'}`}
                        >
                          {!isMine && (() => {
                            const { name, avatar } = getConvDisplay(activeConv, myUserId);
                            return <ConvAvatar avatar={avatar} name={name} size={32} />;
                          })()}
                          <div className="message-content">
                            <div className={`message-bubble ${msg.MessageContent?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? 'image-bubble' : ''}`}>
                              {msg.MessageContent?.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                <img 
                                  src={msg.MessageContent} 
                                  alt="Sent image" 
                                  className="chat-image" 
                                  onLoad={() => scrollToBottom(true)}
                                />
                              ) : (
                                msg.MessageContent
                              )}
                            </div>
                            <span className="message-time">
                              {formatTime(msg.SentAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Nút Cuộn xuống nhanh */}
                {showScrollBottom && (
                  <button 
                    className={`scroll-bottom-btn ${hasNewMessages ? 'has-new' : ''}`}
                    onClick={() => scrollToBottom(true)}
                    title="Cuộn xuống tin nhắn mới nhất"
                  >
                    <FiArrowDown size={20} />
                    {hasNewMessages && <span className="new-msg-dot" />}
                  </button>
                )}
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <div className="input-wrapper">
                  <button className="emoji-btn" title="Emoji">
                    <FiSmile size={20} />
                  </button>
                  
                  {/* Image Upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <button 
                    className={`image-upload-btn ${uploadingImage ? 'uploading' : ''}`} 
                    title="Gửi ảnh"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? <FiLoader className="spin-icon" size={20} /> : <FiImage size={20} />}
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={1000}
                  />
                </div>
                <button
                  className={`send-btn ${messageInput.trim() ? 'active' : ''}`}
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  title="Gửi (Enter)"
                >
                  <FiSend size={18} />
                  <span>Gửi</span>
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
