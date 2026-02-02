"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useGuestMode } from "@/context/guest-mode-context";
import {
  ChevronDown,
  ChevronLeft,
  Plus,
  Menu,
  X,
  Home,
  FolderKanban,
  Compass,
  Lightbulb,
  PanelLeftClose,
  PanelLeft,
  MessageSquareQuote,
  Video,
  Camera,
  Upload,
  Play,
  Square,
  Wand2,
  Image as ImageIcon,
  Mic,
  MicOff,
  Settings,
  Sparkles,
  Radio,
  RefreshCw,
  User,
  Palette,
  Monitor,
  Zap
} from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
import { Vortex } from "@/components/ui/vortex";
import { useToast } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Nav Item Component
const NavItem = ({ icon, label, active, expanded, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 ${expanded ? 'px-3' : 'justify-center'} py-2.5 rounded-lg transition-colors ${
      active
        ? 'bg-white/10 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`}
    title={!expanded ? label : undefined}
  >
    {icon}
    {expanded && <span className="text-sm font-medium">{label}</span>}
  </button>
);

// Live Mode types
type LiveMode = 'VIDEO_RESTYLING' | 'AVATAR_LIVE';
type ConnectionState = 'idle' | 'requesting' | 'connected' | 'streaming' | 'error';

export default function LivePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isGuestMode } = useGuestMode();
  const { showToast } = useToast();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Live mode state
  const [liveMode, setLiveMode] = useState<LiveMode>('VIDEO_RESTYLING');
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [stylePrompt, setStylePrompt] = useState('');
  const [avatarPrompt, setAvatarPrompt] = useState('');

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Stream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(true);

  // WebSocket and WebRTC refs
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Request camera access
  const requestCameraAccess = async () => {
    setConnectionState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          frameRate: 25,
          width: { ideal: 1280 },
          height: { ideal: 704 },
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setConnectionState('connected');
      setIsUsingCamera(true);
      showToast('Camera connected successfully!', 'success');
    } catch (error: any) {
      console.error('Camera access error:', error);
      setConnectionState('error');
      showToast(`Camera access denied: ${error.message}`, 'error');
    }
  };

  // Handle video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
      setIsUsingCamera(false);
      setConnectionState('connected');
      
      if (localVideoRef.current) {
        localVideoRef.current.src = url;
        localVideoRef.current.srcObject = null;
      }
      showToast('Video uploaded successfully!', 'success');
    }
  };

  // Handle avatar image upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarImage(event.target?.result as string);
        showToast('Avatar image uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Get WebSocket URL from server (keeps API key secure)
  const getStreamConfig = async (model: string) => {
    try {
      const res = await fetch(`/api/decart/stream?model=${model}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to get stream configuration');
      }
      return await res.json();
    } catch (error: any) {
      showToast(error.message || 'Failed to connect to streaming service', 'error');
      return null;
    }
  };

  // Start streaming (connect to Decart API via WebRTC)
  const startStreaming = async () => {
    if (!stylePrompt.trim() && liveMode === 'VIDEO_RESTYLING') {
      showToast('Please enter a style prompt first', 'error');
      return;
    }

    if (liveMode === 'AVATAR_LIVE' && !avatarImage) {
      showToast('Please upload an avatar image first', 'error');
      return;
    }

    setConnectionState('streaming');
    showToast('Connecting to stream...', 'success');

    try {
      // Get stream config from server (includes WebSocket URL with API key)
      const model = liveMode === 'AVATAR_LIVE' ? 'live_avatar' : 'mirage_v2';
      const config = await getStreamConfig(model);
      
      if (!config) {
        setConnectionState('connected');
        return;
      }

      // Create WebSocket connection
      const ws = new WebSocket(config.wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('WebSocket connected');
        
        if (liveMode === 'AVATAR_LIVE' && avatarImage) {
          // For Avatar Live: Send avatar image first
          const imageData = avatarImage.split(',')[1]; // Remove data:image/...;base64, prefix
          ws.send(JSON.stringify({
            type: 'set_image',
            image_data: imageData
          }));
        } else {
          // For Video Restyling: Set up WebRTC directly
          await setupWebRTC(ws, config.specs);
        }
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'set_image_ack') {
          // Avatar image accepted, now set up WebRTC
          await setupWebRTC(ws, config.specs);
        } else if (message.type === 'answer' && peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription({
            type: 'answer',
            sdp: message.sdp
          });
        } else if (message.type === 'error') {
          console.error('Stream error:', message);
          showToast(message.message || 'Stream error', 'error');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        showToast('Connection error', 'error');
        setConnectionState('connected');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (isStreaming) {
          setIsStreaming(false);
          setConnectionState('connected');
        }
      };

    } catch (error: any) {
      console.error('Streaming error:', error);
      showToast(error.message || 'Failed to start stream', 'error');
      setConnectionState('connected');
    }
  };

  // Set up WebRTC peer connection
  const setupWebRTC = async (ws: WebSocket, specs: { fps: number; width: number; height: number }) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = peerConnection;

    // Send ICE candidates to server
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    // Receive transformed video stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setIsStreaming(true);
      showToast('Stream connected!', 'success');
    };

    // Add local stream tracks (for Video Restyling)
    if (liveMode === 'VIDEO_RESTYLING' && localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    } else if (liveMode === 'AVATAR_LIVE') {
      // For Avatar Live: Add receive-only video transceiver and silent audio
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      
      // Create silent audio for the connection
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const destination = audioContext.createMediaStreamDestination();
      
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start();
      
      destination.stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, destination.stream);
      });
    }

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    ws.send(JSON.stringify({
      type: 'offer',
      sdp: offer.sdp
    }));

    // Send initial prompt
    const prompt = liveMode === 'VIDEO_RESTYLING' ? stylePrompt : avatarPrompt;
    if (prompt) {
      ws.send(JSON.stringify({
        type: 'prompt',
        prompt: prompt
      }));
    }
  };

  // Update prompt while streaming
  const updatePrompt = (newPrompt: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'prompt',
        prompt: newPrompt
      }));
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    setIsStreaming(false);
    setConnectionState('connected');
    
    // Disconnect WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    showToast('Stream stopped', 'success');
  };

  // Toggle camera/video source
  const switchToCamera = () => {
    if (uploadedVideo) {
      URL.revokeObjectURL(uploadedVideo);
      setUploadedVideo(null);
    }
    requestCameraAccess();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (uploadedVideo) {
        URL.revokeObjectURL(uploadedVideo);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [localStream, uploadedVideo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isGuestMode) {
    router.push('/login');
    return null;
  }

  return (
    <div
      className={`h-[100dvh] bg-[#0a0a0a] text-white flex overflow-hidden ${inter.className}`}
      style={{
        position: 'fixed',
        inset: 0,
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed md:relative h-full z-50 
        ${sidebarExpanded ? 'w-56' : 'w-16'} 
        bg-[#0a0a0a] border-r border-white/5 
        flex flex-col py-4 
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Close button - mobile only */}
        {sidebarOpen && (
          <button
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        )}

        <div className={`flex items-center ${sidebarExpanded ? 'justify-between px-4' : 'justify-center'} mb-4 flex-shrink-0`}>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => router.push('/vizual')}
          >
            <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M25 20 L85 50 L25 80 V20 Z" fill="currentColor" />
            </svg>
            {sidebarExpanded && <span className={`font-bold text-sm uppercase tracking-wide ${spaceGrotesk.className}`}>VIZUAL</span>}
          </div>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="hidden md:block p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            {sidebarExpanded ? <PanelLeftClose size={18} className="text-gray-400" /> : <PanelLeft size={18} className="text-gray-400" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className={`flex-1 flex flex-col gap-1 ${sidebarExpanded ? 'px-3' : 'px-2'} overflow-y-auto`}>
          <NavItem
            icon={<FolderKanban size={20} />}
            label="Projects"
            expanded={sidebarExpanded}
            onClick={() => router.push('/vizual/studio')}
          />
          <NavItem
            icon={<Home size={20} />}
            label="Studio"
            expanded={sidebarExpanded}
            onClick={() => router.push('/vizual/studio')}
          />
          <NavItem
            icon={<Radio size={20} />}
            label="Live"
            active={true}
            expanded={sidebarExpanded}
            onClick={() => {}}
          />
          <NavItem
            icon={<Lightbulb size={20} />}
            label="Inspiration"
            expanded={sidebarExpanded}
            onClick={() => router.push('/vizual/studio')}
          />
          <NavItem
            icon={<Compass size={20} />}
            label="Community"
            expanded={sidebarExpanded}
            onClick={() => router.push('/vizual/community')}
          />
        </nav>

        {/* Bottom Section */}
        <div className={`${sidebarExpanded ? 'px-3' : 'px-2'} pt-4 border-t border-white/5 mt-4 flex-shrink-0 space-y-2`}>
          <NavItem
            icon={<MessageSquareQuote size={20} />}
            label="Feedback"
            expanded={sidebarExpanded}
            onClick={() => {}}
          />
          <button
            onClick={() => router.push('/vizual/studio')}
            className={`w-full flex items-center gap-3 ${sidebarExpanded ? 'px-2' : 'justify-center'} py-2 rounded-lg hover:bg-white/5 transition-colors`}
          >
            {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
              <img
                src={user.user_metadata.avatar_url || user.user_metadata.picture}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'G')[0].toUpperCase()}
              </div>
            )}
            {sidebarExpanded && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || 'Artist'}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col bg-black overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Vortex
            backgroundColor="black"
            rangeY={800}
            particleCount={300}
            baseHue={280}
            saturation="70%"
            lightness="50%"
            className="flex flex-col w-full h-full"
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col w-full h-full">
          {/* Header */}
          <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-lg flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Radio size={24} className="text-purple-400" />
                <h1 className={`text-xl font-bold ${spaceGrotesk.className}`}>
                  LIVE
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded-full uppercase tracking-wider">
                  Beta
                </span>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
              <button
                onClick={() => setLiveMode('VIDEO_RESTYLING')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  liveMode === 'VIDEO_RESTYLING'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Video Restyling</span>
                <span className="sm:hidden">Restyle</span>
              </button>
              <button
                onClick={() => setLiveMode('AVATAR_LIVE')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  liveMode === 'AVATAR_LIVE'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Avatar Live</span>
                <span className="sm:hidden">Avatar</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              
              {/* Video Restyling Mode */}
              {liveMode === 'VIDEO_RESTYLING' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${spaceGrotesk.className}`}>
                      Transform Video in <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Realtime</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                      Use your camera or upload a video, add a style prompt, and watch it transform instantly with AI.
                    </p>
                  </div>

                  {/* Video Preview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Video */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Input</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={switchToCamera}
                            className={`p-2 rounded-lg transition-colors ${isUsingCamera ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Use Camera"
                          >
                            <Camera size={18} />
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-2 rounded-lg transition-colors ${!isUsingCamera && uploadedVideo ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            title="Upload Video"
                          >
                            <Upload size={18} />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoUpload}
                          />
                        </div>
                      </div>
                      
                      <div className="relative aspect-video bg-[#111] rounded-2xl overflow-hidden border border-white/10">
                        {connectionState === 'idle' ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <Camera size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-400 text-sm">Camera access required</p>
                            <div className="flex gap-3">
                              <button
                                onClick={requestCameraAccess}
                                className="px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                              >
                                <Camera size={16} />
                                Enable Camera
                              </button>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-white/10 text-white rounded-full font-medium text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
                              >
                                <Upload size={16} />
                                Upload Video
                              </button>
                            </div>
                          </div>
                        ) : connectionState === 'requesting' ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <p className="text-gray-400 text-sm">Requesting camera access...</p>
                          </div>
                        ) : (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            loop={!isUsingCamera}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Mute button overlay */}
                        {connectionState !== 'idle' && connectionState !== 'requesting' && isUsingCamera && (
                          <button
                            onClick={() => {
                              if (localStream) {
                                localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                                setIsMuted(!isMuted);
                              }
                            }}
                            className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          >
                            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Output Video */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Output (Restyled)</h3>
                        {isStreaming && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs text-red-400 font-medium">LIVE</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative aspect-video bg-[#111] rounded-2xl overflow-hidden border border-white/10">
                        {!isStreaming ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                              <Sparkles size={32} className="text-purple-400" />
                            </div>
                            <p className="text-gray-400 text-sm">Restyled output will appear here</p>
                          </div>
                        ) : (
                          <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Style Prompt Input */}
                  <div className="max-w-3xl mx-auto space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50" />
                      <div className="relative bg-[#111]/90 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Palette size={18} className="text-purple-400" />
                          <span className="text-sm font-medium text-gray-300">Style Prompt</span>
                          {isStreaming && (
                            <span className="ml-auto text-xs text-purple-400">Changes apply in realtime</span>
                          )}
                        </div>
                        <textarea
                          value={stylePrompt}
                          onChange={(e) => {
                            setStylePrompt(e.target.value);
                            if (isStreaming) {
                              updatePrompt(e.target.value);
                            }
                          }}
                          placeholder="Describe the style transformation... (e.g., 'Cyberpunk city with neon lights', 'Studio Ghibli animation', 'Oil painting masterpiece')"
                          className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none min-h-[80px]"
                          rows={2}
                        />
                        
                        {/* Quick Style Presets */}
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                          {['Cyberpunk', 'Anime', 'Oil Painting', 'Watercolor', 'Sketch', 'Neon', 'Vintage Film', 'Sci-Fi'].map((style) => (
                            <button
                              key={style}
                              onClick={() => {
                                setStylePrompt(style);
                                if (isStreaming) {
                                  updatePrompt(style);
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reference Image (Optional) */}
                    <div className="flex items-center gap-4 px-4">
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                      >
                        <ImageIcon size={16} />
                        Add Reference Image
                      </button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <span className="text-xs text-gray-500">Optional: Use an image to guide the style</span>
                    </div>

                    {/* Start/Stop Button */}
                    <div className="flex justify-center pt-4">
                      {!isStreaming ? (
                        <button
                          onClick={startStreaming}
                          disabled={connectionState === 'idle' || connectionState === 'requesting'}
                          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-3 transition-all shadow-lg shadow-purple-500/20"
                        >
                          <Play size={20} />
                          Start Live Restyling
                        </button>
                      ) : (
                        <button
                          onClick={stopStreaming}
                          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-3 transition-colors"
                        >
                          <Square size={20} />
                          Stop Stream
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Avatar Live Mode */}
              {liveMode === 'AVATAR_LIVE' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${spaceGrotesk.className}`}>
                      Bring Portraits to <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Life</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                      Upload a portrait image and animate it with your voice or audio. Create talking avatars in realtime.
                    </p>
                  </div>

                  {/* Avatar Preview */}
                  <div className="max-w-2xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Avatar Image Upload */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Portrait Image</h3>
                        <div 
                          className="relative aspect-[3/4] bg-[#111] rounded-2xl overflow-hidden border border-white/10 cursor-pointer group"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          {avatarImage ? (
                            <>
                              <img
                                src={avatarImage}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <RefreshCw size={24} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User size={32} className="text-gray-400" />
                              </div>
                              <p className="text-gray-400 text-sm">Click to upload portrait</p>
                              <p className="text-gray-500 text-xs">JPEG, PNG, or WebP</p>
                            </div>
                          )}
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </div>
                      </div>

                      {/* Animated Output */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Animated Avatar</h3>
                        <div className="relative aspect-[3/4] bg-[#111] rounded-2xl overflow-hidden border border-white/10">
                          {!isStreaming ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                                <Sparkles size={32} className="text-blue-400" />
                              </div>
                              <p className="text-gray-400 text-sm text-center px-4">Animated avatar will appear here when streaming</p>
                            </div>
                          ) : (
                            <video
                              ref={remoteVideoRef}
                              autoPlay
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Controls */}
                  <div className="max-w-xl mx-auto space-y-4">
                    {/* Behavior Prompt */}
                    <div className="relative bg-[#111]/90 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Wand2 size={18} className="text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Avatar Behavior</span>
                      </div>
                      <textarea
                        value={avatarPrompt}
                        onChange={(e) => setAvatarPrompt(e.target.value)}
                        placeholder="Describe how the avatar should behave... (e.g., 'Smile warmly and nod occasionally', 'Speak enthusiastically with hand gestures')"
                        className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none min-h-[60px]"
                        rows={2}
                      />
                    </div>

                    {/* Audio Input */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={() => audioInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors"
                      >
                        <Upload size={18} />
                        Upload Audio File
                      </button>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                      />
                      <span className="text-center text-xs text-gray-500">or</span>
                      <button
                        onClick={requestCameraAccess}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors"
                      >
                        <Mic size={18} />
                        Use Microphone
                      </button>
                    </div>

                    {/* Start/Stop Button */}
                    <div className="flex justify-center pt-4">
                      {!isStreaming ? (
                        <button
                          onClick={startStreaming}
                          disabled={!avatarImage}
                          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <Play size={20} />
                          Start Avatar Stream
                        </button>
                      ) : (
                        <button
                          onClick={stopStreaming}
                          className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-3 transition-colors"
                        >
                          <Square size={20} />
                          Stop Stream
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* API Key Notice */}
              <div className="max-w-2xl mx-auto mt-12">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-1">Decart API Required</h4>
                      <p className="text-xs text-yellow-400/70">
                        Live video transformation requires a Decart API key. Configure your API key in the settings to enable real-time streaming.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
