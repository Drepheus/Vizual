"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useGuestMode } from "@/context/guest-mode-context";
import {
  Menu,
  X,
  Home,
  FolderKanban,
  Compass,
  Lightbulb,
  PanelLeftClose,
  PanelLeft,
  MessageSquareQuote,
  Camera,
  Upload,
  Play,
  Square,
  Mic,
  MicOff,
  Sparkles,
  Radio,
  Palette,
  Zap,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";
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
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [stylePrompt, setStylePrompt] = useState('');

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Stream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(true);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

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
          frameRate: { ideal: 25 },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });
      
      setLocalStream(stream);
      
      // Set stream to video element and ensure it plays
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        // Force play after setting srcObject
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current?.play().catch(console.error);
        };
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
      // Stop camera if active
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
      setIsUsingCamera(false);
      setConnectionState('connected');
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        localVideoRef.current.src = url;
        localVideoRef.current.play().catch(console.error);
      }
      showToast('Video uploaded successfully!', 'success');
    }
  };

  // Handle reference image upload
  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
        showToast('Reference image added!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Get WebSocket URL from server
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

  // Start streaming
  const startStreaming = async () => {
    if (!stylePrompt.trim()) {
      showToast('Please enter a style prompt first', 'error');
      return;
    }

    if (connectionState !== 'connected') {
      showToast('Please connect camera or upload a video first', 'error');
      return;
    }

    setConnectionState('streaming');
    showToast('Connecting to stream...', 'success');

    try {
      const config = await getStreamConfig('mirage_v2');
      
      if (!config) {
        setConnectionState('connected');
        return;
      }

      const ws = new WebSocket(config.wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('WebSocket connected');
        await setupWebRTC(ws, config.specs);
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'answer' && peerConnectionRef.current) {
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

  // Set up WebRTC
  const setupWebRTC = async (ws: WebSocket, specs: { fps: number; width: number; height: number }) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setIsStreaming(true);
      showToast('Stream connected!', 'success');
    };

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    ws.send(JSON.stringify({
      type: 'offer',
      sdp: offer.sdp
    }));

    if (stylePrompt) {
      ws.send(JSON.stringify({
        type: 'prompt',
        prompt: stylePrompt
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
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    showToast('Stream stopped', 'success');
  };

  // Switch to camera
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
      <div className="h-screen w-screen bg-black flex items-center justify-center">
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
      className={`h-screen w-screen bg-[#0a0a0a] text-white flex overflow-hidden ${inter.className}`}
      style={{ position: 'fixed', inset: 0 }}
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
            onClick={() => router.push('/vizual/studio')}
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

      {/* Main Content - Fixed layout, no scrolling */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-black">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-black flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Radio size={22} className="text-red-500" />
              <h1 className={`text-lg font-bold ${spaceGrotesk.className}`}>
                REALTIME SWAP
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-600 to-red-500 rounded-full uppercase tracking-wider">
                Beta
              </span>
            </div>
          </div>
        </header>

        {/* Main Grid - Fixed height, fills remaining space */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
          
          {/* Left: Video Panels */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
            {/* Input Video */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Input</h3>
                  {/* Blinking red light when camera is connected */}
                  {(connectionState === 'connected' || connectionState === 'streaming') && isUsingCamera && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]" />
                      <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">REC</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={switchToCamera}
                    className={`p-1.5 rounded-lg transition-colors ${isUsingCamera && connectionState !== 'idle' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Use Camera"
                  >
                    <Camera size={16} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 rounded-lg transition-colors ${!isUsingCamera && uploadedVideo ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Upload Video"
                  >
                    <Upload size={16} />
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
              
              <div className={`flex-1 relative bg-[#111] rounded-xl overflow-hidden border transition-all duration-300 ${
                (connectionState === 'connected' || connectionState === 'streaming') && isUsingCamera 
                  ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                  : 'border-white/10'
              }`}>
                {connectionState === 'idle' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Camera size={28} className="text-red-400" />
                    </div>
                    <p className="text-gray-400 text-sm text-center">Camera access required</p>
                    <div className="flex gap-2">
                      <button
                        onClick={requestCameraAccess}
                        className="px-4 py-2 bg-red-500 text-white rounded-full font-medium text-xs hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Camera size={14} />
                        Enable Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white/10 text-white rounded-full font-medium text-xs hover:bg-white/20 transition-colors flex items-center gap-2"
                      >
                        <Upload size={14} />
                        Upload
                      </button>
                    </div>
                  </div>
                ) : connectionState === 'requesting' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Requesting camera...</p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      loop={!isUsingCamera}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Mute button */}
                    {isUsingCamera && (
                      <button
                        onClick={() => {
                          if (localStream) {
                            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Output Video */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Output (Swapped)</h3>
                {isStreaming && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">LIVE</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 relative bg-[#111] rounded-xl overflow-hidden border border-white/10">
                {!isStreaming ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                      <Sparkles size={28} className="text-red-400" />
                    </div>
                    <p className="text-gray-400 text-sm text-center">Swapped output appears here</p>
                  </div>
                ) : (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-3 flex-shrink-0 lg:overflow-y-auto">
            {/* Style Prompt */}
            <div className="bg-[#111]/90 rounded-xl border border-white/10 p-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={16} className="text-red-400" />
                <span className="text-xs font-medium text-gray-300">Style Prompt</span>
                {isStreaming && (
                  <span className="ml-auto text-[10px] text-red-400">Realtime</span>
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
                placeholder="Describe the style... (e.g., 'Cyberpunk', 'Anime', 'Oil Painting')"
                className="w-full bg-black/50 text-white placeholder-gray-500 text-sm resize-none focus:outline-none rounded-lg p-2 border border-white/5"
                rows={2}
              />
              
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Cyberpunk', 'Anime', 'Oil Painting', 'Watercolor', 'Neon', 'Vintage'].map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setStylePrompt(style);
                      if (isStreaming) updatePrompt(style);
                    }}
                    className="px-2 py-1 text-[10px] font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image (Optional) */}
            <div className="bg-[#111]/90 rounded-xl border border-white/10 p-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Reference Image</span>
                </div>
                <span className="text-[10px] text-gray-500">Optional</span>
              </div>
              
              {referenceImage ? (
                <div className="relative w-full h-20 rounded-lg overflow-hidden">
                  <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-16 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-2 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-xs">Add image</span>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReferenceImageUpload}
              />
            </div>

            {/* Start/Stop Button */}
            <div className="flex-shrink-0">
              {!isStreaming ? (
                <button
                  onClick={startStreaming}
                  disabled={connectionState === 'idle' || connectionState === 'requesting'}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                  <Play size={18} />
                  Start Realtime Swap
                </button>
              ) : (
                <button
                  onClick={stopStreaming}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Square size={18} />
                  Stop Stream
                </button>
              )}
            </div>

            {/* API Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex-shrink-0">
              <div className="flex items-start gap-2">
                <Zap size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-medium text-yellow-400 mb-0.5">Decart API Required</h4>
                  <p className="text-[10px] text-yellow-400/70 leading-relaxed">
                    Add DECART_API_KEY to your environment to enable realtime streaming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
