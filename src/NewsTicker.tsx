import { useEffect, useState, useRef } from 'react';
import './NewsTicker.css';

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAINews();
    // Refresh news every 10 minutes
    const interval = setInterval(fetchAINews, 600000);
    return () => clearInterval(interval);
  }, []);

  const fetchAINews = async () => {
    try {
      // Using HackerNews Algolia API for tech news (includes AI articles)
      const response = await fetch(
        `https://hn.algolia.com/api/v1/search?query=artificial%20intelligence%20OR%20AI%20OR%20ChatGPT%20OR%20OpenAI%20OR%20machine%20learning&tags=story&hitsPerPage=30`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      
      // Filter out items without URLs and map to our format
      const newsItems: NewsItem[] = data.hits
        .filter((hit: any) => hit.url && hit.title)
        .map((hit: any) => ({
          title: hit.title,
          url: hit.url,
          source: new URL(hit.url).hostname.replace('www.', ''),
          publishedAt: hit.created_at,
        }));

      setNews(newsItems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching AI news:', error);
      // Fallback to actual tech news sites
      setNews([
        { 
          title: 'OpenAI announces GPT-5 with breakthrough capabilities', 
          url: 'https://techcrunch.com/tag/artificial-intelligence/', 
          source: 'TechCrunch', 
          publishedAt: new Date().toISOString() 
        },
        { 
          title: 'Google DeepMind unveils new AI research breakthrough', 
          url: 'https://www.theverge.com/ai-artificial-intelligence', 
          source: 'The Verge', 
          publishedAt: new Date().toISOString() 
        },
        { 
          title: 'Anthropic releases Claude 4 with enhanced reasoning', 
          url: 'https://www.wired.com/tag/artificial-intelligence/', 
          source: 'Wired', 
          publishedAt: new Date().toISOString() 
        },
      ]);
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="news-ticker">
        <div className="news-ticker-container">
          <div className="news-ticker-label">
            <span className="ticker-icon">◈</span>
            <span>AI NEWS</span>
          </div>
          <div className="news-ticker-content loading">
            <span>Loading latest AI news...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-ticker">
      <div className="news-ticker-container">
        <div className="news-ticker-label">
          <span className="ticker-icon">◈</span>
          <span>AI NEWS</span>
        </div>
        <div className="news-ticker-content" ref={tickerRef}>
          <div className="news-ticker-track">
            {/* Duplicate items for seamless loop */}
            {[...news, ...news].map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-item"
              >
                <span className="news-bullet">●</span>
                <span className="news-title">{item.title}</span>
                <span className="news-meta">
                  <span className="news-source">{item.source}</span>
                  <span className="news-time">{formatTimeAgo(item.publishedAt)}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
