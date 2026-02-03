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
import { Sidebar } from "@/components/vizual/sidebar";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

// Custom CSS for animations
const glowStyles = `
  @keyframes borderGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3), 0 0 10px rgba(239, 68, 68, 0.2); }
    50% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.5), 0 0 25px rgba(239, 68, 68, 0.3); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
  }
  .btn-glow { animation: borderGlow 2s ease-in-out infinite; }
  .btn-glow:hover { animation: none; box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3); }
  .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
`;


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
    <>
      <style>{glowStyles}</style>
      <div
        className={`h-screen w-screen text-white flex overflow-hidden ${inter.className}`}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #1a0a0a 0%, #0a0a0a 50%, #0a0808 100%)'
        }}
      >
        {/* Mobile Menu Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Shared Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          activePage="LIVE"
          onProfileClick={() => router.push('/vizual/studio')} // Or appropriate profile action
          onFeedbackClick={() => { }} // Handle feedback modal if present
          onCreateNew={() => router.push('/vizual/studio')}
        />

        {/* Main Content - Fixed layout on desktop, scrollable on mobile */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto lg:overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 100%)' }}>
          {/* Header */}
          <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-black/50 backdrop-blur-md flex-shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Menu"
              >
                <Menu size={22} className="text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <Radio size={22} className="text-red-500" />
                <h1 className={`text-lg font-bold tracking-tight ${spaceGrotesk.className}`}>
                  REALTIME <span className="text-gray-500">SWAP</span>
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-bold border border-red-500/50 text-red-400 rounded-full uppercase tracking-wider">
                  Beta
                </span>
              </div>
            </div>
          </header>

          {/* Main Grid - Scrollable on mobile, fixed on desktop */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:min-h-0">

            {/* Left: Video Panels */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:min-h-0">
              {/* Input Video */}
              <div className="flex-1 flex flex-col min-h-[200px] lg:min-h-0">
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

                <div className={`flex-1 relative rounded-xl overflow-hidden border transition-all duration-300 ${(connectionState === 'connected' || connectionState === 'streaming') && isUsingCamera
                  ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                  : 'border-white/5'
                  }`} style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)' }}>
                  {connectionState === 'idle' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Camera size={28} className="text-red-400" />
                      </div>
                      <p className="text-gray-400 text-sm text-center">Camera access required</p>
                      <div className="flex gap-2">
                        <button
                          onClick={requestCameraAccess}
                          className="btn-glow px-4 py-2 bg-transparent border-2 border-red-500 text-red-400 rounded-full font-medium text-xs hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 flex items-center gap-2"
                        >
                          <Camera size={14} />
                          Enable Camera
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-transparent border border-white/30 text-white/70 rounded-full font-medium text-xs hover:border-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
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

                <div className={`flex-1 relative rounded-xl overflow-hidden border transition-all duration-300 ${isStreaming ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/5'
                  }`} style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)' }}>
                  {!isStreaming ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }}>
                        <Sparkles size={28} className="text-white/30" />
                      </div>
                      <p className="text-gray-500 text-sm text-center font-medium tracking-tight">Swapped output appears here</p>
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
            <div className="w-full lg:w-80 flex flex-col gap-3 flex-shrink-0 pb-6 lg:pb-0 lg:overflow-y-auto">
              {/* Style Prompt */}
              <div className="rounded-xl border border-white/5 p-4 flex-shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={16} className="text-white/60" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Style Prompt</span>
                  {isStreaming && (
                    <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] text-red-400 font-bold uppercase">Live</span>
                    </div>
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
                  placeholder="Describe the style... (e.g., 'Cyberpunk', 'Anime')"
                  className="w-full bg-white/5 text-white placeholder-gray-600 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/20 rounded-xl p-3 border border-white/10 transition-all"
                  rows={2}
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['Cyberpunk', 'Anime', 'Realistic', 'Film Noir', '3D Render'].map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        setStylePrompt(style);
                        if (isStreaming) updatePrompt(style);
                      }}
                      className="px-3 py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-full transition-all uppercase tracking-wider"
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Image (Optional) */}
              <div className="rounded-xl border border-white/5 p-4 flex-shrink-0 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-white/40" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference Image</span>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Optional</span>
                </div>

                {referenceImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/20">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-300 hover:text-white transition-colors backdrop-blur-md"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-20 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 group"
                  >
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Add Face Ref</span>
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
              <div className="flex-shrink-0 mt-2">
                {!isStreaming ? (
                  <button
                    onClick={startStreaming}
                    disabled={connectionState === 'idle' || connectionState === 'requesting'}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gray-200 hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                  >
                    <Play size={18} fill="currentColor" />
                    Initialize
                  </button>
                ) : (
                  <button
                    onClick={stopStreaming}
                    className="w-full py-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-red-500/20 shadow-lg shadow-red-500/10"
                  >
                    <Square size={18} fill="currentColor" />
                    End Stream
                  </button>
                )}
              </div>

              {/* API Notice */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                    <Zap size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">API Status</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      Ensure <code className="text-gray-300 bg-white/5 px-1 rounded">DECART_API_KEY</code> is configured for realtime streaming.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
