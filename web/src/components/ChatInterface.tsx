'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  baziText: string;
  zodiacText: string;
  initialReading: string;
  onReadingUpdate?: (text: string) => void;
  disableChat?: boolean;
}

// Markdown renderer with support for headers, lists, bold, italic, blockquotes, numbered lists
function renderMarkdown(text: string): string {
  // Escape HTML entities first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Inline formatting
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Process line by line for block elements
  const lines = html.split('\n');
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<h3>${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith('## ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith('# ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<h1>${trimmed.slice(2)}</h1>`);
    }
    // Unordered list
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inOl) { result.push('</ol>'); inOl = false; }
      if (!inUl) { result.push('<ul>'); inUl = true; }
      result.push(`<li>${trimmed.slice(2)}</li>`);
    }
    // Ordered list
    else if (/^\d+\.\s/.test(trimmed)) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (!inOl) { result.push('<ol>'); inOl = true; }
      result.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    }
    // Blockquote
    else if (trimmed.startsWith('&gt; ')) {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<blockquote>${trimmed.slice(5)}</blockquote>`);
    }
    // Horizontal rule
    else if (trimmed === '---' || trimmed === '***') {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push('<hr/>');
    }
    // Empty line = paragraph break
    else if (trimmed === '') {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push('<br/>');
    }
    // Normal text
    else {
      if (inUl) { result.push('</ul>'); inUl = false; }
      if (inOl) { result.push('</ol>'); inOl = false; }
      result.push(`<p>${trimmed}</p>`);
    }
  }
  if (inUl) result.push('</ul>');
  if (inOl) result.push('</ol>');

  return result.join('');
}

export default function ChatInterface({ baziText, zodiacText, initialReading, onReadingUpdate, disableChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: initialReading },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickQuestions = [
    { label: 'Career Path', text: 'What does my chart say about my career path and ideal work environment?' },
    { label: 'Relationships', text: 'Analyze my chart for relationship patterns and compatibility insights.' },
    { label: 'This Year', text: 'What energies should I be aware of this year based on current transits and my chart?' },
    { label: 'Health', text: 'What does my Five Elements balance suggest about health and wellbeing focus areas?' },
    { label: 'Strengths', text: 'What are my greatest natural strengths according to both BaZi and Western astrology?' },
    { label: 'Growth Areas', text: 'Where are my biggest growth opportunities? What challenging patterns should I be aware of?' },
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          baziText,
          zodiacText,
          isInitial: false,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantText += parsed.text;
                setMessages([...newMessages, { role: 'assistant', content: assistantText }]);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i}>
          {i > 0 && <div className="msg-separator my-5" />}
          <div className={`msg-slide-in ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
            {msg.role === 'assistant' ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-500 via-gold-400 to-gold-700 flex items-center justify-center text-[10px] text-void font-bold flex-shrink-0 avatar-daimon shadow-[0_0_8px_rgba(200,169,110,0.25)]">
                    D
                  </div>
                  <span className="text-xs text-gold-500/70">Daimon</span>
                </div>
                <div
                  className="chat-content text-sm text-gray-300 leading-relaxed pl-8"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            ) : (
              <div className="max-w-[85%] sm:max-w-[80%] bg-gold-500/10 border border-gold-500/20 rounded-2xl rounded-br-md px-4 py-3">
                <p className="text-sm text-gray-200">{msg.content}</p>
              </div>
            )}
          </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-2 text-gray-500 msg-slide-in">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-xs text-void font-bold flex-shrink-0">
              D
            </div>
            <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-full px-3 py-2">
              <span className="typing-dot w-1.5 h-1.5 bg-gold-500 rounded-full inline-block"></span>
              <span className="typing-dot w-1.5 h-1.5 bg-gold-500 rounded-full inline-block"></span>
              <span className="typing-dot w-1.5 h-1.5 bg-gold-500 rounded-full inline-block"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Post-reading CTA */}
      {messages.length === 1 && !disableChat && (
        <div className="px-4 py-3 space-y-2 border-t border-gray-800/30">
          <p className="text-xs text-gray-500 text-center mb-2">Explore more</p>
          <div className="flex gap-2">
            <a href="/daily" className="flex-1 py-2.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs text-center hover:bg-gold-500/15 transition-colors press-effect">
              Daily Destiny
            </a>
            <a href="/match" className="flex-1 py-2.5 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-500 text-xs text-center hover:bg-gold-500/15 transition-colors press-effect">
              Check Compatibility
            </a>
          </div>
        </div>
      )}

      {/* Quick Questions */}
      {messages.length <= 1 && !disableChat && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2.5">Explore your chart:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q.label}
                onClick={() => sendMessage(q.text)}
                disabled={isStreaming}
                className="text-xs px-3.5 py-2 rounded-full border border-gray-700 text-gray-400 hover:border-gold-500/50 hover:text-gold-500 hover:bg-gold-500/5 transition-all duration-200 disabled:opacity-40 press-effect"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {!disableChat && <div className="border-t border-gray-800 pt-4 safe-bottom">
        <div className="flex gap-2 sm:gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your chart..."
            rows={1}
            className="flex-1 bg-void-lighter border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30 resize-none transition-all duration-200 input-glow"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-gold-500 text-void font-semibold hover:bg-gold-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 press-effect"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>}
    </div>
  );
}
