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
  Plus,
  Send,
  Loader2
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  // Default to Einstein image
  const [referenceImage, setReferenceImage] = useState<string | null>('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/440px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg');
  const [characterPrompt, setCharacterPrompt] = useState<string>('');
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);

  // Effect to attach stream to video element when both are available
  // This fixes the issue where the video element isn't rendered yet when the stream is set
  useEffect(() => {
    if (localStream && localVideoRef.current && isUsingCamera) {
      const videoElement = localVideoRef.current;
      
      // Only set if not already set
      if (videoElement.srcObject !== localStream) {
        videoElement.srcObject = localStream;
        videoElement.muted = true;
        
        // Ensure video plays
        const playVideo = async () => {
          try {
            await videoElement.play();
            console.log('Camera video playing successfully');
          } catch (error) {
            console.error('Error playing camera video:', error);
          }
        };
        
        // Play when metadata is loaded or immediately if already loaded
        if (videoElement.readyState >= 2) {
          playVideo();
        } else {
          videoElement.onloadedmetadata = () => playVideo();
        }
      }
    }
  }, [localStream, connectionState, isUsingCamera]);

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

      console.log('Camera stream obtained:', stream.getVideoTracks());
      
      // Set stream state - useEffect will handle attaching to video element
      setLocalStream(stream);
      setIsUsingCamera(true);
      setConnectionState('connected');
      
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

  // Get WebSocket URL from server
  const getStreamConfig = async (model: string) => {
    try {
      const res = await fetch(`/api/decart/stream?model=${model}`);
      
      // Check if response has content
      const contentType = res.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      
      if (!res.ok) {
        let errorMessage = `Server error: ${res.status}`;
        
        // Only try to parse JSON if content-type indicates JSON
        if (hasJsonContent) {
          try {
            const text = await res.text();
            if (text) {
              const error = JSON.parse(text);
              errorMessage = error.message || error.error || errorMessage;
            }
          } catch (parseError) {
            // Ignore parse errors, use default message
            console.error('Error parsing error response:', parseError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Also handle empty successful responses
      if (!hasJsonContent) {
        throw new Error('Invalid response from server');
      }
      
      const text = await res.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      console.error('Stream config error:', error);
      showToast(error.message || 'Failed to connect to streaming service', 'error');
      return null;
    }
  };

  // Start streaming
  const startStreaming = async () => {
    // For character reference, we need a reference image
    if (!referenceImage) {
      showToast('Please add a character reference image first', 'error');
      return;
    }

    if (connectionState !== 'connected') {
      showToast('Please connect camera or upload a video first', 'error');
      return;
    }

    setConnectionState('streaming');
    showToast('Connecting to stream...', 'success');

    try {
      // Use lucy_2_rt model for character reference/face swap
      const config = await getStreamConfig('lucy_2_rt');

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
        console.log('WS message received:', message.type);

        if (message.type === 'answer' && peerConnectionRef.current) {
          console.log('Setting remote description (answer)');
          await peerConnectionRef.current.setRemoteDescription({
            type: 'answer',
            sdp: message.sdp
          });
        } else if (message.type === 'ice-candidate' && peerConnectionRef.current) {
          // Handle ICE candidates from server
          try {
            await peerConnectionRef.current.addIceCandidate(message.candidate);
          } catch (e) {
            console.log('ICE candidate error:', e);
          }
        } else if (message.type === 'error') {
          console.error('Stream error:', message);
          showToast(message.message || 'Stream error', 'error');
        } else if (message.type === 'ready') {
          console.log('Server ready for streaming');
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
    setDebugInfo('Setting up WebRTC...');
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peerConnectionRef.current = peerConnection;

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && ws.readyState === WebSocket.OPEN) {
        console.log('Sending ICE candidate');
        ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate
        }));
      }
    };

    // Track ICE gathering state
    peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', peerConnection.iceGatheringState);
      setDebugInfo(`ICE: ${peerConnection.iceGatheringState}`);
    };

    // Handle incoming tracks (transformed video)
    peerConnection.ontrack = (event) => {
      console.log('=== RECEIVED REMOTE TRACK ===');
      console.log('Track kind:', event.track.kind);
      console.log('Track enabled:', event.track.enabled);
      console.log('Track readyState:', event.track.readyState);
      console.log('Streams count:', event.streams.length);
      
      setDebugInfo(`Track received: ${event.track.kind}`);
      
      if (event.streams[0]) {
        const stream = event.streams[0];
        console.log('Stream active:', stream.active);
        console.log('Stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.readyState}`));
        
        if (remoteVideoRef.current) {
          console.log('Setting srcObject on remote video element');
          remoteVideoRef.current.srcObject = stream;
          
          // Add event listeners to track video state
          remoteVideoRef.current.onloadeddata = () => {
            console.log('Remote video: data loaded');
            setDebugInfo('Video data loaded');
          };
          
          // Force play with user interaction context
          const playPromise = remoteVideoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Remote video playing successfully');
                setDebugInfo('Video playing!');
              })
              .catch(e => {
                console.log('Auto-play prevented:', e.message);
                setDebugInfo(`Play blocked: ${e.message}`);
                // Try muted autoplay as fallback
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.muted = true;
                  remoteVideoRef.current.play()
                    .then(() => setDebugInfo('Playing (muted)'))
                    .catch(e2 => {
                      console.error('Muted play also failed:', e2);
                      setDebugInfo(`Play failed: ${e2.message}`);
                    });
                }
              });
          }
        } else {
          console.warn('Remote video ref not available!');
          setDebugInfo('ERROR: No video element ref');
        }
      } else {
        console.warn('No streams in track event!');
        setDebugInfo('ERROR: No streams received');
      }
      
      setIsStreaming(true);
      showToast('Stream connected! Transformation active.', 'success');
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      setDebugInfo(`Connection: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'failed') {
        showToast('Connection failed. Please try again.', 'error');
        stopStreaming();
      }
    };

    // Add local stream tracks to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('Adding local track:', track.kind, track.readyState);
        peerConnection.addTrack(track, localStream);
      });
      setDebugInfo(`Added ${localStream.getTracks().length} local tracks`);
    } else if (uploadedVideo && localVideoRef.current) {
      // For uploaded video, capture from video element
      const videoEl = localVideoRef.current;
      const capturedStream = (videoEl as any).captureStream ? (videoEl as any).captureStream(specs.fps) : (videoEl as any).mozCaptureStream(specs.fps);
      if (capturedStream) {
        capturedStream.getTracks().forEach((track: MediaStreamTrack) => {
          console.log('Adding captured track:', track.kind);
          peerConnection.addTrack(track, capturedStream);
        });
      }
    }

    // Send the prompt if provided (optional for character reference)
    if (stylePrompt) {
      console.log('Sending prompt:', stylePrompt);
      ws.send(JSON.stringify({
        type: 'prompt',
        prompt: stylePrompt
      }));
      setDebugInfo('Sent prompt');
    }

    // For character reference (lucy_2_rt), send the reference image BEFORE the offer
    if (referenceImage) {
      console.log('Sending character reference image');
      const imageData = referenceImage.split(',')[1];
      ws.send(JSON.stringify({
        type: 'set_image',
        image_data: imageData
      }));
      setDebugInfo('Sent character reference image');
    }

    // Create offer
    const offer = await peerConnection.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true
    });
    await peerConnection.setLocalDescription(offer);
    
    console.log('Sending offer');
    setDebugInfo('Sending offer...');
    
    ws.send(JSON.stringify({
      type: 'offer',
      sdp: offer.sdp
    }));
  };

  // Update the character reference image while streaming
  const updateReferenceImage = (imageDataUrl: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const imageData = imageDataUrl.split(',')[1];
      wsRef.current.send(JSON.stringify({
        type: 'set_image',
        image_data: imageData
      }));
      showToast('Character updated!', 'success');
    }
  };

  // Update prompt while streaming (for style changes)
  const updatePrompt = (newPrompt: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'prompt',
        prompt: newPrompt
      }));
    }
  };

  // Generate a character image from text prompt
  const generateCharacterFromPrompt = async () => {
    if (!characterPrompt.trim()) {
      showToast('Please enter a character description', 'error');
      return;
    }

    setIsGeneratingCharacter(true);
    showToast('Generating character...', 'success');

    try {
      // Enhance prompt for portrait generation
      const enhancedPrompt = `Portrait photo of ${characterPrompt}, detailed face, high quality, professional headshot, centered, looking at camera`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          aspectRatio: '1:1',
          model: 'flux-schnell'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate character');
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setReferenceImage(data.imageUrl);
        showToast('Character generated!', 'success');
        
        // If streaming, update the reference image in the stream
        if (isStreaming && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Fetch the image and convert to base64
          try {
            const imgResponse = await fetch(data.imageUrl);
            const blob = await imgResponse.blob();
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              updateReferenceImage(dataUrl);
            };
            reader.readAsDataURL(blob);
          } catch (err) {
            console.error('Error converting image for stream:', err);
          }
        }
      } else {
        throw new Error('No image returned');
      }
    } catch (error: any) {
      console.error('Character generation error:', error);
      showToast(error.message || 'Failed to generate character', 'error');
    } finally {
      setIsGeneratingCharacter(false);
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

  // Disable/stop camera and go back to idle
  const disableCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (uploadedVideo) {
      URL.revokeObjectURL(uploadedVideo);
      setUploadedVideo(null);
    }
    setIsUsingCamera(false);
    setConnectionState('idle');
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.src = '';
    }
    showToast('Camera disabled', 'success');
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

        {/* MOBILE: Full-screen camera experience */}
        <main className="flex-1 flex flex-col h-full lg:hidden relative overflow-hidden">
          {/* Full-screen video background */}
          <div className="absolute inset-0 z-0">
            {connectionState === 'idle' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-black">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Camera size={36} className="text-red-400" />
                </div>
                <p className="text-gray-400 text-base text-center">Enable camera to start</p>
                <div className="flex gap-3">
                  <button
                    onClick={requestCameraAccess}
                    className="btn-glow px-6 py-3 bg-transparent border-2 border-red-500 text-red-400 rounded-full font-bold text-sm hover:bg-red-500/10 transition-all duration-300 flex items-center gap-2"
                  >
                    <Camera size={18} />
                    Enable Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-transparent border border-white/30 text-white/70 rounded-full font-medium text-sm hover:border-white/60 transition-all duration-300 flex items-center gap-2"
                  >
                    <Upload size={18} />
                    Upload
                  </button>
                </div>
              </div>
            ) : connectionState === 'requesting' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
                <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Requesting camera...</p>
              </div>
            ) : (
              <>
                {/* Show output (swapped) video if streaming, otherwise show input */}
                <video
                  ref={isStreaming ? remoteVideoRef : localVideoRef}
                  autoPlay
                  muted={!isStreaming}
                  playsInline
                  loop={!isUsingCamera && !isStreaming}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Hidden video refs for the other stream */}
                {isStreaming && (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="hidden"
                  />
                )}
              </>
            )}
          </div>

          {/* Top overlay - Header */}
          <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
            >
              <Menu size={22} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              {isStreaming && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400 font-bold uppercase">Live</span>
                </div>
              )}
              {(connectionState === 'connected' || connectionState === 'streaming') && isUsingCamera && !isStreaming && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Ready</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Disable Camera Button - only show when camera is active */}
              {(connectionState === 'connected' || connectionState === 'streaming') && !isStreaming && (
                <button
                  onClick={disableCamera}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-red-500/30 transition-colors"
                  title="Disable Camera"
                >
                  <X size={20} className="text-white" />
                </button>
              )}
              {isUsingCamera && (
                <button
                  onClick={() => {
                    if (localStream) {
                      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
                >
                  {isMuted ? <MicOff size={20} className="text-red-400" /> : <Mic size={20} className="text-white" />}
                </button>
              )}
            </div>
          </div>

          {/* Spacer to push controls to bottom */}
          <div className="flex-1" />

          {/* Bottom overlay - Controls */}
          <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-6 px-4">
            {/* Character prompt - Transparent */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon size={14} className="text-purple-400" />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Character</span>
                {referenceImage && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-red-500/50 ml-auto">
                    <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setReferenceImage(null)}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                  title="Upload image"
                >
                  <Upload size={14} />
                </button>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={characterPrompt}
                  onChange={(e) => setCharacterPrompt(e.target.value)}
                  placeholder="Describe who you want to become..."
                  className="flex-1 h-12 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-red-500/50 transition-all duration-300 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateCharacterFromPrompt();
                    }
                  }}
                />
                <button
                  onClick={generateCharacterFromPrompt}
                  disabled={isGeneratingCharacter || !characterPrompt.trim()}
                  className="px-4 rounded-xl bg-red-500/80 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  title="Generate character"
                >
                  {isGeneratingCharacter ? (
                    <Loader2 size={18} className="text-white animate-spin" />
                  ) : (
                    <Send size={18} className="text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Style prompt - Transparent (collapsed) */}
            <div className="mb-4">
              <textarea
                value={stylePrompt}
                onChange={(e) => {
                  setStylePrompt(e.target.value);
                  if (isStreaming) {
                    updatePrompt(e.target.value);
                  }
                }}
                placeholder="Style: dramatic lighting, cinematic..."
                className="w-full h-10 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all duration-300 resize-none"
              />
            </div>

            {/* Action button */}
            {!isStreaming ? (
              <button
                onClick={startStreaming}
                disabled={connectionState === 'idle' || connectionState === 'requesting'}
                className="w-full py-4 bg-white/90 backdrop-blur-md text-black rounded-2xl font-bold text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Play size={20} fill="currentColor" />
                Start Swap
              </button>
            ) : (
              <button
                onClick={stopStreaming}
                className="w-full py-4 bg-red-500/80 backdrop-blur-md text-white rounded-2xl font-bold text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300 hover:bg-red-500 active:scale-95"
              >
                <Square size={20} fill="currentColor" />
                Stop
              </button>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  const dataUrl = event.target?.result as string;
                  setReferenceImage(dataUrl);
                  if (isStreaming) {
                    updateReferenceImage(dataUrl);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </main>

        {/* DESKTOP: Original layout */}
        <main className="hidden lg:flex flex-1 flex-col h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f0505 0%, #0a0a0a 100%)' }}>
          {/* Header */}
          <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-black/50 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio size={22} className="text-red-500" />
                <h1 className={`text-lg font-bold tracking-tight ${spaceGrotesk.className}`}>
                  REALTIME <span className="text-gray-500">SWAP</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold border border-red-500/50 text-red-400 rounded-full uppercase tracking-wider">
                  Beta
                </span>
              </div>
            </div>
          </header>

          {/* Main Grid */}
          <div className="flex-1 flex flex-row gap-4 p-4 min-h-0">
            {/* Left: Video Panels */}
            <div className="flex-1 flex flex-row gap-4 min-h-0">
              {/* Input Video */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Input</h3>
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
                    {/* Disable Camera Button */}
                    {(connectionState === 'connected' || connectionState === 'streaming') && !isStreaming && (
                      <button
                        onClick={disableCamera}
                        className="p-1.5 rounded-lg transition-colors text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Disable Camera"
                      >
                        <X size={16} />
                      </button>
                    )}
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
                          className="btn-glow px-4 py-2 bg-transparent border-2 border-red-500 text-red-400 rounded-full font-medium text-xs hover:bg-red-500/10 transition-all duration-300 flex items-center gap-2"
                        >
                          <Camera size={14} />
                          Enable Camera
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-transparent border border-white/30 text-white/70 rounded-full font-medium text-xs hover:border-white/60 transition-all duration-300 flex items-center gap-2"
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
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={false}
                    className={`absolute inset-0 w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
                    onLoadedMetadata={() => console.log('Remote video: metadata loaded')}
                    onPlay={() => console.log('Remote video: playing')}
                    onError={(e) => console.error('Remote video error:', e)}
                  />
                  {!isStreaming && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }}>
                        <Sparkles size={28} className="text-white/30" />
                      </div>
                      <p className="text-gray-500 text-sm text-center font-medium">Swapped output appears here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Controls Panel */}
            <div className="w-80 flex flex-col gap-3 flex-shrink-0 overflow-y-auto">
              {/* Character - Prompt & Upload */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={16} className="text-purple-400" />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Character</span>
                </div>

                <div className="flex gap-2 mb-3">
                  <textarea
                    value={characterPrompt}
                    onChange={(e) => setCharacterPrompt(e.target.value)}
                    placeholder="Describe the character you want to become..."
                    className="flex-1 h-16 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 transition-all duration-300 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        generateCharacterFromPrompt();
                      }
                    }}
                  />
                  <button
                    onClick={generateCharacterFromPrompt}
                    disabled={isGeneratingCharacter || !characterPrompt.trim()}
                    className="px-4 rounded-xl bg-red-500/80 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    title="Generate character from prompt"
                  >
                    {isGeneratingCharacter ? (
                      <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                      <Send size={18} className="text-white" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {referenceImage ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-red-500/30 flex-shrink-0">
                      <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setReferenceImage(null)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-gray-300 hover:text-white transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="w-16 h-16 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 flex-shrink-0"
                    >
                      <Upload size={16} />
                      <span className="text-[8px] uppercase tracking-wider">Image</span>
                    </button>
                  )}
                  <div className="text-[10px] text-gray-500">
                    <p className="text-gray-400 mb-1">Or upload a reference image</p>
                  </div>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        setReferenceImage(dataUrl);
                        if (isStreaming) {
                          updateReferenceImage(dataUrl);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* Style Prompt (Optional) */}
              <div className="rounded-xl border border-white/5 p-4 flex-shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={16} className="text-white/60" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Style (Optional)</span>
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
                  placeholder="Optional: Add style modifiers (e.g., 'dramatic lighting')"
                  className="w-full bg-white/5 text-white placeholder-gray-600 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/20 rounded-xl p-3 border border-white/10 transition-all"
                  rows={2}
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

              {/* Debug Info - Shows connection status */}
              {debugInfo && (
                <div className="bg-black/50 border border-yellow-500/30 rounded-xl p-3 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Debug</span>
                  </div>
                  <p className="text-[10px] text-yellow-300 font-mono">{debugInfo}</p>
                </div>
              )}

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
