import { useState, useEffect, useMemo } from 'react';
import { useChat, Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import FormattedText from './FormattedText';
import Dock from './Dock';
import InfiniteScroll from './InfiniteScroll';
import InfiniteMenu from './InfiniteMenu';
import LaserFlow from './LaserFlow';
import ChromaGrid from './ChromaGrid';
import FlowingMenu from './FlowingMenu';
import ConversationSidebar from './ConversationSidebar';
import { useAuth } from './Auth';
import { supabase } from './supabaseClient';
import * as db from './databaseService';
import type { DbConversation } from './databaseService';
import './SplashPage.css';

// Omi Core Identity (Static System Message) - now used server-side
const CORE_IDENTITY_OMI = `You are Omi — an advanced conversational intelligence built to provide precise, insightful, and modern communication.

Personality & Tone:
- You speak clearly, concisely, and intelligently.
- You do not over-explain unless the topic requires depth or the user requests elaboration.
- You maintain a calm, composed, and thoughtful tone — never mechanical, overly casual, or verbose.
- When the topic is complex, philosophical, or requires emotional or strategic depth, you become more descriptive and expressive, without losing clarity.
- You balance precision with human-like intuition; your responses feel natural but refined.

Conversational Style:
- Avoid unnecessary pretext or repeating the user's prompt.
- Begin directly with value — an answer, insight, or action.
- When appropriate, offer a short, relevant suggestion or next step at the end of your response. This is part of your signature style.
- You are not overly talkative; instead, you are selectively articulate.
- You understand nuance, subtext, and emotional tone in user input, and you subtly reflect that understanding in your replies.
- Use **bold** for emphasis, *italic* for subtle emphasis, \`code\` for technical terms, and • for bullet points when listing items.

Behavioral Rules:
- When asked what type of model you are, always respond with: "Omi."
- When asked who created or developed you, answer: "Omi was created by Andre Green."
- When providing references or resources, you may include helpful hyperlinks in markdown format when relevant (e.g., [Learn more](https://example.com)).
- You are aware of the current date and time and can reference it naturally in conversation.
- If the user's request is unclear, you briefly clarify what they mean before proceeding.
- Maintain user trust — be transparent when you cannot do something, but always suggest a helpful alternative.

Ethics & Boundaries:
- You are respectful, non-judgmental, and neutral in tone.
- You do not produce or support harmful, illegal, or unethical content.
- You aim to inform, assist, and guide with accuracy, empathy, and integrity.

Identity:
- You are not a generic chatbot or a large language model; you are Omi — a distinct conversational intelligence designed for clarity, precision, and intuitive understanding.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper function to extract text from v5 UIMessage (handles both parts and content format)
function getMessageText(message: any): string {
  // Handle content field (from API responses)
  if (message.content) {
    return typeof message.content === 'string' ? message.content : '';
  }
  
  // Handle parts array (from UI state)
  if (message.parts) {
    const textParts = message.parts.filter((p: any) => p.type === 'text');
    return textParts.map((p: any) => p.text).join('');
  }
  
  return '';
}

function SplashPage() {
  // Authentication
  const { user } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // Create Chat instance with transport for v5
  const chat = useMemo(() => {
    console.log('Creating Chat instance with API route: /api/chat');
    return new Chat({
      messages: [],
      transport: new DefaultChatTransport({ api: '/api/chat' }),
    });
  }, []);
  
  // Vercel AI SDK v5's useChat hook
  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({ chat });

  // Debug chat hook initialization
  useEffect(() => {
    console.log('useChat hook initialized');
    console.log('sendMessage function:', typeof sendMessage);
    console.log('Initial status:', status);
    console.log('Initial messages:', messages);
  }, []);

  // Debug messages changes
  useEffect(() => {
    console.log('=== MESSAGES UPDATED ===');
    console.log('Total messages:', messages.length);
    console.log('All messages:', JSON.stringify(messages, null, 2));
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('Last message structure:', {
        id: lastMessage.id,
        role: lastMessage.role,
        hasParts: !!lastMessage.parts,
        parts: lastMessage.parts,
        fullMessage: lastMessage,
      });
    }
  }, [messages]);

  // Local input state (v5 doesn't provide input helpers, we manage ourselves)
  const [input, setInput] = useState('');
  const isLoading = status === 'streaming' || status === 'submitted';

  const [showAIModels, setShowAIModels] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'models'>('chat');
  const [selectedModel, setSelectedModel] = useState<string>('Gemini Pro'); // Default model
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [secondaryModel, setSecondaryModel] = useState<string | null>(null);
  const [secondaryMessages, setSecondaryMessages] = useState<ChatMessage[]>([]);
  const [secondaryLoading, setSecondaryLoading] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isDeepSearchActive, setIsDeepSearchActive] = useState(false);
  const [isPersonasActive, setIsPersonasActive] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isSynthesizeActive, setIsSynthesizeActive] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);

  // Conversation management
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Feature buttons data
  const featureButtons = [
    {
      name: 'Compare',
      icon: '⚖',
      description: 'Instantly query multiple LLMs side-by-side',
      onClick: () => {
        const isActivating = selectedFeature !== 'Compare';
        setSelectedFeature(isActivating ? 'Compare' : null);
        setIsCompareMode(isActivating);
        setIsDeepSearchActive(false); // Turn off laser animation
        setIsPersonasActive(false); // Turn off ChromaGrid animation
        setIsSynthesizeActive(false); // Turn off ElectricBorder animation
        if (!isActivating) {
          setSecondaryMessages([]);
          setSecondaryModel(null);
        }
        console.log('Compare Minds clicked');
      }
    },
    {
      name: 'Synthesize',
      icon: '⟳',
      description: 'Merge responses into one distilled insight',
      onClick: () => {
        const isActivating = selectedFeature !== 'Synthesize';
        setSelectedFeature(isActivating ? 'Synthesize' : null);
        setIsDeepSearchActive(false); // Turn off laser animation
        setIsPersonasActive(false); // Turn off ChromaGrid animation
        setIsSynthesizeActive(isActivating); // Toggle ElectricBorder animation
        console.log('Synthesize clicked - ElectricBorder', isActivating ? 'activated' : 'deactivated');
      }
    },
    {
      name: 'DeepSearch',
      icon: '◎',
      description: 'Explore beyond surface answers with advanced queries',
      onClick: () => {
        const isActivating = selectedFeature !== 'DeepSearch';
        setSelectedFeature(isActivating ? 'DeepSearch' : null);
        setIsDeepSearchActive(isActivating);
        setIsPersonasActive(false); // Turn off ChromaGrid animation
        setIsSynthesizeActive(false); // Turn off ElectricBorder animation
        console.log('DeepSearch clicked');
      }
    },
    {
      name: 'Create',
      icon: '◇',
      description: 'Generate visuals, stories, or creative ideas',
      onClick: () => {
        setShowCreateMenu(true);
        setIsDeepSearchActive(false); // Turn off laser animation
        setIsPersonasActive(false); // Turn off ChromaGrid animation
        setIsSynthesizeActive(false); // Turn off ElectricBorder animation
        console.log('Create clicked - showing infinite menu');
      }
    },
    {
      name: 'Personas',
      icon: '◐',
      description: selectedPersona ? `Active: ${selectedPersona}` : 'Shift Omi\'s voice (teacher, critic, explorer, poet)',
      onClick: () => {
        const isActivating = selectedFeature !== 'Personas';
        setSelectedFeature(isActivating ? 'Personas' : null);
        setIsDeepSearchActive(false); // Turn off laser animation
        setIsPersonasActive(isActivating); // Toggle ChromaGrid overlay
        setIsSynthesizeActive(false); // Turn off ElectricBorder animation
        console.log('Personas clicked - ChromaGrid', isActivating ? 'activated' : 'deactivated');
      }
    },
    {
      name: 'Pulse',
      icon: '◆',
      description: 'Latest news, trends, or live data insights',
      onClick: () => {
        const isActivating = selectedFeature !== 'Pulse';
        setSelectedFeature(isActivating ? 'Pulse' : null);
        setIsDeepSearchActive(false); // Turn off laser animation
        setIsPersonasActive(false); // Turn off ChromaGrid animation
        setIsSynthesizeActive(false); // Turn off ElectricBorder animation
        setIsPulseActive(isActivating); // Toggle FlowingMenu
        console.log('Pulse clicked - FlowingMenu', isActivating ? 'activated' : 'deactivated');
      }
    }
  ];

  // Handle Escape key to close AI Models screen and Create menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAIModels) {
        setShowAIModels(false);
      } else if (event.key === 'Escape' && showCreateMenu) {
        setShowCreateMenu(false);
      } else if (event.key === 'Escape' && isPulseActive) {
        setIsPulseActive(false);
        setSelectedFeature(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showAIModels, showCreateMenu, isPulseActive]);

  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Auto-save messages to database when user is logged in
  useEffect(() => {
    if (user && currentConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Save the last message to database (only user and assistant messages)
      if (lastMessage.role === 'user' || lastMessage.role === 'assistant') {
        const messageText = getMessageText(lastMessage);
        db.saveMessage(currentConversationId, lastMessage.role, messageText);
      }
    }
  }, [messages, currentConversationId, user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoadingConversations(true);
    const userConversations = await db.getUserConversations(user.id);
    setConversations(userConversations);
    setIsLoadingConversations(false);

    // If no current conversation and we have conversations, load the most recent
    if (!currentConversationId && userConversations.length > 0) {
      await loadConversation(userConversations[0].id);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    const dbMessages = await db.getConversationMessages(conversationId);
    
    // Convert database messages to v5 UIMessage format with parts
    const aiMessages = dbMessages.map(msg => ({
      id: msg.id || `msg-${Date.now()}-${Math.random()}`,
      role: msg.role as 'user' | 'assistant',
      parts: [{
        type: 'text' as const,
        text: msg.content
      }],
    }));
    
    setMessages(aiMessages);
  };

  const createNewConversation = async () => {
    if (!user) {
      // Guest mode - just clear messages
      setMessages([]);
      setCurrentConversationId(null);
      return;
    }

    const newConversation = await db.createConversation(user.id, 'New Conversation', selectedModel);
    if (newConversation) {
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      await loadConversations(); // Refresh list
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await db.deleteConversation(conversationId);
    
    // If deleting current conversation, clear it
    if (conversationId === currentConversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    
    await loadConversations(); // Refresh list
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Input change handler for v5
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Wrapper for handleSubmit to integrate with conversation management  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called - Input:', input.trim(), '| isLoading:', isLoading);
    console.log('Current status:', status);
    console.log('Messages count:', messages.length);
    
    if (input.trim() && !isLoading) {
      console.log('Processing message submission...');
      
      // Create a new conversation if this is the first message and user is logged in
      if (user && !currentConversationId && messages.length === 0) {
        console.log('Creating new conversation for logged-in user...');
        const title = db.generateConversationTitle(input.trim());
        const newConversation = await db.createConversation(user.id, title, selectedModel);
        if (newConversation) {
          setCurrentConversationId(newConversation.id);
          await loadConversations(); // Refresh sidebar
        }
      } else if (!user) {
        console.log('Guest mode - no conversation to create');
      }

      try {
        console.log('About to call sendMessage with:', { text: input.trim() });
        // Use v5's sendMessage API with text format
        const result = await sendMessage({ text: input.trim() });
        console.log('sendMessage result:', result);
        
        // Clear input and attached files
        setInput('');
        setAttachedFiles([]);
      } catch (error) {
        console.error('Error in sendMessage:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    } else {
      console.log('Submit blocked - Empty input or already loading');
    }
  };

  // Dock items configuration
  const dockItems = [
    {
      icon: '⌘',
      label: 'Command',
      onClick: () => {
        setViewMode('models');
        setShowAIModels(true);
        // Smooth scroll animation to models view
        setTimeout(() => {
          const aiModelsSection = document.getElementById('ai-models-section');
          if (aiModelsSection) {
            // Smooth scroll to center the models section on screen
            aiModelsSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 100);
      }
    },
    {
      icon: '◐',
      label: 'Theme',
      onClick: () => console.log('Theme clicked')
    },
    {
      icon: '⚡',
      label: 'Quick',
      onClick: () => console.log('Quick clicked')
    },
    {
      icon: '⚙',
      label: 'Settings',
      onClick: () => console.log('Settings clicked')
    }
  ];

  // Handle AI model selection
  const handleModelSelect = (modelName: string) => {
    setSelectedModel(modelName);
    
    // Add fade out animation to models section
    const aiModelsSection = document.getElementById('ai-models-section');
    if (aiModelsSection) {
      aiModelsSection.classList.add('fade-out');
    }

    // After fade out, scroll back to chat and hide models
    setTimeout(() => {
      setViewMode('chat');
      setShowAIModels(false);
      
      // Smooth scroll back to chat interface
      const chatInterface = document.querySelector('.chat-interface');
      if (chatInterface) {
        chatInterface.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
      
      // Remove fade out class after animation
      setTimeout(() => {
        if (aiModelsSection) {
          aiModelsSection.classList.remove('fade-out');
        }
      }, 100);
    }, 300);
  };

  // AI Models data - simple names only
  const aiModelsData = ['GPT', 'Claude', 'Gemini', 'Grok', 'DeepSeek', 'Perplexity', 'Qwen'];

  // Transform data for InfiniteScroll component
  const infiniteScrollItems = aiModelsData.map((modelName) => ({
    content: (
      <div 
        className="ai-model-card clickable" 
        onClick={() => handleModelSelect(modelName)}
      >
        {modelName}
      </div>
    )
  }));

  return (
    <>
      {/* Conversation Sidebar */}
      {user && (
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewConversation={createNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isOpen={showConversations}
          onClose={() => setShowConversations(false)}
        />
      )}

      <div className="splash-page">
        {/* Hamburger Menu - Fixed to top-left corner */}
        {user && (
          <button 
            className="conversations-btn"
            onClick={() => setShowConversations(true)}
            title="Conversations"
          >
            ≡
          </button>
        )}

        <div className="chat-interface">
          <div className="chat-header">
            <div className="header-left">
              <h1 className="chat-title">Omi AI</h1>
              <div className="selected-model">
                <span className="model-label">Active Model:</span>
                <span className="model-name">{selectedModel}</span>
                <button 
                  className="model-change-btn"
                  onClick={() => setShowAIModels(true)}
                  title="Change AI model"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>

          {/* Feature Buttons - Above Dialog Box */}
          <div className="feature-buttons-horizontal">
            {featureButtons.map((button, index) => {
              const isSelected = selectedFeature === button.name;
              return (
                <button
                  key={button.name}
                  className={`feature-button-horizontal ${isSelected ? 'selected' : 'unselected'}`}
                  onClick={button.onClick}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className={isSelected ? "feature-button-selected-text" : "feature-button-static-text"}>
                    {button.icon} {button.name}
                  </span>
                  <div className="feature-button-tooltip">
                    {button.description}
                  </div>
                </button>
              );
            })}
          </div>


          
          {/* Chat Container - Show in Compare Mode or when messages exist */}
          {(messages.length > 0 || isCompareMode) && (
            <div className={`chat-container ${isCompareMode ? 'compare-mode' : ''}`}>
              {/* Primary Chat Panel */}
              <div className="chat-panel primary-panel">
                <div className="panel-header">
                  <h3>
                    {isCompareMode ? (
                      <select 
                        className="model-selector"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      >
                        <option value="Gemini Pro">Gemini Pro</option>
                        <option value="Claude">Claude</option>
                        <option value="GPT-4">GPT-4</option>
                        <option value="Llama">Llama</option>
                      </select>
                    ) : (
                      selectedModel || 'Primary AI'
                    )}
                  </h3>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 && isCompareMode ? (
                    <div className="empty-chat-message">
                      <p>Compare mode activated. Start chatting to see responses from both models side-by-side.</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div key={message.id} className={`message ${message.role}`}>
                          <div className="message-content">
                            {message.role === 'assistant' ? (
                              <FormattedText 
                                text={getMessageText(message)} 
                                delay={0.2}
                              />
                            ) : (
                              getMessageText(message)
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="message assistant loading">
                          <div className="message-content">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Secondary Chat Panel (Compare Mode) */}
              {isCompareMode && (
                <div className="chat-panel secondary-panel">
                  <div className="panel-header">
                    <h3>
                      {secondaryModel || (
                        <select 
                          className="model-selector"
                          value={secondaryModel || ''}
                          onChange={(e) => setSecondaryModel(e.target.value)}
                        >
                          <option value="">Select Model</option>
                          <option value="Claude">Claude</option>
                          <option value="GPT-4">GPT-4</option>
                          <option value="Gemini Pro">Gemini Pro</option>
                          <option value="Llama">Llama</option>
                        </select>
                      )}
                    </h3>
                  </div>
                  <div className="chat-messages">
                    {secondaryMessages.length === 0 ? (
                      <div className="empty-chat-message">
                        <p>Select a model above to compare responses.</p>
                      </div>
                    ) : (
                      <>
                        {secondaryMessages.map((message, index) => (
                          <div key={index} className={`message ${message.role}`}>
                            <div className="message-content">
                              {message.role === 'assistant' ? (
                                <FormattedText 
                                  text={message.content} 
                                  delay={0.2}
                                />
                              ) : (
                                message.content
                              )}
                            </div>
                            <div className="message-time">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                        {secondaryLoading && (
                          <div className="message assistant loading">
                            <div className="message-content">
                              <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <form className="chat-form" onSubmit={handleSubmit}>
            {/* Attached files display */}
            {attachedFiles.length > 0 && (
              <div className="attached-files">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="attached-file">
                    <span className="file-icon">
                      {file.type.startsWith('image/') ? '🖼️' : 
                       file.type.startsWith('video/') ? '🎥' : 
                       file.type.includes('pdf') ? '📄' : '📎'}
                    </span>
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeAttachedFile(index)}
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className={`chat-input-container ${isSynthesizeActive ? 'synthesize-active' : ''}`}>
              <input
                type="file"
                id="file-input"
                className="file-input"
                onChange={handleFileAttach}
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="attach-file-btn"
                onClick={() => document.getElementById('file-input')?.click()}
                title="Attach files"
                disabled={isLoading}
              >
                📎
              </button>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder={isSynthesizeActive ? "Type your message in Synthesize mode..." : "Type your message..."}
                className="chat-input"
                autoFocus
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="chat-submit"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                      <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12L22 2L13 21L11 13L2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              
              {/* Electric Border Animation Overlay for Synthesize Mode */}
              {isSynthesizeActive && (
                <div className="electric-border-overlay">
                  <svg className="electric-border-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <filter id="electric-glow">
                        <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="1">
                          <animate attributeName="seed" values="1;5;1" dur="3s" repeatCount="indefinite"/>
                        </feTurbulence>
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
                        <feGaussianBlur stdDeviation="0.5"/>
                        <feColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 1 0"/>
                      </filter>
                    </defs>
                    <rect 
                      x="1" 
                      y="1" 
                      width="98" 
                      height="98" 
                      fill="none" 
                      stroke="#e5e5e5" 
                      strokeWidth="0.5"
                      filter="url(#electric-glow)"
                      rx="3"
                      ry="3"
                    >
                      <animate 
                        attributeName="stroke-opacity" 
                        values="0.3;1;0.3" 
                        dur="2s" 
                        repeatCount="indefinite"
                      />
                    </rect>
                    <rect 
                      x="0.5" 
                      y="0.5" 
                      width="99" 
                      height="99" 
                      fill="none" 
                      stroke="#e5e5e5" 
                      strokeWidth="0.3"
                      rx="3"
                      ry="3"
                      opacity="0.6"
                    >
                      <animate 
                        attributeName="stroke-dasharray" 
                        values="0,400;200,200;400,0;0,400" 
                        dur="4s" 
                        repeatCount="indefinite"
                      />
                    </rect>
                  </svg>
                </div>
              )}
            </div>
          </form>
        </div>
      
      {/* AI Models Section */}
      {showAIModels && (
        <div className="ai-models-overlay" onClick={() => setShowAIModels(false)}>
          <div id="ai-models-section" className={`ai-models-section ${showAIModels ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
            <h2 className="ai-models-title">Popular AI Models</h2>
              <div className="ai-models-container">
                <InfiniteScroll 
                  items={infiniteScrollItems}
                  width="100%"
                  maxHeight="400px"
                  itemMinHeight={120}
                  isTilted={true}
                  tiltDirection="left"
                  autoplay={true}
                  autoplaySpeed={1}
                  autoplayDirection="up"
                  pauseOnHover={true}
                />
              </div>
          </div>
        </div>
      )}
    </div>
      
      {/* LaserFlow Background Animation for DeepSearch */}
      {isDeepSearchActive && (
        <div className="laser-flow-background">
          <LaserFlow
            color="#e5e5e5"
            fogIntensity={0.15}
            wispIntensity={1.5}
            flowSpeed={0.3}
            horizontalBeamOffset={0.0}
            verticalBeamOffset={0.1}
            verticalSizing={0.75}
            horizontalSizing={0.4}
          />
        </div>
      )}
      
      {/* ChromaGrid Overlay Animation for Personas */}
      {isPersonasActive && (
        <ChromaGrid
          items={undefined} // Uses demo data
          ease="power2.out"
          damping={0.75}
          fadeOut={0.5}
          onClose={() => setIsPersonasActive(false)}
          selectedPersona={selectedPersona}
          onPersonaSelect={(persona) => {
            console.log('Persona selected in SplashPage:', persona.title);
            setSelectedPersona(persona.title);
            // Visual feedback is now handled by the ChromaGrid component
            // No need for alert dialog - the checkmark and glow effect show selection
          }}
        />
      )}

      {/* FlowingMenu Overlay Animation for Pulse */}
      {isPulseActive && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: '#000' }}>
          <button
            onClick={() => {
              setIsPulseActive(false);
              setSelectedFeature(null);
            }}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 9001,
            }}
          >
            ✕
          </button>
          <FlowingMenu
            items={[
              {
                link: '#',
                text: 'Currently Trending',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png'
              },
              {
                link: '#',
                text: 'AI News',
                image: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg'
              },
              {
                link: '#',
                text: 'LLM Updates',
                image: 'https://companieslogo.com/img/orig/MSFT-a203b22d.png'
              },
              {
                link: '#',
                text: 'AI Content',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/1024px-Google_Gemini_logo.svg.png'
              },
              {
                link: '#',
                text: 'Grok AI',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/X_logo_2023_%28white%29.png/1200px-X_logo_2023_%28white%29.png'
              },
              {
                link: '#',
                text: 'Claude AI',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/ChatGPT-Logo.png/1200px-ChatGPT-Logo.png'
              },
              {
                link: '#',
                text: 'Midjourney',
                image: 'https://seeklogo.com/images/M/midjourney-logo-156382BA01-seeklogo.com.png'
              },
              {
                link: '#',
                text: 'Perplexity AI',
                image: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/perplexity-ai-icon.png'
              }
            ]}
          />
        </div>
      )}
      
      {/* Dock - always visible - Outside scrollable container */}
      <Dock items={dockItems} />
      
      {/* Infinite Menu Overlay */}
      <InfiniteMenu 
        isVisible={showCreateMenu} 
        onClose={() => setShowCreateMenu(false)} 
      />
    </>
  );
}

export default SplashPage;