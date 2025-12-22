"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DotGrid from './DotGrid';

interface AIWorkflowsPageProps {
  onClose?: () => void;
}

interface Component {
  id: string;
  name: string;
  category: string;
  icon: string;
}

const componentCategories = [
  {
    name: 'Base',
    components: [
      { id: 'web-search', name: 'Web Search', icon: '🔍' },
      { id: 'web-scrape', name: 'Web Scrape', icon: '🌐' },
      { id: 'text-input', name: 'Text Input', icon: '📝' },
      { id: 'number-input', name: 'Number Input', icon: '🔢' }
    ]
  },
  {
    name: 'Advanced',
    components: [
      { id: 'llm', name: 'LLM', icon: '🤖' },
      { id: 'content-cleanup', name: 'Content Cleanup', icon: '✨' },
      { id: 'summarize', name: 'Comprehensive Summary', icon: '📄' },
      { id: 'seo-article', name: 'SEO Article Outline', icon: '📰' }
    ]
  },
  {
    name: 'Tools',
    components: [
      { id: 'json-parser', name: 'JSON Parser', icon: '{ }' },
      { id: 'text-splitter', name: 'Text Splitter', icon: '✂️' },
      { id: 'data-merge', name: 'Data Merge', icon: '🔗' }
    ]
  },
  {
    name: 'Logic',
    components: [
      { id: 'if-else', name: 'If/Else', icon: '🔀' },
      { id: 'loop', name: 'Loop', icon: '🔄' },
      { id: 'filter', name: 'Filter', icon: '🔍' }
    ]
  },
  {
    name: 'OpenAPI',
    components: []
  },
  {
    name: 'RAG Data',
    components: [
      { id: 'vector-store', name: 'Vector Store', icon: '📊' },
      { id: 'embeddings', name: 'Embeddings', icon: '🧮' }
    ]
  }
];

export default function AIWorkflowsPage({ onClose }: AIWorkflowsPageProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Base');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Base', 'Advanced']);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/command-hub');
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="workflow-builder">
      {/* Left Sidebar - Components Panel */}
      <aside className="workflow-sidebar">
        <div className="workflow-sidebar-header">
          <div className="workflow-logo">
            <span className="workflow-logo-icon">⚡</span>
            <span className="workflow-logo-text">Components</span>
          </div>
        </div>

        <div className="workflow-search-container">
          <input
            type="text"
            className="workflow-search"
            placeholder="Search components"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="workflow-search-icon">🔍</span>
        </div>

        <nav className="workflow-categories">
          {componentCategories.map((category) => (
            <div key={category.name} className="workflow-category">
              <button
                className={`workflow-category-header ${expandedCategories.includes(category.name) ? 'expanded' : ''}`}
                onClick={() => toggleCategory(category.name)}
              >
                <span className="workflow-category-name">{category.name}</span>
                <span className="workflow-category-arrow">›</span>
              </button>
              {expandedCategories.includes(category.name) && (
                <div className="workflow-category-items">
                  {category.components.length > 0 ? (
                    category.components
                      .filter(comp =>
                        comp.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((component) => (
                        <button key={component.id} className="workflow-component-item">
                          <span className="workflow-component-icon">{component.icon}</span>
                          <span className="workflow-component-name">{component.name}</span>
                        </button>
                      ))
                  ) : (
                    <div className="workflow-empty-category">
                      <button className="workflow-add-button">+</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Canvas Area */}
      <main className="workflow-canvas">
        <header className="workflow-header">
          <div className="workflow-header-left">
            <span className="workflow-auto-save">
              <span className="workflow-save-icon">☁️</span>
              Auto-Saved 15:32:28
            </span>
          </div>
          <div className="workflow-header-right">
            <button className="workflow-btn workflow-btn-secondary">
              <span className="workflow-btn-icon">🐛</span>
              Debug Off
            </button>
            <button className="workflow-btn workflow-btn-secondary">
              <span className="workflow-btn-icon">▶️</span>
              Test
            </button>
            <button className="workflow-btn workflow-btn-primary">Upgrade</button>
            <button className="workflow-btn workflow-btn-secondary">
              <span className="workflow-btn-icon">🚀</span>
              Deploy
            </button>
          </div>
        </header>

        <div className="workflow-canvas-content drag-drop-area">
          <div className="workflow-overlay">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
              <h2 className="workflow-overlay-title">Build Your Workflow</h2>
              <p className="workflow-overlay-desc">Drag and drop modules here to create your custom AI workflow. You can also start from a template.</p>
              <div className="workflow-overlay-actions pointer-events-auto">
                <button className="workflow-overlay-btn primary">Get Started</button>
                <button className="workflow-overlay-btn">Choose Template</button>
              </div>
            </div>
          </div>
        </div>

        <footer className="workflow-footer">
          <div className="workflow-footer-actions">
            <button className="workflow-footer-btn" title="Collapse">
              <span className="workflow-footer-icon">✕</span>
              Collapse
            </button>
            <button className="workflow-footer-btn" title="Prettify">
              <span className="workflow-footer-icon">✨</span>
              Prettify
            </button>
            <button className="workflow-footer-btn" title="Inspect">
              <span className="workflow-footer-icon">🔍</span>
              Inspect
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
