import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiSearch,
  FiLoader,
  FiMessageCircle,
  FiMoreVertical,
  FiSend,
  FiArrowDown,
  FiImage,
  FiShoppingBag,
} from "react-icons/fi";
import { useSocket } from "../../hooks/useSocket";
import chatService from "../../services/chatService";
import ProductSelectorModal from "./ProductSelectorModal";
import "./ChatPage.css";

// ──────────────────────────────────────────────
// Helper: lấy tên hiển thị + avatar của đối phương
// ──────────────────────────────────────────────
function getConvDisplay(conv, myUserId) {
  const isShopOwner = conv.ShopOwnerId === myUserId;
  if (isShopOwner) {
    // Tôi là shop owner → đối phương là client
    const client = conv.Users_Conversations_ClientIdToUsers;
    return {
      name: String(client?.FullName || "Khách hàng"),
      avatar: client?.AvatarUrl || null,
      otherId: conv.ClientId,
    };
  } else {
    // Tôi là client → đối phương là shop owner
    const shop = conv.Users_Conversations_ShopOwnerIdToUsers;
    const storeName =
      shop?.Stores?.[0]?.StoreName || shop?.Stores?.StoreName || "Cửa hàng";
    const logoUrl = shop?.Stores?.[0]?.LogoUrl || shop?.Stores?.LogoUrl || null;
    return {
      name: String(storeName || "Cửa hàng"),
      avatar: logoUrl,
      otherId: conv.ShopOwnerId,
    };
  }
}

