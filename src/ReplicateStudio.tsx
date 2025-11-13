import { useState } from 'react';
import './ReplicateStudio.css';
import Dock from './Dock';

interface ReplicateStudioProps {
  onClose: () => void;
}

interface ModelCard {
  id: string;
  name: string;
  author: string;
  description: string;
  image: string;
  runs: string;
  category: string;
}

const sampleModels: ModelCard[] = [
  {
    id: '1',
    name: 'FLUX.1 [pro]',
    author: 'black-forest-labs',
    description: 'State-of-the-art image generation with top of the line prompt following, visual quality, image detail and output diversity.',
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=300&fit=crop',
    runs: '58.2M',
    category: 'image'
  },
  {
    id: '2',
    name: 'Gemma 2 27B',
    author: 'google-deepmind',
    description: 'Google\'s newest and most capable model for text generation and reasoning tasks.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    runs: '23.5M',
    category: 'text'
  },
  {
    id: '3',
    name: 'Stable Video Diffusion',
    author: 'stability-ai',
    description: 'Generate short video clips from images using latent video diffusion.',
    image: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop',
    runs: '12.8M',
    category: 'video'
  },
  {
    id: '4',
    name: 'Whisper Large V3',
    author: 'openai',
    description: 'Convert audio speech to text with high accuracy in multiple languages.',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
    runs: '45.1M',
    category: 'audio'
  },
  {
    id: '5',
    name: 'LLaVA 34B',
    author: 'yorickvp',
    description: 'Visual instruction tuning towards large language and vision models.',
    image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=300&fit=crop',
    runs: '8.9M',
    category: 'multimodal'
  },
  {
    id: '6',
    name: 'RealESRGAN',
    author: 'xinntao',
    description: 'Upscale images by 4x using practical algorithms for image restoration.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    runs: '67.3M',
    category: 'image'
  },
  {
    id: '7',
    name: 'CodeLlama 70B',
    author: 'meta',
    description: 'Large language model that can use text prompts to generate and discuss code.',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop',
    runs: '19.2M',
    category: 'text'
  },
  {
    id: '8',
    name: 'Riffusion',
    author: 'riffusion',
    description: 'Generate music from text prompts using stable diffusion.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
    runs: '34.6M',
    category: 'audio'
  }
];

const actionCategories = [
  { icon: '🎨', title: 'Generate images', description: 'Create stunning visuals with AI' },
  { icon: '🎬', title: 'Caption videos', description: 'Automatically caption your videos' },
  { icon: '🗣️', title: 'Generate speech', description: 'Convert text to natural speech' },
  { icon: '✨', title: 'Upscale images', description: 'Enhance image resolution' },
  { icon: '🎵', title: 'Generate music', description: 'Create original music tracks' },
  { icon: '💬', title: 'Chat with AI', description: 'Interact with language models' },
  { icon: '🔍', title: 'Remove backgrounds', description: 'Clean image backgrounds' },
  { icon: '🎭', title: 'Restore photos', description: 'Fix old or damaged photos' }
];

export default function ReplicateStudio({ onClose }: ReplicateStudioProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAPIUsage, setShowAPIUsage] = useState(false);

  const tabs = ['Latest', 'Blog posts', 'Featured models', 'Popular', 'New releases'];

  const filteredModels = sampleModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dock items configuration for Replicate Studio
  const dockItems = [
    {
      icon: '\u2318',
      label: 'Command',
      onClick: () => {
        onClose();
      }
    },
    {
      icon: '\ud83d\udcc8',
      label: 'API Usage',
      onClick: () => {
        console.log('API Usage clicked');
        setShowAPIUsage(!showAPIUsage);
      }
    },
    {
      icon: '\u25c8',
      label: 'Search',
      onClick: () => {
        console.log('Search clicked');
      }
    },
    {
      icon: '\u2699',
      label: 'Settings',
      onClick: () => {
        console.log('Settings clicked');
      }
    }
  ];

  return (
    <div className="replicate-studio">
      {/* Header */}
      <header className="replicate-header">
        <div className="replicate-header-content">
          <div className="replicate-logo">
            <span className="replicate-logo-icon">🔮</span>
            <span className="replicate-logo-text">Replicate Studio</span>
          </div>
          <nav className="replicate-nav">
            <a href="#" className="replicate-nav-link">Home</a>
            <a href="#" className="replicate-nav-link">Explore</a>
            <a href="#" className="replicate-nav-link">Docs</a>
            <a href="#" className="replicate-nav-link">Pricing</a>
          </nav>
          <div className="replicate-header-actions">
            <button className="replicate-btn-secondary">Sign in</button>
            <button className="replicate-btn-primary">Get started</button>
            {onClose && (
              <button className="replicate-close-btn" onClick={onClose}>✕</button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="replicate-main">
        {/* Hero Section */}
        <section className="replicate-hero">
          <h1 className="replicate-hero-title">Explore</h1>
          <p className="replicate-hero-subtitle">
            Discover thousands of AI models. From image generation to language processing.
          </p>
        </section>

        {/* Tab Navigation */}
        <section className="replicate-tabs-section">
          <div className="replicate-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`replicate-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="replicate-search-container">
            <input
              type="text"
              className="replicate-search"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="replicate-search-icon">🔍</span>
          </div>
        </section>

        {/* Models Grid */}
        <section className="replicate-models-section">
          <div className="replicate-models-grid">
            {filteredModels.map((model) => (
              <article key={model.id} className="replicate-model-card">
                <div className="replicate-model-image">
                  <img src={model.image} alt={model.name} loading="lazy" />
                  <div className="replicate-model-overlay">
                    <button className="replicate-model-run-btn">Run Model</button>
                  </div>
                </div>
                <div className="replicate-model-content">
                  <div className="replicate-model-header">
                    <h3 className="replicate-model-name">{model.name}</h3>
                    <span className="replicate-model-runs">{model.runs} runs</span>
                  </div>
                  <p className="replicate-model-author">by {model.author}</p>
                  <p className="replicate-model-description">{model.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* I Want To Section */}
        <section className="replicate-actions-section">
          <h2 className="replicate-section-title">I want to...</h2>
          <div className="replicate-actions-grid">
            {actionCategories.map((action, index) => (
              <button key={index} className="replicate-action-card">
                <span className="replicate-action-icon">{action.icon}</span>
                <div className="replicate-action-content">
                  <h3 className="replicate-action-title">{action.title}</h3>
                  <p className="replicate-action-description">{action.description}</p>
                </div>
                <span className="replicate-action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="replicate-footer">
        <div className="replicate-footer-content">
          <div className="replicate-footer-links">
            <a href="#" className="replicate-footer-link">Home</a>
            <a href="#" className="replicate-footer-link">About</a>
            <a href="#" className="replicate-footer-link">Changelog</a>
            <a href="#" className="replicate-footer-link">Join us</a>
            <a href="#" className="replicate-footer-link">Terms</a>
            <a href="#" className="replicate-footer-link">Privacy</a>
            <a href="#" className="replicate-footer-link">Status</a>
            <a href="#" className="replicate-footer-link">Support</a>
          </div>
          <div className="replicate-footer-brand">
            <p>Powered by Omi AI • Exploring AI models with intelligence</p>
          </div>
        </div>
      </footer>

      {/* Dock Menu */}
      <Dock items={dockItems} />
    </div>
  );
}
