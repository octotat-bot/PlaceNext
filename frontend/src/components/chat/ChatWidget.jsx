import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, Trash2 } from 'lucide-react';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const hasInitialized = useRef(false);
    useEffect(() => {
        if (isOpen && !hasInitialized.current) {
            hasInitialized.current = true;
            setMessages([
                {
                    role: 'assistant',
                    content: "Hi! I'm your AI Placement Assistant. 👋\n\nI can help you with:\n• Placement policies and procedures\n• Interview preparation tips\n• Company selection processes\n• Eligibility criteria questions\n\nHow can I assist you today?",
                },
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const { data } = await aiAPI.chat({ message: userMessage, sessionId });
            setSessionId(data.sessionId);
            setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
        } catch (_error) {
            toast.error('Failed to get response. Please try again.');
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again later.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = async () => {
        try {
            if (sessionId) {
                await aiAPI.newChatSession();
            }
            setMessages([
                {
                    role: 'assistant',
                    content: "Chat cleared! How can I help you today?",
                },
            ]);
            setSessionId(null);
        } catch (error) {
            console.error('Failed to clear chat:', error);
        }
    };

    const suggestedQuestions = [
        "How to prepare for interviews?",
        "What is the CGPA requirement?",
        "How do placements work?",
    ];

    return (
        <div className="chat-widget" style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{
                            position: 'absolute', bottom: 76, right: 0, width: 380, height: 600, maxHeight: 'calc(100vh - 120px)',
                            background: 'rgba(15, 15, 15, 0.75)', backdropFilter: 'blur(24px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 24, display: 'flex', flexDirection: 'column',
                            overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div className="flex items-center gap-3">
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #facc15 0%, #e8a045 100%)',
                                    boxShadow: '0 4px 12px rgba(232, 160, 69, 0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1200'
                                }}>
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                                        Place<em style={{ fontStyle: 'italic', color: '#e8a045' }}>Next</em> AI
                                    </div>
                                    <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'block', boxShadow: '0 0 8px #10b981' }}></span>
                                        Always Online
                                    </div>
                                </div>
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={clearChat} 
                                style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
                            >
                                <Trash2 size={15} />
                            </motion.button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {messages.map((message, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    key={index}
                                    style={{ display: 'flex', gap: 12, flexDirection: message.role === 'user' ? 'row-reverse' : 'row' }}
                                >
                                    {message.role !== 'user' && (
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(232, 160, 69, 0.15)', color: '#facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                            <Bot size={14} />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '85%', padding: '12px 16px', fontSize: 13, lineHeight: 1.5,
                                        borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                                        background: message.role === 'user' ? 'var(--color-text-primary)' : 'rgba(255,255,255,0.05)',
                                        color: message.role === 'user' ? 'var(--color-background-primary)' : 'var(--color-text-primary)',
                                        border: message.role !== 'user' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    }}>
                                        <p className="whitespace-pre-wrap" style={{ margin: 0 }}>{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                                        <Bot size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: '4px 18px 18px 18px' }}>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-tertiary)', display: 'block' }} />
                                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-tertiary)', display: 'block' }} />
                                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-text-tertiary)', display: 'block' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {messages.length <= 1 && (
                            <div style={{ padding: '0 24px 16px' }}>
                                <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 600 }}>Suggested</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {suggestedQuestions.map((question, index) => (
                                        <motion.button
                                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                            whileTap={{ scale: 0.98 }}
                                            key={index}
                                            onClick={() => setInput(question)}
                                            style={{
                                                fontSize: 12, padding: '8px 14px', borderRadius: 100,
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--color-text-secondary)', cursor: 'pointer'
                                            }}
                                        >
                                            {question}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{
                                display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 6px 6px 18px',
                                transition: 'border-color 0.2s',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask anything..."
                                    disabled={loading}
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none' }}
                                />
                                <motion.button
                                    whileHover={{ scale: input.trim() && !loading ? 1.05 : 1 }}
                                    whileTap={{ scale: input.trim() && !loading ? 0.95 : 1 }}
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    style={{
                                        width: 38, height: 38, borderRadius: '50%', background: 'var(--color-text-primary)', color: 'var(--color-background-primary)',
                                        border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                        opacity: input.trim() && !loading ? 1 : 0.5, boxShadow: input.trim() && !loading ? '0 4px 12px rgba(255,255,255,0.2)' : 'none'
                                    }}
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} style={{ marginLeft: 2 }} />}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                className="tour-ai-chat"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #facc15 0%, #e8a045 100%)',
                    boxShadow: isOpen ? '0 8px 24px rgba(232, 160, 69, 0.4)' : '0 12px 32px rgba(232, 160, 69, 0.5), 0 0 0 6px rgba(232, 160, 69, 0.1)',
                    color: '#1a1200', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 1000
                }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X size={24} />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <MessageCircle size={24} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default ChatWidget;
