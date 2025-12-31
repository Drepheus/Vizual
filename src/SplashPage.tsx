"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import FormattedText from './FormattedText';
import Dock from './Dock';
import InfiniteScroll from './InfiniteScroll';
import InfiniteMenu from './InfiniteMenu';
import VizualLoadingAnimation from './VizualLoadingAnimation';
import ChromaGrid from './ChromaGrid';
import CircularGallery from './CircularGallery';
import ConversationSidebar from './ConversationSidebar';
import NewsTicker from './NewsTicker';
import MediaGallery from './MediaGallery';
import SearchModal from './SearchModal';
import ImagePreviewTooltip from './ImagePreviewTooltip';
import VideoPreviewTooltip from './VideoPreviewTooltip';
import { useAuth } from '@/context/auth-context';
import { supabase } from './supabaseClient';
import * as db from './databaseService';
import type { DbConversation } from './databaseService';
import PaywallModal from './PaywallModal';
import SettingsModal from './SettingsModal';
import { checkUsageLimit, incrementUsage, UsageType } from './usageTracking';
import { saveGeneratedMedia } from './mediaService';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper function to extract text from v5 UIMessage (handles both parts and content format)
function getMessageText(message: Message): string {
  return message.content || '';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const personaColors: Record<string, string> = {
  'The Teacher': '#4F46E5',
  'The Critic': '#EF4444',
  'The Explorer': '#F59E0B',
  'The Poet': '#8B5CF6',
  'The Scientist': '#10B981',
  'The Friend': '#06B6D4'
};

function SplashPage() {
  // Authentication
  const { user } = useAuth();
  const router = useRouter();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Chat state management (replacing AI SDK)
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showAIModels, setShowAIModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('Gemini Pro'); // Default model
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [secondaryModel, setSecondaryModel] = useState<string | null>(null);
  const [secondaryMessages, setSecondaryMessages] = useState<ChatMessage[]>([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isPersonasActive, setIsPersonasActive] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isSynthesizeActive, setIsSynthesizeActive] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [isInstantGenActive, setIsInstantGenActive] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoGenActive, setIsVideoGenActive] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isHoveringImageGen, setIsHoveringImageGen] = useState(false);
  const [isHoveringVideoGen, setIsHoveringVideoGen] = useState(false);
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);

  // Paywall and subscription management
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallLimitType, setPaywallLimitType] = useState<'chat' | 'image' | 'video'>('chat');
  const [paywallUsage, setPaywallUsage] = useState<{ current: number; limit: number; resetAt: string | null }>({
    current: 0,
    limit: 15,
    resetAt: null
  });

  // Conversation management
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [showConversations, setShowConversations] = useState(false);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Media Gallery
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  // Search Modal
  const [showSearch, setShowSearch] = useState(false);

  // Mobile Mode Menu State
  const [showMobileModeMenu, setShowMobileModeMenu] = useState(false);
  
  // Mobile Header Menu State
  const [showMobileHeaderMenu, setShowMobileHeaderMenu] = useState(false);

  // Music Player State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch music playlist
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await fetch('/api/music');
        const data = await response.json();
        if (data.files && data.files.length > 0) {
          setPlaylist(data.files);
        }
      } catch (error) {
        console.error('Failed to fetch music:', error);
      }
    };
    fetchMusic();
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      // If no track is set but we have a playlist, set the first one
      if ((!audioRef.current.src || audioRef.current.src === window.location.href) && playlist.length > 0) {
        audioRef.current.src = `/music/${playlist[currentTrackIndex]}`;
      }
      
      if (playlist.length > 0) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        setIsMusicPlaying(true);
      } else {
        alert("No music files found in public/music folder. Please add .mp3 files to the public/music directory.");
      }
    }
  };

  const handleTrackEnded = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % playlist.length;
      setCurrentTrackIndex(nextIndex);
      if (audioRef.current) {
        audioRef.current.src = `/music/${playlist[nextIndex]}`;
        audioRef.current.play();
      }
    }
  };

  // Debug log for gallery state
  useEffect(() => {
    console.log('🎨 Media Gallery State:', showMediaGallery);
  }, [showMediaGallery]);

  // Subscription tier
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');

  // Feature buttons data
  const featureButtons = [
    {
      name: 'Focus',
      icon: '⊙',
      description: 'Enter distraction-free fullscreen mode',
      onClick: () => {
        setIsFullscreen(true);
        // Disable all other modes
        setIsPersonasActive(false);
        setIsSynthesizeActive(false);
        setIsPulseActive(false);
        setIsInstantGenActive(false);
        setIsVideoGenActive(false);
        setIsCompareMode(false);
        setSelectedFeature(null);
        console.log('Focus mode activated');
      }
    },
    {
      name: 'Personas',
      icon: '◐',
      description: selectedPersona ? `Active: ${selectedPersona}` : 'Shift Vizual\'s voice (teacher, critic, explorer, poet)',
      onClick: () => {
        // If already active, disable it and return to default chat
        if (selectedFeature === 'Personas') {
          setSelectedFeature(null);
          setIsPersonasActive(false);
          console.log('Personas deactivated - Returning to default chat');
          return;
        }

        // Activate Personas
        setSelectedFeature('Personas');
        setIsPersonasActive(true);
        
        // Disable all other modes
        setIsSynthesizeActive(false);
        setIsPulseActive(false);
        setIsInstantGenActive(false);
        setIsVideoGenActive(false);
        setIsCompareMode(false);
        
        console.log('Personas clicked - ChromaGrid activated');
      }
    },
    {
      name: 'Image Gen',
      icon: '🖼️',
      description: isInstantGenActive ? 'Image generation active - type a prompt!' : 'Real-time AI image generation',
      onClick: () => {
        // If already active, disable it and return to default chat
        if (selectedFeature === 'Image Gen') {
          setSelectedFeature(null);
          setIsInstantGenActive(false);
          setGeneratedImage(null);
          console.log('Image Gen deactivated - Returning to default chat');
          return;
        }

        setSelectedFeature('Image Gen');
        setIsInstantGenActive(true);
        
        // Disable all other modes
        setIsPersonasActive(false);
        setIsSynthesizeActive(false);
        setIsPulseActive(false);
        setIsVideoGenActive(false);
        setIsCompareMode(false);
          
        // Setup for Image Gen
        setMessages([]); // Clear chat messages
        setIsChatHidden(false); // Ensure chat is open
        setInput(''); // Clear input
        
        console.log('Image Gen mode activated');
      }
    },
    {
      name: 'Compare',
      icon: '⚖',
      description: 'Instantly query multiple LLMs side-by-side',
      onClick: () => {
        // If already active, disable it and return to default chat
        if (selectedFeature === 'Compare') {
          setSelectedFeature(null);
          setIsCompareMode(false);
          setSecondaryMessages([]);
          setSecondaryModel(null);
          console.log('Compare deactivated - Returning to default chat');
          return;
        }

        setSelectedFeature('Compare');
        setIsCompareMode(true);
        
        // Disable all other modes
        setIsPersonasActive(false);
        setIsSynthesizeActive(false);
        setIsPulseActive(false);
        setIsInstantGenActive(false);
        setIsVideoGenActive(false);
        
        console.log('Compare Minds clicked');
      }
    },
    {
      name: 'Video Gen',
      icon: '🎬',
      description: 'Generate AI videos from text prompts',
      onClick: () => {
        // If already active, disable it and return to default chat
        if (selectedFeature === 'Video Gen') {
          setSelectedFeature(null);
          setIsVideoGenActive(false);
          setGeneratedVideo(null);
          console.log('Video Gen deactivated - Returning to default chat');
          return;
        }

        setSelectedFeature('Video Gen');
        setIsVideoGenActive(true);
        
        // Disable all other modes
        setIsPersonasActive(false);
        setIsSynthesizeActive(false);
        setIsPulseActive(false);
        setIsInstantGenActive(false);
        setIsCompareMode(false);
          
        // Setup for Video Gen
        setMessages([]); // Clear chat messages
        setIsChatHidden(false); // Ensure chat is open
        setInput(''); // Clear input
        
        console.log('Video Gen mode activated');
      }
    }
  ];

  // Helper function to check usage and show paywall if needed
  const checkAndShowPaywall = async (usageType: UsageType): Prvizualse<boolean> => {
    if (!user) return true; // Allow guests to use without limits for now

    try {
      const result = await checkUsageLimit(user.id, usageType);

      if (!result.canPerform) {
        setPaywallLimitType(usageType === 'chat' ? 'chat' : usageType === 'image_gen' ? 'image' : 'video');
        setPaywallUsage({
          current: result.currentUsage,
          limit: result.usageLimit,
          resetAt: result.resetAt
        });
        setShowPaywall(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return true; // Allow on error to not block user
    }
  };

  // Handle Escape key to close AI Models screen, Create menu, and fullscreen
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (event.key === 'Escape' && showAIModels) {
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
  }, [isFullscreen, showAIModels, showCreateMenu, isPulseActive]);

  // Load conversations when user logs in (and restore last active session)
  useEffect(() => {
    if (user) {
      // Check for last active conversation
      const lastActiveId = localStorage.getItem('lastActiveConversationId');
      
      if (lastActiveId) {
        console.log('Restoring last active conversation:', lastActiveId);
        loadConversation(lastActiveId);
      } else {
        // Start fresh if no history
        setMessages([]);
        setCurrentConversationId(null);
      }
      
      // Just load the list
      loadConversationsOnly();
      // Fetch subscription tier
      fetchSubscriptionTier();
    }
  }, [user]);

  // Fetch subscription tier
  const fetchSubscriptionTier = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setSubscriptionTier(data?.subscription_tier || 'free');
    } catch (error) {
      console.error('Error fetching subscription tier:', error);
      setSubscriptionTier('free');
    }
  };

  // Auto-save messages to database when user is logged in
  useEffect(() => {
    if (user && currentConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Only save if it's a temporary ID (starts with user- or assistant-)
      // This prevents re-saving messages loaded from the database (which have UUIDs)
      const isTempId = typeof lastMessage.id === 'string' && 
                      (lastMessage.id.startsWith('user-') || lastMessage.id.startsWith('assistant-'));

      if (isTempId && (lastMessage.role === 'user' || lastMessage.role === 'assistant')) {
        const messageText = getMessageText(lastMessage);
        db.saveMessage(currentConversationId, lastMessage.role, messageText);
      }
    }
  }, [messages, currentConversationId, user]);

  // Load just the list of conversations (don't auto-load messages)
  const loadConversationsOnly = async () => {
    if (!user) return;

    const userConversations = await db.getUserConversations(user.id);
    setConversations(userConversations);
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    localStorage.setItem('lastActiveConversationId', conversationId); // Persist state
    const dbMessages = await db.getConversationMessages(conversationId);

    // Convert database messages to simple Message format
    const aiMessages: Message[] = dbMessages.map(msg => ({
      id: msg.id || `msg-${Date.now()}-${Math.random()}`,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Deduplicate messages to fix visual bug from previous double-saving
    // We filter out messages that have the same content and role as an earlier message
    const uniqueMessages = aiMessages.filter((msg, index, self) => 
      index === self.findIndex((t) => (
        t.content === msg.content && t.role === msg.role
      ))
    );

    setMessages(uniqueMessages);
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
      localStorage.setItem('lastActiveConversationId', newConversation.id); // Persist state
      setMessages([]);
      await loadConversationsOnly(); // Refresh list only
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await db.deleteConversation(conversationId);

    // If deleting current conversation, clear it
    if (conversationId === currentConversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }

    await loadConversationsOnly(); // Refresh list only
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

  const sendChatMessage = async (text: string, historyOverride?: Message[]) => {
    if (!text.trim() || isLoading) return;

    // Create a new conversation if this is the first message and user is logged in
    if (user && !currentConversationId && messages.length === 0) {
      console.log('Creating new conversation for logged-in user...');
      const title = db.generateConversationTitle(text.trim());
      const newConversation = await db.createConversation(user.id, title, selectedModel);
      if (newConversation) {
        setCurrentConversationId(newConversation.id);
        localStorage.setItem('lastActiveConversationId', newConversation.id); // Persist state
        await loadConversationsOnly(); // Refresh sidebar list only
      }
    } else if (!user) {
      console.log('Guest mode - no conversation to create');
    }

    try {
      setIsLoading(true);
      console.log('Sending message:', { text: text.trim() });

      // Add user message to UI immediately ONLY if we are not overriding history (which implies a regeneration)
      // If historyOverride is present, it means we've already set the state to the truncated history, 
      // and the 'text' passed here is the user message that was already in history or a modified version.
      // Actually, for regeneration, we want to send the request but NOT duplicate the user message in the UI if it's already there.
      
      let currentMessages = historyOverride || messages;
      
      // If this is a normal send (no override), add the user message to state
      if (!historyOverride) {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: text.trim(),
        };
        setMessages(prev => [...prev, userMessage]);
        currentMessages = [...messages, userMessage];
      }

      setAttachedFiles([]);

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          model: selectedModel // Pass the selected model
        }),
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      console.log('API response:', data);

      // Add assistant message to UI
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

    } catch (error) {
      console.error('Error in sendMessage:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      setIsLoading(false);
    }
  };

  const handleMessageAction = (action: 'elaborate' | 'reply' | 'redo', message: Message, index: number) => {
    if (action === 'reply') {
      setInput(message.content);
      // Focus the input field
      const inputElement = document.querySelector('.chat-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
      return;
    }

    // For Elaborate and Redo, we need to regenerate the response
    // We find the user message that triggered this assistant response
    // The assistant message is at 'index'. The user message should be at 'index - 1'.
    
    if (index > 0) {
      const userMessageIndex = index - 1;
      const userMessage = messages[userMessageIndex];
      
      // Truncate history to remove the assistant message and anything after it
      // We keep messages up to the user message (inclusive)
      const truncatedHistory = messages.slice(0, index);
      
      // Update UI to remove the old response
      setMessages(truncatedHistory);
      
      // Prepare the prompt for the API
      // We use the original user message content, but we can append a system instruction to the API call
      // to guide the regeneration without showing it in the UI.
      // Since our API takes the full message history, we can modify the last message in the payload.
      
      const payloadMessages = [...truncatedHistory];
      const lastMsg = payloadMessages[payloadMessages.length - 1];
      
      // Create a copy of the last message to modify it for the API call only
      const modifiedLastMsg = { ...lastMsg };
      
      if (action === 'elaborate') {
        modifiedLastMsg.content += "\n\n[System Instruction: Please regenerate your response, but this time provide much more detail and elaboration.]";
      } else if (action === 'redo') {
        modifiedLastMsg.content += "\n\n[System Instruction: Please regenerate your response, but this time use a different style or format.]";
      }
      
      // Replace the last message in the payload with the modified one
      payloadMessages[payloadMessages.length - 1] = modifiedLastMsg;
      
      // Call sendChatMessage with the modified history payload
      // We pass the original text just for logging/logic, but the payload is what matters
      sendChatMessage(userMessage.content, payloadMessages);
    }
  };

  // Wrapper for handleSubmit to integrate with conversation management  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called - Input:', input.trim(), '| isLoading:', isLoading);
    console.log('Messages count:', messages.length);

    if (input.trim() && !isLoading && !isGeneratingImage && !isGeneratingVideo) {
      // If Video Gen mode is active, generate a video instead of sending a chat message
      if (isVideoGenActive) {
        // Check usage limit before proceeding
        const canProceed = await checkAndShowPaywall('video_gen');
        if (!canProceed) return;

        console.log('Generating video with prompt:', input.trim());
        setIsGeneratingVideo(true);
        setGeneratedVideo(null);

        try {
          const response = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input.trim() }),
          });

          const data = await response.json();

          if (response.ok && data.videoUrl) {
            console.log('Video generated successfully:', data.videoUrl);
            setGeneratedVideo(data.videoUrl);

            // Save generated video to database
            if (user) {
              try {
                await saveGeneratedMedia(user.id, 'video', data.videoUrl, input.trim());
                console.log('Video saved to gallery');
              } catch (saveError) {
                console.error('Failed to save video to gallery:', saveError);
              }
            }

            // Increment usage after successful generation
            if (user) {
              await incrementUsage(user.id, 'video_gen');
            }

            // Scroll to video after a short delay to allow render
            setTimeout(() => {
              videoContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          } else {
            console.error('Video generation failed:', data.error);
            alert('Failed to generate video: ' + (data.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Error generating video:', error);
          alert('Failed to generate video. Please try again.');
        } finally {
          setIsGeneratingVideo(false);
          setInput(''); // Clear input after generation
        }
        return;
      }

      // If Instant Gen mode is active, generate an image instead of sending a chat message
      if (isInstantGenActive) {
        // Check usage limit before proceeding
        const canProceed = await checkAndShowPaywall('image_gen');
        if (!canProceed) return;

        console.log('Generating image with prompt:', input.trim());
        setIsGeneratingImage(true);
        setGeneratedImage(null);

        try {
          const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input.trim(), aspectRatio: '3:2' }),
          });

          const data = await response.json();

          if (response.ok && data.imageUrl) {
            console.log('Image generated successfully:', data.imageUrl);
            setGeneratedImage(data.imageUrl);

            // Save generated image to database
            if (user) {
              try {
                await saveGeneratedMedia(user.id, 'image', data.imageUrl, input.trim());
                console.log('Image saved to gallery');
              } catch (saveError) {
                console.error('Failed to save image to gallery:', saveError);
              }
            }

            // Increment usage after successful generation
            if (user) {
              await incrementUsage(user.id, 'image_gen');
            }

            // Scroll to image after a short delay to allow render
            setTimeout(() => {
              imageContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          } else {
            console.error('Image generation failed:', data.error);
            alert('Failed to generate image: ' + (data.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Error generating image:', error);
          alert('Failed to generate image. Please try again.');
        } finally {
          setIsGeneratingImage(false);
          setInput(''); // Clear input after generation
        }
        return;
      }

      console.log('Processing message submission...');
      console.log('=== CURRENT STATE CHECK ===');
      console.log('isVideoGenActive:', isVideoGenActive);
      console.log('isInstantGenActive:', isInstantGenActive);
      console.log('selectedFeature:', selectedFeature);

      // NO USAGE LIMIT FOR CHAT - unlimited messages for all users

      const textToSend = input;
      setInput(''); // Clear input immediately
      await sendChatMessage(textToSend);

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
        router.push('/command-hub');
      }
    },
    {
      icon: '⊞',
      label: 'Gallery',
      onClick: () => {
        console.log('Gallery button clicked!');
        setShowMediaGallery(true);
      }
    },
    {
      icon: '◈',
      label: 'Search',
      onClick: () => {
        console.log('Search button clicked!');
        setShowSearch(true);
      }
    },
    {
      icon: '⚙',
      label: 'AI News',
      onClick: () => {
        console.log('Settings clicked - activating Pulse mode');
        setIsPulseActive(!isPulseActive); // Toggle FlowingMenu
        setIsPersonasActive(false); // Turn off other animations
        setIsSynthesizeActive(false);
      }
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

  // AI Models data
  const aiModelsData = ['Gemini', 'OpenAI', 'Groq'];

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
        {user && !isFullscreen && (
          <button
            className="conversations-btn"
            onClick={() => setShowConversations(true)}
            title="Conversations"
          >
            ≡
          </button>
        )}

        {/* Top Right Action Buttons - Fixed to top-right corner */}
        {!isFullscreen && (
          <div className={`top-right-actions ${showMobileHeaderMenu ? 'mobile-expanded' : ''}`}>
            
            {/* Mobile Toggle Button */}
            <button 
              className="mobile-header-toggle"
              onClick={() => setShowMobileHeaderMenu(!showMobileHeaderMenu)}
            >
              <span className="header-btn-icon">⋮</span>
            </button>

            <div className="header-buttons-group">
              {/* New Conversation Button - FIRST */}
              <button
                className="header-action-btn new-conversation-btn"
                onClick={createNewConversation}
                title="Start new conversation"
              >
                <span className="header-btn-icon">＋</span>
              </button>

              {/* Music Player Button */}
              <button
                className="header-action-btn music-btn"
                onClick={toggleMusic}
                title={isMusicPlaying ? "Pause Music" : "Play Music"}
              >
                <span className="header-btn-icon">
                  {isMusicPlaying ? "🔊" : "🔇"}
                </span>
              </button>
              
              {/* Hidden Audio Element */}
              <audio 
                ref={audioRef} 
                onEnded={handleTrackEnded}
                style={{ display: 'none' }} 
              />

              {/* Upgrade Button (for free users) - No badge in header */}
              {user && subscriptionTier === 'free' && (
                <button
                  className="header-action-btn upgrade-btn"
                  onClick={() => setShowPaywall(true)}
                  title="Upgrade to Pro"
                >
                  <span className="header-btn-icon">◈</span>
                  <span className="header-btn-text">Upgrade</span>
                </button>
              )}

              {/* Account Tier Indicator (for pro users only) */}
              {user && subscriptionTier === 'pro' && (
                <div className="account-tier-badge pro-badge">
                  <span className="tier-icon">◆</span>
                  <span className="tier-text">Pro Account</span>
                </div>
              )}

              {/* Account Button */}
              {user ? (
                <button
                  className="header-action-btn account-btn"
                  onClick={() => setShowSettings(true)}
                  title="Account settings"
                >
                  <span className="header-btn-icon">◉</span>
                </button>
              ) : (
                <button
                  className="header-action-btn guest-mode-btn"
                  onClick={() => window.location.href = '/login'}
                  title="Sign in to save your conversations"
                >
                  <span className="header-btn-icon">👤</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Free Account Badge - Bottom Left Corner */}
        {user && subscriptionTier === 'free' && !isFullscreen && (
          <div className="account-tier-badge-fixed">
            <span className="tier-icon">◎</span>
            <span className="tier-text">Free Account</span>
          </div>
        )}

        <div className="chat-interface">
          <div className="chat-header">
            <div className="header-left">
              <h1 className="chat-title">Vizual AI</h1>
              <div 
                className="selected-model"
                onClick={() => setShowAIModels(true)}
                title="Change AI model"
              >
                <span className="model-label">Active Model:</span>
                <span className="model-name">{selectedModel}</span>
                <span className="model-change-icon">⚙️</span>
              </div>
            </div>
          </div>

          {/* Mobile Mode Selector - Dropdown for mobile only */}
          <div className="mobile-mode-selector-container">
            <button 
              className={`mobile-mode-trigger ${selectedFeature ? 'active' : ''}`}
              onClick={() => setShowMobileModeMenu(!showMobileModeMenu)}
            >
              <span className="current-mode-text">
                {selectedFeature ? (
                  <>
                    <span className="mode-icon">{featureButtons.find(b => b.name === selectedFeature)?.icon}</span>
                    {selectedFeature}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <rect x="3" y="3" width="7" height="7" />
                      <circle cx="17.5" cy="6.5" r="3.5" />
                      <rect x="3" y="14" width="7" height="7" rx="2" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Select Mode
                  </>
                )}
              </span>
              <span className="dropdown-arrow">{showMobileModeMenu ? '▲' : '▼'}</span>
            </button>

            {showMobileModeMenu && (
              <div className="mobile-mode-dropdown">
                {featureButtons.map((button) => {
                  const isSelected = selectedFeature === button.name;
                  const isPro = button.name === 'Compare' || button.name === 'Video Gen';
                  
                  return (
                    <button
                      key={button.name}
                      className={`mobile-mode-option ${isSelected ? 'selected' : ''} ${isPro ? 'pro' : ''}`}
                      onClick={() => {
                        button.onClick();
                        setShowMobileModeMenu(false);
                      }}
                    >
                      <div className="option-left">
                        <span className="option-icon">{button.icon}</span>
                        <div className="option-details">
                          <span className="option-name">{button.name}</span>
                          <span className="option-desc">{button.description}</span>
                        </div>
                      </div>
                      {isPro && <span className="pro-badge-mobile">PRO</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feature Buttons - Above Dialog Box */}
          <div className="feature-buttons-horizontal">
            {featureButtons.map((button, index) => {
              const isSelected = selectedFeature === button.name;
              const isImageGenButton = button.name === 'Image Gen';
              const isVideoGenButton = button.name === 'Video Gen';
              const isCompareButton = button.name === 'Compare';
              const isPro = isCompareButton || isVideoGenButton;
              
              // Persona styling logic
              const isPersonaButton = button.name === 'Personas';
              const personaColor = isPersonaButton && selectedPersona ? personaColors[selectedPersona] : undefined;

              return (
                <button
                  key={button.name}
                  className={`feature-button-horizontal ${isSelected ? 'selected' : 'unselected'} ${isPro ? 'pro' : ''}`}
                  onClick={button.onClick}
                  onMouseEnter={() => {
                    if (isImageGenButton) setIsHoveringImageGen(true);
                    if (isVideoGenButton) setIsHoveringVideoGen(true);
                  }}
                  onMouseLeave={() => {
                    if (isImageGenButton) setIsHoveringImageGen(false);
                    if (isVideoGenButton) setIsHoveringVideoGen(false);
                  }}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    ...(personaColor ? { 
                      borderColor: personaColor,
                      boxShadow: `0 0 15px ${personaColor}40, inset 0 0 10px ${personaColor}20`,
                      background: `linear-gradient(135deg, ${personaColor}20 0%, rgba(255,255,255,0.05) 100%)`
                    } : {})
                  }}
                >
                  <span className={isSelected ? "feature-button-selected-text" : "feature-button-static-text"}
                    style={personaColor ? { color: personaColor, textShadow: `0 0 10px ${personaColor}60` } : {}}
                  >
                    {button.icon} {button.name}
                    {isPro && <span className="pro-badge-inline">PRO</span>}
                  </span>
                  {isImageGenButton ? (
                    <ImagePreviewTooltip isVisible={isHoveringImageGen} />
                  ) : isVideoGenButton ? (
                    <VideoPreviewTooltip isVisible={isHoveringVideoGen} />
                  ) : (
                    <div className="feature-button-tooltip">
                      {button.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>



          {/* Chat Wrapper - Handles Fullscreen Mode */}
          <div className={`chat-wrapper ${isFullscreen ? 'fullscreen' : ''} ${isChatHidden ? 'hidden' : ''}`}>
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
                    <div className="panel-controls">
                      {!isInstantGenActive && !isVideoGenActive && (
                        <button
                          className="panel-control-btn hide-chat-btn"
                          onClick={() => setIsChatHidden(true)}
                          title="Hide Chat"
                        >
                          ─
                        </button>
                      )}
                      <button
                        className="panel-control-btn fullscreen-toggle"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen"}
                      >
                        {isFullscreen ? '⤓' : '⤢'}
                      </button>
                    </div>
                  </div>
                  <div className="chat-messages">
                    {messages.length === 0 && isCompareMode ? (
                      <div className="empty-chat-message">
                        <p>Compare mode activated. Start chatting to see responses from both models side-by-side.</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((message, index) => (
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
                            {message.role === 'assistant' && (
                              <div className="message-actions">
                                <button className="msg-action-btn" onClick={() => handleMessageAction('elaborate', message, index)} title="Ask for more details">Elaborate</button>
                                <button className="msg-action-btn" onClick={() => handleMessageAction('reply', message, index)} title="Draft a reply">Reply</button>
                                <button className="msg-action-btn" onClick={() => handleMessageAction('redo', message, index)} title="Regenerate response">Redo</button>
                              </div>
                            )}
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
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isInstantGenActive && !isVideoGenActive && (
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
                  <button
                    type="button"
                    className={`voice-mode-btn ${isVoiceModeActive ? 'active' : ''}`}
                    onClick={() => setIsVoiceModeActive(!isVoiceModeActive)}
                    title={isVoiceModeActive ? "Disable Voice Mode" : "Enable Voice Mode"}
                    disabled={isLoading}
                  >
                    <div className="sound-wave-icon">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={
                      isSynthesizeActive
                        ? "Type your message in Synthesize mode..."
                        : "Type your message..."
                    }
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
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                          <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12L22 2L13 21L11 13L2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                              <animate attributeName="seed" values="1;5;1" dur="3s" repeatCount="indefinite" />
                            </feTurbulence>
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                            <feGaussianBlur stdDeviation="0.5" />
                            <feColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 1 0" />
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
            )}
          </div>

          {/* Generated Image Display */}
          {isInstantGenActive && (
            <div className="generated-image-container" ref={imageContainerRef}>
              {isGeneratingImage ? (
                <div className="generating-indicator">
                  <div className="generating-spinner">
                    <div className="metallic-paint-loader">
                      <VizualLoadingAnimation />
                    </div>
                  </div>
                  <p className="generating-text">Generating your image...</p>
                </div>
              ) : generatedImage ? (
                <div className="generated-image-wrapper">
                  <div className="generated-image-header">
                    <h3>⚡ Generated Image</h3>
                    <div className="generated-image-actions">
                      <a
                        href="https://percify.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="image-action-btn percify-btn"
                        title="Edit with Percify"
                      >
                        ✨ Percify It
                      </a>
                      <a
                        href={generatedImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="image-action-btn"
                        title="Open in new tab"
                      >
                        🔗 Open
                      </a>
                      <button
                        className="image-action-btn"
                        onClick={() => setGeneratedImage(null)}
                        title="Clear image"
                      >
                        ✕ Clear
                      </button>
                      <button className="image-action-btn" title="See variations?">Variations</button>
                      <button className="image-action-btn" title="Turn into video?">Video</button>
                      <button className="image-action-btn" title="Refine this?">Refine</button>
                    </div>
                  </div>
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="generated-image"
                  />
                </div>
              ) : (
                <div className="instant-gen-placeholder">
                  <div className="placeholder-icon">⚡</div>
                  <p className="placeholder-text">
                    Media generation has now moved to the{' '}
                    <span 
                      className="media-studio-link"
                      onClick={() => router.push('/media-studio')}
                      style={{
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #FF00D4 0%, #00C8FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: 'rgba(255, 0, 212, 0.3)',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      Media Studio
                    </span>
                  </p>
                  <p className="placeholder-subtext">Describe what you want to see and press enter</p>
                </div>
              )}
            </div>
          )}

          {/* Generated Video Display */}
          {isVideoGenActive && (
            <div className="generated-video-container" ref={videoContainerRef}>
              {isGeneratingVideo ? (
                <div className="generating-indicator">
                  <div className="generating-spinner">
                    <div className="metallic-paint-loader">
                      <VizualLoadingAnimation />
                    </div>
                  </div>
                  <p className="generating-text">Generating your video... This may take 1-2 minutes</p>
                </div>
              ) : generatedVideo ? (
                <div className="generated-video-wrapper">
                  <div className="generated-video-header">
                    <h3>🎬 Generated Video</h3>
                    <div className="generated-video-actions">
                      <a
                        href={generatedVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-action-btn"
                        title="Open in new tab"
                      >
                        🔗 Open
                      </a>
                      <a
                        href={generatedVideo}
                        download="generated-video.mp4"
                        className="video-action-btn"
                        title="Download video"
                      >
                        ⬇ Download
                      </a>
                      <button
                        className="video-action-btn"
                        onClick={() => setGeneratedVideo(null)}
                        title="Clear video"
                      >
                        ✕ Clear
                      </button>
                      <button className="video-action-btn" title="Add captions?">Captions</button>
                      <button className="video-action-btn" title="Change tone?">Tone</button>
                    </div>
                  </div>
                  <video
                    src={generatedVideo}
                    controls
                    className="generated-video"
                    autoPlay
                    loop
                  />
                </div>
              ) : (
                <div className="video-gen-placeholder">
                  <div className="placeholder-icon">🎬</div>
                  <p className="placeholder-text">
                    Media generation has now moved to the{' '}
                    <span 
                      className="media-studio-link"
                      onClick={() => router.push('/media-studio')}
                      style={{
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #FF00D4 0%, #00C8FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: 'rgba(255, 0, 212, 0.3)',
                        animation: 'pulse 2s infinite'
                      }}
                    >
                      Media Studio
                    </span>
                  </p>
                  <p className="placeholder-subtext">Describe the scene you want to create and press enter</p>
                </div>
              )}
            </div>
          )}
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
            // Toggle persona selection - deselect if clicking the same persona
            if (selectedPersona === persona.title) {
              setSelectedPersona(null);
              console.log('Persona deselected:', persona.title);
            } else {
              setSelectedPersona(persona.title);
              console.log('Persona selected:', persona.title);
            }
          }}
        />
      )}

      {/* CircularGallery Overlay Animation for Pulse */}
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
          <CircularGallery
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollEase={0.02}
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

      {/* Show Chat Button - Visible when chat is hidden */}
      {isChatHidden && (
        <button
          className="show-chat-btn"
          onClick={() => setIsChatHidden(false)}
          title="Show Chat"
        >
          💬 Show Chat
        </button>
      )}

      {/* Infinite Menu Overlay */}
      <InfiniteMenu
        isVisible={showCreateMenu}
        onClose={() => setShowCreateMenu(false)}
      />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        limitType={paywallLimitType}
        currentUsage={paywallUsage.current}
        usageLimit={paywallUsage.limit}
        resetAt={paywallUsage.resetAt}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
      />

      {/* Media Gallery */}
      <MediaGallery
        isOpen={showMediaGallery}
        userId={user?.id || ''}
        onClose={() => setShowMediaGallery(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* News Ticker - Fixed at bottom */}
      {!isFullscreen && <NewsTicker />}
    </>
  );
}

export default SplashPage;