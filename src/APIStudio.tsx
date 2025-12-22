"use client";

import { useState } from 'react';
import { Search, Filter, ArrowRight, Terminal, Code, Play, Box } from 'lucide-react';
import './ReplicateStudio.css';

interface APIStudioProps {
  onClose?: () => void;
}

interface ModelCard {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'replicate' | 'meta';
  description: string;
  type: 'chat' | 'image' | 'video' | 'audio' | 'embedding';
  contextWindow?: string;
  pricing?: string;
  status: 'active' | 'beta' | 'deprecated';
}

const models: ModelCard[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'The latest GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more.',
    type: 'chat',
    contextWindow: '128k',
    pricing: '$10 / 1M tokens',
    status: 'active'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most powerful model for highly complex tasks. Top-level performance, intelligence, fluency, and understanding.',
    type: 'chat',
    contextWindow: '200k',
    pricing: '$15 / 1M tokens',
    status: 'active'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Mid-size multimodal model that scales across a wide range of tasks.',
    type: 'chat',
    contextWindow: '1M',
    pricing: 'Free (Preview)',
    status: 'beta'
  },
  {
    id: 'dall-e-3',
    name: 'DALL·E 3',
    provider: 'openai',
    description: 'Generates images from text descriptions, providing high quality and adherence to the prompt.',
    type: 'image',
    pricing: '$0.04 / image',
    status: 'active'
  },
  {
    id: 'flux-pro',
    name: 'FLUX.1 [pro]',
    provider: 'replicate',
    description: 'State-of-the-art image generation with top of the line prompt following and visual quality.',
    type: 'image',
    pricing: '$0.05 / image',
    status: 'active'
  },
  {
    id: 'whisper-v3',
    name: 'Whisper v3',
    provider: 'openai',
    description: 'General-purpose speech recognition model. It is trained on a large dataset of diverse audio.',
    type: 'audio',
    pricing: '$0.006 / min',
    status: 'active'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'meta',
    description: 'The most capable openly available LLM. Great for complex reasoning, coding, and creative writing.',
    type: 'chat',
    contextWindow: '8k',
    pricing: 'Varies',
    status: 'active'
  },
  {
    id: 'text-embedding-3-large',
    name: 'Text Embedding 3 Large',
    provider: 'openai',
    description: 'Most capable embedding model for both English and non-English tasks.',
    type: 'embedding',
    pricing: '$0.13 / 1M tokens',
    status: 'active'
  }
];

export default function APIStudio({ onClose }: APIStudioProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || model.type === selectedType;
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider;
    return matchesSearch && matchesType && matchesProvider;
  });

  const getProviderColor = (provider: string) => {
    switch(provider) {
      case 'openai': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'anthropic': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'google': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'replicate': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'meta': return 'bg-blue-400/10 text-blue-300 border-blue-400/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="replicate-studio-container">
      {/* Header */}
      <header className="replicate-header">
        <div className="header-left">
          <div className="logo-container">
            <Box className="w-6 h-6 text-blue-400" />
            <span className="logo-text">API Studio</span>
          </div>
        </div>
        <div className="header-right">
        </div>
      </header>

      {/* Main Content */}
      <main className="replicate-main">
        <div className="hero-section">
          <h1 className="hero-title">
            Discover and use <span className="gradient-text">AI Models</span>
          </h1>
          <p className="hero-subtitle">
            Explore a curated collection of the world's best AI models. 
            Test, integrate, and deploy with a unified API.
          </p>
          
          <div className="search-bar-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search models (e.g. 'GPT-4', 'Image generation', 'Embedding')..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-shortcut">⌘K</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <button 
              className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedType('all')}
            >
              All Types
            </button>
            <button 
              className={`filter-chip ${selectedType === 'chat' ? 'active' : ''}`}
              onClick={() => setSelectedType('chat')}
            >
              Chat
            </button>
            <button 
              className={`filter-chip ${selectedType === 'image' ? 'active' : ''}`}
              onClick={() => setSelectedType('image')}
            >
              Image
            </button>
            <button 
              className={`filter-chip ${selectedType === 'audio' ? 'active' : ''}`}
              onClick={() => setSelectedType('audio')}
            >
              Audio
            </button>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-group">
            <button 
              className={`filter-chip ${selectedProvider === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('all')}
            >
              All Providers
            </button>
            <button 
              className={`filter-chip ${selectedProvider === 'openai' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('openai')}
            >
              OpenAI
            </button>
            <button 
              className={`filter-chip ${selectedProvider === 'anthropic' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('anthropic')}
            >
              Anthropic
            </button>
            <button 
              className={`filter-chip ${selectedProvider === 'google' ? 'active' : ''}`}
              onClick={() => setSelectedProvider('google')}
            >
              Google
            </button>
          </div>
        </div>

        {/* Models Grid */}
        <div className="models-grid">
          {filteredModels.map((model) => (
            <div key={model.id} className="model-card group">
              <div className="model-card-header">
                <div className={`provider-badge ${getProviderColor(model.provider)}`}>
                  {model.provider}
                </div>
                <div className={`status-indicator ${model.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              </div>
              
              <h3 className="model-name">{model.name}</h3>
              <p className="model-description">{model.description}</p>
              
              <div className="model-meta">
                {model.contextWindow && (
                  <div className="meta-item">
                    <Terminal size={14} />
                    <span>{model.contextWindow} ctx</span>
                  </div>
                )}
                <div className="meta-item">
                  <Code size={14} />
                  <span>{model.type}</span>
                </div>
              </div>

              <div className="model-footer">
                <span className="pricing-text">{model.pricing}</span>
                <button className="try-btn group-hover:bg-white group-hover:text-black transition-colors">
                  <Play size={14} className="mr-1" />
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
