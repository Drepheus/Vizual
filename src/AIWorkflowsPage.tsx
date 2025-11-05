import { useNavigate } from 'react-router-dom';
import FlowingMenu from './FlowingMenu';
import './AIWorkflowsPage.css';

interface AIWorkflowsPageProps {
  onClose?: () => void;
}

export default function AIWorkflowsPage({ onClose }: AIWorkflowsPageProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/command-hub');
    }
  };

  const workflowCategories = [
    { link: '#', text: 'Research & Analysis', image: '' },
    { link: '#', text: 'Content Creation', image: '' },
    { link: '#', text: 'Data Processing', image: '' },
    { link: '#', text: 'Task Automation', image: '' },
    { link: '#', text: 'Code Generation', image: '' },
    { link: '#', text: 'Custom Workflows', image: '' }
  ];

  return (
    <div className="ai-workflows-page">
      <button
        className="ai-workflows-close"
        onClick={handleClose}
      >
        ✕
      </button>
      <FlowingMenu items={workflowCategories} />
    </div>
  );
}
