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
      // Using NewsAPI.org free tier (100 requests/day)
      const apiKey = 'ba7bbf12cdac43d8bb850a7926e8ce5d'; // Free tier key
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+OpenAI+OR+ChatGPT+OR+Google+AI&sortBy=publishedAt&language=en&pageSize=20&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      const newsItems: NewsItem[] = data.articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
      }));

      setNews(newsItems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching AI news:', error);
      // Fallback news items if API fails
      setNews([
        { title: 'Stay updated with the latest AI developments', url: '#', source: 'Omi AI', publishedAt: new Date().toISOString() },
        { title: 'Artificial Intelligence continues to evolve', url: '#', source: 'Tech News', publishedAt: new Date().toISOString() },
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
