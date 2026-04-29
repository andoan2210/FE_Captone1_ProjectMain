import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSend, FiMessageCircle, FiX, FiMenu, FiPlus, FiArrowRight, FiTrash2 } from "react-icons/fi";
import chatbotService from "../../services/chatbotService";
import "./ChatbotWidget.css";

// ── Format thời gian ──
function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

// ── Format giá tiền ──
function formatPrice(price) {
  if (!price && price !== 0) return "";
  return new Intl.NumberFormat("vi-VN").format(Number(price)) + "đ";
}

function parseMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  // Bullet points: *, -, +, •
  html = html.replace(/^\s*[\*\-\+•]\s+(.+)$/gm, "<li>$1</li>");

  // Robustly detect detail lines
  html = html.replace(/<li>(.*?)<\/li>/gi, (match, innerText) => {
    let textOnly = innerText.replace(/<[^>]+>/g, "");
    let matchDetail = textOnly.match(/^\s*(Giá|Cửa hàng|Kích cỡ|Màu sắc|Chất liệu)\s*:\s*(.*)$/i);
    if (matchDetail) {
      return `<li class="detail-line">${matchDetail[1]}: ${matchDetail[2]}</li>`;
    }
    return match;
  });

  // Group consecutive <li> ignoring any whitespace/newlines between them
  html = html.replace(/(?:<li[^>]*>.*?<\/li>\s*)+/g, (match) => {
    return "<ul>" + match.replace(/\n/g, "") + "</ul>";
  });

  // Line breaks for remaining text
  html = html.replace(/\n/g, "<br/>");
  return html;
}

// ── Quick action buttons ──
const QUICK_QUESTIONS = [
  "Gợi ý áo thun nam",
  "Tìm váy nữ dưới 500k",
  "Xu hướng thời trang 2024",
  "Tư vấn size áo",
];

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ẩn widget trên trang chat real-time và shop-owner
  const hiddenPaths = ["/chat", "/shop-owner"];
  const shouldHide = hiddenPaths.some((p) => location.pathname.startsWith(p));

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);


  const bodyRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Scroll xuống cuối ──
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, []);

  // ── Load lịch sử chat khi mở lần đầu ──
  useEffect(() => {
    if (!isOpen || historyLoaded) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await chatbotService.getMessages();
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        }
      } catch (err) {
        console.error("[Chatbot] Error loading history:", err);
        // Không hiện lỗi cho user, chỉ log
      } finally {
        setIsLoadingHistory(false);
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [isOpen, historyLoaded]);


  // ── Auto scroll khi có tin nhắn mới ──
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // ── Toggle popup ──
  const handleToggle = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 250);
    } else {
      setIsOpen(true);
      setError(null);
    }
  };

  // ── Gửi tin nhắn ──
  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Tạo conversationHistory từ messages
    const conversationHistory = messages
      .filter((m) => m.role === "user" || m.role === "model")
      .slice(-10) // Giới hạn 10 tin nhắn gần nhất
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

    // Thêm tin nhắn user vào UI ngay lập tức
    const userMsg = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "34px";
    }

    try {
      const res = await chatbotService.sendMessage(
        question,
        conversationHistory
      );

      const modelMsg = {
        role: "model",
        content: res.answer,
        suggestedProducts: res.suggestedProducts || [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error("[Chatbot] Error sending message:", err);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Xử lý keyboard ──
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Auto-resize textarea ──
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "34px";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  };

  // ── Quick question ──
  const handleQuickQuestion = (q) => {
    setInput(q);
    // Focus vào textarea rồi gửi luôn
    setTimeout(() => {
      handleSend();
    }, 50);
  };

  // ── Chuyển sang trang Messenger (real-time chat) ──
  const openMessenger = () => {
    setIsOpen(false);
    navigate("/chat");
  };

  if (shouldHide) return null;

  return (
    <>
      {/* ── Floating Bubble ── */}
      <button
        className={`chatbot-floating-btn ${isOpen ? "open" : ""}`}
        onClick={handleToggle}
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
        id="chatbot-toggle-btn"
      >
        {isOpen ? <FiX size={24} /> : "🤖"}
      </button>

      {/* ── Popup Panel ── */}
      {(isOpen || isClosing) && (
        <div className={`chatbot-popup ${isClosing ? "closing" : ""}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-header-info">
                <h3>AI Assistant</h3>
                <p>
                  <span className="online-dot" />
                  Sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button
                className="messenger-btn"
                onClick={openMessenger}
                title="Mở Messenger"
              >
                <FiMessageCircle size={15} />
                Messenger
              </button>
              <button onClick={handleToggle} title="Đóng">
                <FiX size={17} />
              </button>
            </div>
          </div>

          <div className="chatbot-content-wrapper">
            <div className="chatbot-main-area">
              {/* Body */}
          <div className="chatbot-body" ref={bodyRef}>
            {isLoadingHistory ? (
              <div className="chatbot-loading">
                <div className="chatbot-spinner" />
                <span style={{ fontSize: "13px" }}>Đang tải lịch sử...</span>
              </div>
            ) : messages.length === 0 ? (
              /* Welcome Screen */
              <div className="chatbot-welcome">
                <div className="chatbot-welcome-icon">🛍️</div>
                <h4>Xin chào! 👋</h4>
                <p>
                  Tôi là trợ lý mua sắm AI của SmartAI Fashion.
                  <br />
                  Hãy hỏi tôi về sản phẩm, size, phong cách nhé!
                </p>
                <div className="chatbot-quick-actions">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      className="chatbot-quick-btn"
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`chatbot-msg ${msg.role}`}>
                    <div className="chatbot-msg-avatar">
                      {msg.role === "model" ? "🤖" : "👤"}
                    </div>
                    <div className="chatbot-msg-content">
                      {msg.role === "model" ? (
                        <div
                          className="chatbot-msg-bubble"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                        />
                      ) : (
                        <div className="chatbot-msg-bubble">{msg.content}</div>
                      )}

                      {/* Suggested Products */}
                      {msg.suggestedProducts &&
                        msg.suggestedProducts.length > 0 && (
                          <div className="chatbot-products">
                            {msg.suggestedProducts.map((product) => (
                              <div
                                key={product.productId}
                                className="chatbot-product-card"
                                onClick={() =>
                                  navigate(`/products/${product.productId}`)
                                }
                                title={product.productName}
                              >
                                {product.thumbnailUrl && (
                                  <img
                                    src={product.thumbnailUrl}
                                    alt={product.productName}
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                )}
                                <div className="chatbot-product-info">
                                  <p className="chatbot-product-name">
                                    {product.productName}
                                  </p>
                                  <p className="chatbot-product-price">
                                    {formatPrice(product.price)}
                                  </p>
                                  {product.storeName && (
                                    <p className="chatbot-product-shop">
                                      🏪 {product.storeName}
                                    </p>
                                  )}
                                  <button
                                    className="chatbot-product-detail-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/products/${product.productId}`);
                                    }}
                                  >
                                    Chi tiết
                                    <FiArrowRight size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      <span className="chatbot-msg-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="chatbot-typing">
                    <div className="chatbot-typing-avatar">🤖</div>
                    <div className="chatbot-typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && <div className="chatbot-error">{error}</div>}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

              {/* Input Area */}
              <div className="chatbot-input-area">
                <div className="chatbot-input-wrapper">
                  <textarea
                    ref={textareaRef}
                    placeholder="Hỏi tôi bất cứ điều gì..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    maxLength={500}
                    disabled={isLoading}
                  />
                </div>
                <button
                  className={`chatbot-send-btn ${input.trim() ? "active" : ""}`}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  title="Gửi (Enter)"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
