// src/Home.jsx
import React, { useState } from 'react';
import { Layout, Input, Button, message, Spin } from 'antd';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { TextArea } = Input;

const Home = () => {
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (loading) return;

    // Display user message instantly
    setConversation([...conversation, { role: 'user', message: userMessage, id: Date.now() }]);

    try {
      setLoading(true);

      const result = await axios.post('http://localhost:5000/', { message: userMessage });
      const botMessage = result.data.bot;

      // Replace "generating..." with the actual AI response
      setConversation((prevConversation) => {
        const updatedConversation = [...prevConversation];
        const userMessageIndex = updatedConversation.findIndex((msg) => msg.role === 'user' && msg.id === userMessage.id);

        if (userMessageIndex !== -1) {
          updatedConversation[userMessageIndex] = { role: 'user', message: userMessage, id: userMessage.id };
        }

        return [...updatedConversation, { role: 'ai', message: botMessage, id: Date.now() }];
      });
    } catch (error) {
      console.error('Error:', error);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }

    // Clear the input field
    setUserMessage('');
  };

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Content style={{ flex: 1, padding: '50px 50px', paddingBottom: '100px' }}>
        <div className="site-layout-content">
          <div className="chat-container">
            <div className="chat-history" style={{ marginBottom: '20px' }}>
              {conversation.map((item) => (
                <div key={item.id} className={`message-container ${item.role}`}>
                  {item.role === 'user' && (
                    <div className="user-icon">
                      <UserOutlined />
                    </div>
                  )}
                  {item.role === 'ai' && (
                    <div className="ai-icon" style={{marginTop:"20px"}}>
                      <RobotOutlined />
                    </div>
                  )}
                  <div className="message-content">
                    {item.role === 'user' ? (
                      <div className="user-message">{item.message}</div>
                    ) : (
                      <>
                        <ReactMarkdown
                          components={{
                            code: ({ node, inline, className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <Editor
                                  height="300px"
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
                          className="custom-markdown"
                        >
                          {item.message}
                        </ReactMarkdown>
                        {loading && <Spin size="small" style={{ marginLeft: '5px' }} />}
                      </>
                    )}
                  </div>
                </div>
              ))}
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
        <TextArea
          placeholder="Type your message..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          rows={5}
          //onPressEnter={handleSendMessage}
          style={{ width: '80%', marginRight: '10px' }}
          disabled={loading}
        />
        <Button type="primary" onClick={handleSendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </div>
    </Layout>
  );
};

export default Home;
