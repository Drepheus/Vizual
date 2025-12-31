"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '@/context/auth-context';
import * as ragService from './ragService';
import { chatWithVertexRAG } from './ragService';

interface CustomVizualsProps {
  onClose?: () => void;
}

interface CustomVizual {
  id: string;
  name: string;
  description: string;
  status: 'training' | 'ready' | 'idle';
  documentsCount?: number;
  embeddingsCount?: number;
  accuracy: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'indexed' | 'failed';
  chunkCount: number;
}

const DOCUMENT_ACCEPT_STRING = '.txt,.md,.markdown,.json,.yaml,.yml,.csv,.js,.jsx,.ts,.tsx,.py,.cs,.html,.htm,.css';
const DOCUMENT_TYPE_BADGES = ['TXT', 'MD', 'JSON', 'YAML', 'CSV', 'JS/TS', 'PY/CS', 'HTML/CSS'];

const CustomVizuals: React.FC<CustomVizualsProps> = ({ onClose }) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'bots' | 'documents' | 'training'>('bots');
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newBotName, setNewBotName] = useState('');
  const [newBotDescription, setNewBotDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingBot, setIsCreatingBot] = useState(false);
  const [createBotError, setCreateBotError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat State
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [customVizuals, setCustomVizuals] = useState<CustomVizual[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Load bots on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadBots();
    }
  }, [session?.user?.id]);

  // Load documents when a bot is selected or tab changes
  useEffect(() => {
    if (session?.user?.id && activeTab === 'documents') {
      loadDocuments();

      // Auto-refresh every 5 seconds to check processing status
      const interval = setInterval(() => {
        loadDocuments();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [session?.user?.id, activeTab, selectedBot]);

  const loadBots = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const bots = await ragService.loadCustomVizuals(session.user.id);
      setCustomVizuals(bots);
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const docs = await ragService.loadDocuments(selectedBot || undefined);
      setDocuments(docs.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedAt: doc.uploaded_at,
        status: doc.status,
        chunkCount: doc.chunk_count
      })));
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!selectedBot && customVizuals.length === 0) {
      alert('Please create a bot first before uploading documents');
      return;
    }

    const botId = selectedBot || customVizuals[0]?.id;
    if (!botId) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      try {
        await ragService.uploadDocument(file, botId, (status) => {
          console.log(status);
        });
      } catch (error: any) {
        console.error('Upload failed:', error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setIsUploading(false);
    // Reload documents to show the new ones
    await loadDocuments();

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateBot = async () => {
    if (!newBotName.trim()) {
      setCreateBotError('Please enter a bot name.');
      return;
    }

    if (!session?.user?.id) {
      setCreateBotError('You must be signed in to create a bot.');
      return;
    }

    setIsCreatingBot(true);
    setCreateBotError(null);
    try {
      const newBot = await ragService.createCustomVizual(session.user.id, newBotName, newBotDescription);
      setNewBotName('');
      setNewBotDescription('');
      setShowCreateModal(false);
      await loadBots();
      setSelectedBot(newBot.id);
      setActiveTab('documents');
    } catch (error: any) {
      console.error('Failed to create bot:', error);
      setCreateBotError(error.message || 'Failed to create bot.');
    } finally {
      setIsCreatingBot(false);
    }
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to delete "${docName}"?`)) return;

    try {
      await ragService.deleteDocument(docId);
      alert('Document deleted successfully');
      await loadDocuments();
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      alert(`Failed to delete document: ${error.message}`);
    }
  };

  const handleDeleteBot = async (botId: string, botName: string) => {
    if (!confirm(`Are you sure you want to delete "${botName}"? This will also delete all associated documents.`)) return;

    try {
      await ragService.deleteBot(botId);
      alert('Bot deleted successfully');
      if (selectedBot === botId) {
        setSelectedBot(null);
      }
      await loadBots();
      await loadDocuments();
    } catch (error: any) {
      console.error('Failed to delete bot:', error);
      alert(`Failed to delete bot: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#4ade80';
      case 'training': return '#fbbf24';
      case 'processing': return '#60a5fa';
      case 'indexed': return '#4ade80';
      case 'failed': return '#f87171';
      default: return '#94a3b8';
    }
  };

  const handleTestBot = (bot: CustomVizual) => {
    setSelectedBot(bot.id);
    setChatHistory([]);
    setShowChatModal(true);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMsg }] }]);
    setIsChatLoading(true);

    try {
      // Create a temporary placeholder for the model response
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      await chatWithVertexRAG(
        userMsg,
        chatHistory, // Pass previous history
        (chunk) => {
          setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'model') {
              lastMsg.parts[0].text += chunk;
            }
            return newHistory;
          });
          // Scroll to bottom
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastMsg = newHistory[newHistory.length - 1];
        if (lastMsg.role === 'model' && !lastMsg.parts[0].text) {
          lastMsg.parts[0].text = 'Error: Failed to get response from Vertex AI. Please check your connection and try again.';
        }
        return newHistory;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="custom-vizuals-container" ref={containerRef}>
      <header className="custom-vizuals-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">Custom Vizual Training</span>
          </div>
          <nav className="header-tabs">
            <button
              className={'header-tab' + (activeTab === 'bots' ? ' active' : '')}
              onClick={() => setActiveTab('bots')}
            >
              <span className="tab-icon">🤖</span>
              My Bots
            </button>
            <button
              className={'header-tab' + (activeTab === 'documents' ? ' active' : '')}
              onClick={() => setActiveTab('documents')}
            >
              <span className="tab-icon">📄</span>
              Knowledge Base
            </button>
            <button
              className={'header-tab' + (activeTab === 'training' ? ' active' : '')}
              onClick={() => setActiveTab('training')}
            >
              <span className="tab-icon">⚡</span>
              Training Dashboard
            </button>
          </nav>
        </div>
        <div className="header-right">
        </div>
      </header>

      <div className="custom-vizuals-main">
        {activeTab === 'bots' && (
          <div className="bots-tab">
            <div className="tab-header">
              <div>
                <h2 className="tab-title">Your Custom Vizual Bots</h2>
                <p className="tab-subtitle">Create and manage specialized AI assistants trained on your data</p>
              </div>
              <button className="create-bot-btn" onClick={() => setShowCreateModal(true)}>
                <span className="btn-icon">+</span>
                Create New Bot
              </button>
            </div>
            <div className="bots-grid">
              {customVizuals.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 40px',
                  background: 'rgba(16,16,16,0.6)',
                  borderRadius: '16px',
                  border: '1px solid rgba(192,192,192,0.15)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <h3 style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontSize: '20px', fontWeight: '400' }}>
                    Create Your First Custom Vizual Bot
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                    Custom Vizual bots are AI assistants trained on your own documents using RAG (Retrieval-Augmented Generation).
                    They can answer questions based on your uploaded knowledge base.
                  </p>
                  <button
                    className="create-bot-btn"
                    onClick={() => setShowCreateModal(true)}
                    style={{ fontSize: '16px', padding: '14px 28px' }}
                  >
                    <span className="btn-icon">+</span>
                    Create Your First Bot
                  </button>
                </div>
              ) : (
                customVizuals.map((bot) => (
                  <div key={bot.id} className={'bot-card' + (selectedBot === bot.id ? ' selected' : '')} onClick={() => setSelectedBot(bot.id)}>
                    <div className="bot-card-header">
                      <div className="bot-icon">🤖</div>
                      <div className="bot-status-badge" style={{ backgroundColor: getStatusColor(bot.status) }}>{bot.status}</div>
                    </div>
                    <h3 className="bot-name">{bot.name}</h3>
                    <p className="bot-description">{bot.description}</p>
                    <div className="bot-stats">
                      <div className="bot-stat"><span className="stat-label">Documents</span><span className="stat-value">{bot.documentsCount || 0}</span></div>
                      <div className="bot-stat"><span className="stat-label">Embeddings</span><span className="stat-value">{bot.embeddingsCount || 0}</span></div>
                      <div className="bot-stat"><span className="stat-label">Accuracy</span><span className="stat-value">{bot.accuracy || 0}%</span></div>
                    </div>
                    <div className="bot-card-actions">
                      <button
                        className="bot-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBot(bot.id);
                          setActiveTab('documents');
                        }}
                      >
                        <span>📄</span> Manage Docs
                      </button>
                      <button
                        className="bot-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestBot(bot);
                        }}
                      >
                        <span>💬</span> Test Bot
                      </button>
                      <button
                        className="bot-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBot(bot.id, bot.name);
                        }}
                        title="Delete bot and all documents"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-tab">
            <div className="tab-header">
              <div>
                <h2 className="tab-title">Knowledge Base Documents</h2>
                <p className="tab-subtitle">Upload and manage training documents for RAG fine-tuning</p>
                {selectedBot && customVizuals.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(192,192,192,0.1)', borderRadius: '8px', display: 'inline-block' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>Selected Bot: </span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                      {customVizuals.find(b => b.id === selectedBot)?.name || 'Unknown'}
                    </span>
                  </div>
                )}
                {!selectedBot && customVizuals.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '8px', display: 'inline-block' }}>
                    <span style={{ color: 'rgba(255,193,7,0.9)', fontSize: '12px' }}>⚠️ Select a bot first to upload documents</span>
                  </div>
                )}
                {customVizuals.length === 0 && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', display: 'inline-block' }}>
                    <span style={{ color: 'rgba(248,113,113,0.9)', fontSize: '12px' }}>❌ Create a bot first in the "My Bots" tab</span>
                  </div>
                )}
              </div>
              <div className="header-actions">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="upload-btn"
                  onClick={() => {
                    if (!selectedBot && customVizuals.length > 0) {
                      alert('Please select a bot first by clicking on it in the "My Bots" tab, then come back here to upload documents.');
                      return;
                    }
                    if (customVizuals.length === 0) {
                      alert('Please create a bot first in the "My Bots" tab before uploading documents.');
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading || customVizuals.length === 0}
                  style={customVizuals.length === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {isUploading ? (
                    <>
                      <div className="spinner-small"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📤</span>
                      Upload Documents
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={DOCUMENT_ACCEPT_STRING}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="documents-table-container">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Chunks</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                        No documents yet. Upload your first document to start training!
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="doc-name-cell">
                            <span className="doc-icon">📄</span>
                            {doc.name}
                          </div>
                        </td>
                        <td><span className="doc-type-badge">{doc.type}</span></td>
                        <td>{formatFileSize(doc.size)}</td>
                        <td>{doc.chunkCount || '-'}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(doc.status) }}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td>{formatDate(doc.uploadedAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn" title="View">👁️</button>
                            <button className="action-btn" title="Download">⬇️</button>
                            <button
                              className="action-btn delete"
                              title="Delete"
                              onClick={() => handleDeleteDocument(doc.id, doc.name)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="upload-instructions">
              <h4>Supported File Types (plain text only, &lt; 1&nbsp;MB each):</h4>
              <div className="file-types">
                {DOCUMENT_TYPE_BADGES.map((badge) => (
                  <span key={badge} className="file-type">{badge}</span>
                ))}
              </div>
              <p className="instructions-text">
                Upload lightweight text sources (docs, JSON, YAML, code, CSV, HTML/CSS). Files are chunked
                and embedded automatically for semantic search—binary formats like PDF/Word are not supported.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="training-tab">
            <div className="tab-header">
              <div>
                <h2 className="tab-title">Training Dashboard</h2>
                <p className="tab-subtitle">Monitor and configure RAG training processes</p>
              </div>
            </div>

            <div className="training-grid">
              <div className="training-card">
                <div className="card-icon">📊</div>
                <h3>Embedding Generation</h3>
                <div className="training-stats">
                  <div className="stat-row">
                    <span>Total Documents:</span>
                    <span className="stat-value">{documents.length}</span>
                  </div>
                  <div className="stat-row">
                    <span>Processed Chunks:</span>
                    <span className="stat-value">{documents.reduce((acc, doc) => acc + doc.chunkCount, 0)}</span>
                  </div>
                  <div className="stat-row">
                    <span>Pending:</span>
                    <span className="stat-value">{documents.filter(d => d.status === 'processing').length}</span>
                  </div>
                </div>
                <button className="training-action-btn">
                  <span>⚡</span> Start Batch Processing
                </button>
              </div>

              <div className="training-card">
                <div className="card-icon">🎯</div>
                <h3>Vector Database</h3>
                <div className="training-stats">
                  <div className="stat-row">
                    <span>Total Vectors:</span>
                    <span className="stat-value">2,140</span>
                  </div>
                  <div className="stat-row">
                    <span>Dimensions:</span>
                    <span className="stat-value">1536</span>
                  </div>
                  <div className="stat-row">
                    <span>Index Status:</span>
                    <span className="stat-value ready">Active</span>
                  </div>
                </div>
                <button className="training-action-btn">
                  <span>🔄</span> Rebuild Index
                </button>
              </div>

              <div className="training-card">
                <div className="card-icon">🧠</div>
                <h3>Fine-Tuning</h3>
                <div className="training-stats">
                  <div className="stat-row">
                    <span>Active Jobs:</span>
                    <span className="stat-value">1</span>
                  </div>
                  <div className="stat-row">
                    <span>Completed:</span>
                    <span className="stat-value">5</span>
                  </div>
                  <div className="stat-row">
                    <span>Avg. Accuracy:</span>
                    <span className="stat-value">91%</span>
                  </div>
                </div>
                <button className="training-action-btn">
                  <span>🚀</span> Start Fine-Tuning
                </button>
              </div>
            </div>

            <div className="rag-config-section">
              <h3>RAG Configuration</h3>
              <div className="config-grid">
                <div className="config-item">
                  <label>Chunk Size</label>
                  <input type="number" defaultValue={1000} />
                  <span className="config-hint">Tokens per chunk</span>
                </div>
                <div className="config-item">
                  <label>Chunk Overlap</label>
                  <input type="number" defaultValue={200} />
                  <span className="config-hint">Overlapping tokens</span>
                </div>
                <div className="config-item">
                  <label>Top K Results</label>
                  <input type="number" defaultValue={5} />
                  <span className="config-hint">Retrieval results</span>
                </div>
                <div className="config-item">
                  <label>Similarity Threshold</label>
                  <input type="number" step="0.01" defaultValue={0.7} />
                  <span className="config-hint">Min similarity score</span>
                </div>
              </div>
              <button className="save-config-btn">
                <span>💾</span> Save Configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Custom Vizual</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Bot Name</label>
                <input
                  type="text"
                  placeholder="e.g., Customer Support Assistant"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  disabled={isCreatingBot}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe the purpose and specialty of this bot..."
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  rows={4}
                  disabled={isCreatingBot}
                />
              </div>
              {createBotError && (
                <div style={{ color: '#f87171', marginBottom: 12, fontSize: 14 }}>{createBotError}</div>
              )}
              <div className="modal-actions">
                <button
                  className="modal-btn cancel"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreatingBot}
                >
                  Cancel
                </button>
                <button
                  className="modal-btn create"
                  onClick={handleCreateBot}
                  disabled={!newBotName.trim() || isCreatingBot}
                >
                  {isCreatingBot ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Chat / Test Modal */}
      {showChatModal && (
        <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="modal-content chat-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Test Bot: {customVizuals.find(b => b.id === selectedBot)?.name}</h2>
              <button onClick={() => setShowChatModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="chat-history" style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '8px' }}>
              {chatHistory.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: '40px' }}>
                  Start a conversation to test your RAG bot.
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isChatLoading && chatHistory[chatHistory.length - 1]?.role === 'user' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question about your documents..."
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white' }}
                disabled={isChatLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatLoading}
                style={{ padding: '0 20px', borderRadius: '8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', opacity: (!chatInput.trim() || isChatLoading) ? 0.5 : 1 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomVizuals;