function AvatarPlaceholder({ name, size = 48 }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
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
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: "50%",
          objectFit: "cover",
          display: "block",
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
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ? Number(payload.sub) : null;
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Format thời gian
// ──────────────────────────────────────────────
function formatTime(dateStr) {
  if (!dateStr) return "";
  const fixedStr = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
  const d = new Date(fixedStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatLastTime(dateStr) {
  if (!dateStr) return "";
  const fixedStr = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
  const d = new Date(fixedStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isShopOwnerMode = location.pathname.startsWith("/shop-owner");
  const myUserId = getMyUserId();

  // ── Check token ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ── State ──
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const lastMsgIdRef = useRef(null);
  const activeConvIdRef = useRef(activeConvId);

  // Đồng bộ ref với state
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  const [initialLoad, setInitialLoad] = useState(true);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback(
    (force = false) => {
      // Dùng setTimeout để đảm bảo DOM đã render xong
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
        }
      }, 100);
    },
    [], // Không phụ thuộc vào loadingMsgs hay loadingMore nữa
  );

  // ── Load thêm tin nhắn cũ (cursor pagination) ──
  const loadMoreMessages = useCallback(async () => {
    if (!nextCursor || loadingMore || !activeConvId) return;

    const scrollContainer = chatScrollRef.current;
    const previousScrollHeight = scrollContainer
      ? scrollContainer.scrollHeight
      : 0;

    try {
      setLoadingMore(true);
      const result = await chatService.getMessages(activeConvId, nextCursor, 6);
      setMessages((prev) => [...(result.data || []), ...prev]);
      setNextCursor(result.nextCursor || null);

      if (scrollContainer && previousScrollHeight > 0) {
        setTimeout(() => {
          const newScrollHeight = scrollContainer.scrollHeight;
          const heightDifference = newScrollHeight - previousScrollHeight;
          scrollContainer.scrollTop = heightDifference;
        }, 50);
      }
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoadingMore(false);
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
      console.log("[Chat] Callback onMessage received:", msg);

      // 1. Cập nhật preview cho danh sách bên trái (cho TẤT CẢ tin nhắn đến)
      setConversations((prev) => {
        const foundIndex = prev.findIndex(c => c.ConversationId === msg.ConversationId);
        if (foundIndex === -1) {
          // Tin nhắn từ một hội thoại hoàn toàn mới, cần lấy lại danh sách
          chatService.getConversations().then(data => {
            if (data) setConversations(data);
          }).catch(err => console.error(err));
          return prev;
        }
        
        return prev.map((c) =>
          c.ConversationId === msg.ConversationId
            ? { ...c, Messages: [msg] }
            : c,
        );
      });

      // 2. Chỉ thêm vào danh sách chat chính nếu đang mở đúng conversation đó
      if (msg.ConversationId === activeConvIdRef.current) {
        setMessages((prev) => {
          const exists = prev.find((m) => m.MessageId === msg.MessageId);
          return exists ? prev : [...prev, msg];
        });

        if (showScrollBottom) {
          setHasNewMessages(true);
        }
      }
    },
    onError: (err) => {
      setSocketError(err);
      if (err === "TokenExpired" || err === "Unauthorized") {
        navigate("/login");
      }
    },
    onConnect: (socket) => {
      if (activeConvId) {
        joinConversation(activeConvId);
      }
    },
  });

  // Tự động cuộn xuống khi có tin nhắn mới (chỉ khi đang ở đáy)
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const isNewLastMsg = lastMsg.MessageId !== lastMsgIdRef.current;

    if (isNewLastMsg && !loadingMore && !showScrollBottom) {
      scrollToBottom(true);
    }

    lastMsgIdRef.current = lastMsg.MessageId;
  }, [messages, loadingMore, showScrollBottom, scrollToBottom]);

  // ── Chọn conversation ──
  const selectConversation = useCallback(
    async (convId) => {
      if (!convId) return;
      setActiveConvId(convId);
      setMessages([]);
      setNextCursor(null);
      joinConversation(convId);

      try {
        setLoadingMsgs(true);
        const result = await chatService.getMessages(convId, null, 20);
        setMessages(result.data || []);
        setNextCursor(result.nextCursor || null);
        scrollToBottom(true);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingMsgs(false);
      }
    },
    [joinConversation, scrollToBottom],
  );

  // ── Load danh sách conversations ──
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingConvs(true);
        const data = await chatService.getConversations();
        setConversations(data || []);
        setLoadingConvs(false);

        // Tự động chọn cuộc hội thoại nếu được truyền từ trang chi tiết sản phẩm
        if (location.state?.conversationId) {
          selectConversation(location.state.conversationId);
        }
      } catch (err) {
        console.error("[Chat] Error loading conversations:", err);
        setLoadingConvs(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount hoặc khi navigate lại trang chat (không dependency để tránh loop)

  // ── Gửi tin nhắn ──
  const handleSend = useCallback(() => {
    const content = messageInput.trim();
    if (!content || !activeConvId) return;
    sendMessage(activeConvId, content);
    setMessageInput("");
    inputRef.current?.focus();
  }, [messageInput, activeConvId, sendMessage]);

  const handleSelectProduct = useCallback((product) => {
    if (!activeConvId) return;
    const content = JSON.stringify({
      type: "PRODUCT",
      productId: product.id,
      productName: product.name,
      price: product.price,
      thumbnail: product.thumbnail,
      sold: product.sold || 0,
    });
    sendMessage(activeConvId, content);
    setIsProductModalOpen(false);
  }, [activeConvId, sendMessage]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConvId) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const result = await chatService.uploadImage(file);
      if (result.imageUrl) {
        sendMessage(activeConvId, result.imageUrl);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Lỗi khi tải ảnh");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered conversations ──
  const filteredConvs = conversations.filter((c) => {
    // Ẩn hội thoại nếu chưa có tin nhắn nào (ngoại trừ hội thoại mình đang trực tiếp mở để chat)
    const hasMessages = c.Messages && c.Messages.length > 0;
    if (!hasMessages && c.ConversationId !== activeConvId) {
      return false;
    }

    const { name } = getConvDisplay(c, myUserId);
    return (name || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase());
  });

  const activeConv = conversations.find(
    (c) => c.ConversationId === activeConvId,
  );

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────

  // Debug: if still loading after 3 seconds, there might be an issue
  if (loadingConvs && !conversations.length) {
    return (
      <div
        className={`chat-container ${isShopOwnerMode ? "in-dashboard" : ""}`}
      >
        {!isShopOwnerMode && (
          <header className="chat-header">
            <div className="chat-header-left">
              <button onClick={() => navigate(-1)} className="back-btn">
                <FiArrowLeft size={20} />
              </button>
              <h1>Trò chuyện</h1>
            </div>
          </header>
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <FiLoader
            size={40}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p style={{ color: "#64748b", fontSize: "14px" }}>Đang tải...</p>
          <small style={{ color: "#94a3b8", fontSize: "12px" }}>
            Nếu lâu, mở F12 Console để check lỗi
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-container ${isShopOwnerMode ? "in-dashboard" : ""}`}>
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
                const lastMsg = conv.Messages && conv.Messages.length > 0 
                  ? conv.Messages[conv.Messages.length - 1] 
                  : null;
                const isActive = conv.ConversationId === activeConvId;
                return (
                  <div
                    key={conv.ConversationId}
                    className={`conversation-item ${isActive ? "active" : ""}`}
                    onClick={() => selectConversation(conv.ConversationId)}
                  >
                    <div className="avatar-wrapper">
                      <ConvAvatar avatar={avatar} name={name} size={48} />
                      <div className="online-indicator" />
                    </div>
                    <div className="conv-info">
                      <div className="conv-name-row">
                        <span className="conv-name">{name}</span>
                        <span className="conv-time">
                          {formatLastTime(lastMsg?.SentAt || lastMsg?.CreatedAt)}
                        </span>
                      </div>
                      <div className="conv-msg-row">
                        <span className="conv-last-msg">
                          {lastMsg
                            ? (lastMsg.MessageContent || lastMsg.Content || "").startsWith("http")
                              ? "[Ảnh]"
                              : (lastMsg.MessageContent || lastMsg.Content)
                            : "Không có tin nhắn"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="chat-panel">
          {!activeConv ? (
            <div className="no-conversation-state">
              <FiMessageCircle size={64} className="no-conv-icon" />
              <h3>Chọn cuộc trò chuyện</h3>
              <p>Chọn một cuộc hội thoại bên trái để bắt đầu nhắn tin</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <div className="active-user-info">
                  {(() => {
                    const { name, avatar } = getConvDisplay(
                      activeConv,
                      myUserId,
                    );
                    return (
                      <>
                        <ConvAvatar avatar={avatar} name={name} size={32} />
                        <div className="active-status-info">
                          <h3>{name}</h3>
                          <div className="online-status">
                            <span className="status-dot online" />
                            Đang hoạt động
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button className="more-btn" title="Tùy chọn">
                  <FiMoreVertical size={20} />
                </button>
              </div>

              <div
                className="chat-content custom-scrollbar"
                ref={chatScrollRef}
                onScroll={handleScroll}
              >
                {loadingMore && (
                  <div className="load-more-wrapper">
                    <button className="load-more-btn" disabled>
                      <FiLoader className="spin-icon" size={18} />
                      <span>Đang tải tin nhắn cũ...</span>
                    </button>
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
                      const isSent = msg.SenderId === myUserId;
                      const content = msg.MessageContent || msg.Content || "";
                      return (
                        <div
                          key={msg.MessageId}
                          className={`message-bubble-wrapper ${isSent ? "sent" : "received"}`}
                        >
                          <div className="message-content">
                            {(() => {
                              try {
                                if (content.startsWith('{"type":"PRODUCT"')) {
                                  const product = JSON.parse(content);
                                  return (
                                    <div 
                                      className="message-bubble product-bubble"
                                      onClick={() => navigate(`/products/${product.productId}`)}
                                      title="Xem chi tiết sản phẩm"
                                    >
                                      <div className="product-card">
                                        <div className="product-card-img-wrapper">
                                          <img src={product.thumbnail} alt={product.productName} className="product-card-img" />
                                        </div>
                                        <div className="product-card-info">
                                          <div className="product-card-name">{product.productName}</div>
                                          <div className="product-card-price">{new Intl.NumberFormat("vi-VN").format(product.price)}đ</div>
                                          <div className="product-card-footer">
                                            <span className="sold-count">Đã bán {product.sold || 0}</span>
                                            <span className="shop-location">TP. Hồ Chí Minh</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              } catch (e) {}

                              if (content.startsWith("http")) {
                                return (
                                  <div className={`message-bubble image-bubble`}>
                                    <img
                                      src={content}
                                      alt="chat-img"
                                      className="chat-image"
                                      onClick={() => setPreviewImage(content)}
                                      style={{ cursor: "zoom-in" }}
                                      onError={(e) => {
                                        e.target.src = "";
                                        e.target.alt = "Ảnh lỗi";
                                      }}
                                    />
                                  </div>
                                );
                              }

                              return (
                                <div className="message-bubble">
                                  {content || "(Tin nhắn trống)"}
                                </div>
                              );
                            })()}
                            <span className="message-time">
                              {formatTime(msg.SentAt || msg.CreatedAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {showScrollBottom && (
                  <button
                    className={`scroll-bottom-btn ${hasNewMessages ? "has-new" : ""}`}
                    onClick={() => scrollToBottom(true)}
                    title="Cuộn xuống tin nhắn mới nhất"
                  >
                    <FiArrowDown size={20} />
                    {hasNewMessages && <span className="new-msg-dot" />}
                  </button>
                )}
              </div>

              <div className="chat-input-area">
                <div className="input-wrapper">


                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <button
                    className={`image-upload-btn ${uploadingImage ? "uploading" : ""}`}
                    title="Gửi ảnh"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <FiLoader className="spin-icon" size={20} />
                    ) : (
                      <FiImage size={20} />
                    )}
                  </button>

                  <button
                    className="product-selector-btn"
                    title="Chia sẻ sản phẩm"
                    onClick={() => setIsProductModalOpen(true)}
                  >
                    <FiShoppingBag size={20} />
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
                  className={`send-btn ${messageInput.trim() ? "active" : ""}`}
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
      
      <ProductSelectorModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelect={handleSelectProduct}
        shopId={activeConv?.Users_Conversations_ShopOwnerIdToUsers?.Stores?.[0]?.StoreId || activeConv?.Users_Conversations_ShopOwnerIdToUsers?.Stores?.StoreId}
      />

      {/* Image Preview Overlay */}
      {previewImage && (
        <div 
          className="image-preview-overlay" 
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out'
          }}
        >
          <img 
            src={previewImage} 
            alt="Preview" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              transform: 'scale(1)',
              transition: 'transform 0.2s ease-out'
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default ChatPage;
