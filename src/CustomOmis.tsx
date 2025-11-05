import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from './Auth';
import './CustomOmis.css';
import * as ragService from './ragService';

interface CustomOmisProps {
  onClose?: () => void;
}

interface CustomOmi {
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

const CustomOmis: React.FC<CustomOmisProps> = ({ onClose }) => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customOmis, setCustomOmis] = useState<CustomOmi[]>([]);
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
    }
  }, [session?.user?.id, activeTab, selectedBot]);

  const loadBots = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const bots = await ragService.loadCustomOmis(session.user.id);
      setCustomOmis(bots);
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
    
    if (!selectedBot && customOmis.length === 0) {
      alert('Please create a bot first before uploading documents');
      return;
    }

    const botId = selectedBot || customOmis[0]?.id;
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
    if (!newBotName.trim() || !session?.user?.id) return;
    
    try {
      await ragService.createCustomOmi(session.user.id, newBotName, newBotDescription);
      setNewBotName('');
      setNewBotDescription('');
      setShowCreateModal(false);
      // Reload bots to show the new one
      await loadBots();
    } catch (error: any) {
      console.error('Failed to create bot:', error);
      alert(`Failed to create bot: ${error.message}`);
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

  return (
    <div className="custom-omis-container" ref={containerRef}>
      <header className="custom-omis-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">Custom Omi Training</span>
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
          {onClose && (
            <button className="close-btn" onClick={onClose}>✕</button>
          )}
        </div>
      </header>

      <div className="custom-omis-main">
        {activeTab === 'bots' && (
          <div className="bots-tab">
            <div className="tab-header">
              <div>
                <h2 className="tab-title">Your Custom Omi Bots</h2>
                <p className="tab-subtitle">Create and manage specialized AI assistants trained on your data</p>
              </div>
              <button className="create-bot-btn" onClick={() => setShowCreateModal(true)}>
                <span className="btn-icon">+</span>
                Create New Bot
              </button>
            </div>
            <div className="bots-grid">
              {customOmis.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                  <p>No bots yet. Create your first custom Omi bot to get started!</p>
                </div>
              ) : (
                customOmis.map((bot) => (
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
                      <button className="bot-action-btn"><span>⚙️</span> Configure</button>
                      <button className="bot-action-btn"><span>💬</span> Test</button>
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
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
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
                  accept=".pdf,.txt,.md,.json,.csv"
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
                            <button className="action-btn delete" title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="upload-instructions">
              <h4>Supported File Types:</h4>
              <div className="file-types">
                <span className="file-type">PDF</span>
                <span className="file-type">TXT</span>
                <span className="file-type">MD</span>
                <span className="file-type">JSON</span>
                <span className="file-type">CSV</span>
              </div>
              <p className="instructions-text">
                Documents are automatically chunked and embedded using OpenAI embeddings. 
                Each chunk is stored with vector representations for semantic search and RAG.
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
            <h2>Create New Custom Omi</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Bot Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Customer Support Assistant"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Describe the purpose and specialty of this bot..."
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="modal-btn cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="modal-btn create"
                  onClick={handleCreateBot}
                  disabled={!newBotName.trim()}
                >
                  Create Bot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOmis;
