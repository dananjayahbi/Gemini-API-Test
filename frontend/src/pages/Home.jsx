// src/Home.jsx
import React, { useState } from 'react';
import { Layout, Input, Button, message } from 'antd';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import Editor from '@monaco-editor/react';

const { Content } = Layout;

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const result = await axios.post('http://localhost:5000/', { prompt });
      setResponse(result.data.bot);
    } catch (error) {
      console.error('Error:', error);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Content style={{ flex: 1, padding: '50px 50px', paddingBottom: '100px' }}>
        <div className="site-layout-content">
          <div className="chat-container">
            <div className="chat-history" style={{ marginBottom: '20px' }}>
              {response && (
                <ReactMarkdown
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <Editor
                          height="300px" // Set the desired height
                          language={match[1]}
                          theme="vs-dark"
                          value={String(children).replace(/\n$/, '')}
                          options={{
                            readOnly: true,
                            inlineSuggest: true,
                            fontSize: '16px',
                            formatOnType: true,
                            autoClosingBrackets: true,
                            minimap: { scale: 10 },
                          }}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                  className="custom-markdown" // Add your custom class
                >
                  {response}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </Content>
      <div
        className="chat-input"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '20px',
          borderTop: '1px solid #e8e8e8',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 9999,
        }}
      >
        <Input
          placeholder="Type your message..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onPressEnter={handleGenerate}
          style={{ width: '80%', marginRight: '10px' }}
          disabled={loading}
        />
        <Button type="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </Layout>
  );
};

export default Home;
