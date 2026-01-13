
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Very basic markdown parser for demonstration
  // In a real app, use react-markdown
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Lists
      if (formatted.startsWith('- ')) {
        return <li key={i} className="ml-4 list-disc mb-1" dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} />;
      }
      if (formatted.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="prose prose-invert max-w-none text-slate-200">
      {formatContent(content)}
    </div>
  );
};

export default MarkdownRenderer;
