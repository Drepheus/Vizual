"use client";
import { useEffect, useRef } from 'react';
import { useState } from 'react';

interface ActivityItem {
  username: string;
  action: string;
  timestamp: string;
}

export default function NewsTicker() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateActivities();
    // Generate new activities every 30 seconds
    const interval = setInterval(generateActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateActivities = () => {
    const firstNames = [
      'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
      'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
      'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
      'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
      'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Edward', 'Stephanie',
      'Ronald', 'Rebecca', 'Timothy', 'Sharon', 'Jason', 'Laura', 'Jeffrey', 'Cynthia', 'Ryan', 'Dorothy',
      'Jacob', 'Amy', 'Gary', 'Kathleen', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Brenda',
      'Stephen', 'Emma', 'Larry', 'Anna', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Samantha',
      'Benjamin', 'Katherine', 'Samuel', 'Christine', 'Gregory', 'Debra', 'Frank', 'Rachel', 'Alexander', 'Catherine',
      'Raymond', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Ruth', 'Dennis', 'Maria', 'Jerry', 'Heather',
      'Tyler', 'Diane', 'Aaron', 'Virginia', 'Jose', 'Julie', 'Adam', 'Joyce', 'Henry', 'Victoria',
      'Nathan', 'Olivia', 'Douglas', 'Kelly', 'Zachary', 'Christina', 'Peter', 'Lauren', 'Kyle', 'Joan',
      'Walter', 'Evelyn', 'Ethan', 'Judith', 'Jeremy', 'Megan', 'Harold', 'Cheryl', 'Keith', 'Andrea',
      'Christian', 'Hannah', 'Roger', 'Martha', 'Noah', 'Jacqueline', 'Gerald', 'Frances', 'Carl', 'Gloria',
      'Terry', 'Ann', 'Sean', 'Teresa', 'Austin', 'Kathryn', 'Arthur', 'Sara', 'Lawrence', 'Janice',
      'Jesse', 'Jean', 'Dylan', 'Alice', 'Bryan', 'Madison', 'Joe', 'Doris', 'Jordan', 'Julia',
      'Billy', 'Judy', 'Bruce', 'Grace', 'Gabriel', 'Denise', 'Logan', 'Marilyn', 'Albert', 'Amber',
      'Willie', 'Danielle', 'Alan', 'Brittany', 'Juan', 'Rose', 'Wayne', 'Diana', 'Elijah', 'Abigail',
      'Randy', 'Natalie', 'Roy', 'Jane', 'Vincent', 'Lori', 'Ralph', 'Alexis', 'Eugene', 'Tiffany',
      'Russell', 'Kayla', 'Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Jamie', 'Taylor', 'Morgan'
    ];

    const lastInitials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    const techSuffixes = [
      'Dev', 'Design', 'Code', 'AI', 'Tech', 'Studio', 'Labs', 'Systems', 'Web', 'App',
      'Soft', 'Net', 'Data', 'Cloud', 'Cyber', 'Pixel', 'Vector', 'Logic', 'Flow', 'Stack'
    ];

    const actions = [
      'just trained a Custom Vizual',
      'is chatting with Vizual Chat',
      'just generated a 4K image in Media Studio',
      'just Upgraded to the Pro Plan!',
      'just created a new AI Workflow',
      'just generated a stunning video with Veo',
      'just completed a deep web search',
      'just custvizualzed their AI assistant',
      'just exported media from the gallery',
      'just discovered a new feature',
      'just integrated a new API',
      'just automated a complex task',
      'just analyzed financial data with AI',
      'just created research content',
      'just generated Python code snippets',
      'just trained a specialized model',
      'just built a business workflow',
      'just designed a creative project',
      'just optimized their AI settings',
      'just shared their Custom Vizual',
      'just completed an AI task',
      'just explored the Command Hub',
      'just unlocked advanced features',
      'just personalized their workspace',
      'just generated multiple images',
      'just created AI-powered content',
      'just enhanced their workflow',
      'just automated data processing',
      'just built an intelligent system',
      'just mastered a new AI tool',
      'just wrote a blog post with AI',
      'just planned a travel itinerary',
      'just debugged a React application',
      'just learned a new skill',
      'just created a marketing campaign',
      'just generated a 3D asset',
      'just composed a song',
      'just edited a video',
      'just transcribed a meeting',
      'just organized their schedule',
      'just brainstormed ideas',
      'just solved a complex problem',
      'just visualized data',
      'just automated an email sequence',
      'just built a landing page',
      'just created a presentation',
      'just wrote a poem',
      'just generated a story',
      'just simulated a scenario',
      'just forecasted trends',
      'just optimized a database',
      'just secured their account',
      'just connected a new integration',
      'just invited a team member'
    ];

    // Generate 100 random activities for a longer, more varied loop
    const generatedActivities: ActivityItem[] = [];
    for (let i = 0; i < 100; i++) {
      let randomUsername = '';
      const nameStyle = Math.random();

      // Randomly choose a username style
      if (nameStyle < 0.4) {
        // Style 1: First Name + Last Initial (e.g., "Sarah J.")
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastInitial = lastInitials[Math.floor(Math.random() * lastInitials.length)];
        randomUsername = `${firstName} ${lastInitial}.`;
      } else if (nameStyle < 0.7) {
        // Style 2: First Name + Number (e.g., "David2024", "Alex_99")
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const number = Math.floor(Math.random() * 1000);
        const separator = Math.random() > 0.5 ? '_' : '';
        randomUsername = `${firstName}${separator}${number}`;
      } else {
        // Style 3: First Name + Tech Suffix (e.g., "Jessica_Design")
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const suffix = techSuffixes[Math.floor(Math.random() * techSuffixes.length)];
        const separator = Math.random() > 0.5 ? '_' : '';
        randomUsername = `${firstName}${separator}${suffix}`;
      }

      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomMinutesAgo = Math.floor(Math.random() * 60) + 1;
      
      generatedActivities.push({
        username: randomUsername,
        action: randomAction,
        timestamp: new Date(Date.now() - randomMinutesAgo * 60000).toISOString()
      });
    }

    setActivities(generatedActivities);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (activities.length === 0) {
    return (
      <div className="news-ticker">
        <div className="news-ticker-container">
          <div className="news-ticker-label">
            <span className="ticker-icon">◈</span>
            <span>LIVE ACTIVITY</span>
          </div>
          <div className="news-ticker-content loading">
            <span>Loading user activity...</span>
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
          <span>LIVE ACTIVITY</span>
        </div>
        <div className="news-ticker-content" ref={tickerRef}>
          <div className="news-ticker-track">
            {/* Duplicate items for seamless loop */}
            {[...activities, ...activities].map((item, index) => (
              <div key={index} className="news-item">
                <span className="news-bullet">●</span>
                <span className="activity-username">{item.username}</span>
                <span className="activity-action">{item.action}</span>
                <span className="news-meta">
                  <span className="news-time">{formatTimeAgo(item.timestamp)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
