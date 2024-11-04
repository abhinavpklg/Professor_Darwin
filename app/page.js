'use client'
import { useState, useRef, useEffect } from "react";
import { Box, Stack, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material';
import { useTheme, CssBaseline } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ReactMarkdown from 'react-markdown';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import { Pacifico } from 'next/font/google'

const pacifico = Pacifico({ 
  weight: '400',
  subsets: ['latin'],
})

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#121212',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#ffffff',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#121212',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'system',
    content: `Select an action from the dropdown menu above to begin your personalized learning journey with Proferssor Darwin.`
  }]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState('light');
  const [action, setAction] = useState('chat');
  const [discussedTopics, setDiscussedTopics] = useState([]);

const theme = createTheme({
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          // Light mode colors
          background: {
            default: '#ffffff',
          },
          chat: {
            system: 'rgba(244, 143, 177, 0.15)',
            user: 'rgba(100, 181, 246, 0.15)',
          }
        }
      : {
          // Dark mode colors
          background: {
            default: '#121212',
          },
          chat: {
            system: 'rgba(244, 143, 177, 0.1)',
            user: 'rgba(100, 181, 246, 0.1)',
          }
        }),
  },
});

const sendMessage = async () => {
  setIsLoading(true);
  if (!message.trim() || isLoading) return;

  setMessages((messages) => [
    ...messages,
    { role: 'user', content: message },
    { role: 'system', content: '' },
  ]);

  try {
    const response = await fetch('/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        messages: [...messages, { role: 'user', content: message }],
        ...(action === 'answerQuestion' && { question: message }),
          ...(action === 'solveProblem' && { problem: message }),
          ...(action === 'reflectionQuestion' && { topic: message }),
          ...(action === 'generateQuiz' && { topic: message, numQuestions: 8 }), 
          ...(action === 'visualAid' && { topic: message }),
          ...(action === 'relateToRealWorld' && { concept: message }),
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let jsonResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      jsonResponse += decoder.decode(value, { stream: true });
    }

    try {
      const parsedResponse = JSON.parse(jsonResponse);
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: parsedResponse.result },
        ];
      });

      // Update discussed topics
      setDiscussedTopics((prev) => [...new Set([...prev, message.toLowerCase()])]);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'system', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }
  } catch (error) {
    setMessages((messages) => [
      ...messages,
      { role: 'system', content: "I'm sorry, but I encountered an error. Please try again later." },
    ]);
  }
  setIsLoading(false);
  setMessage('');
};

const generateFollowUp = async () => {
  const lastMessage = messages[messages.length - 1].content;
  setIsLoading(true);
  try {
    const response = await fetch('/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generateFollowUp',
        lastMessage,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    setMessages((prev) => [...prev, { role: 'system', content: data.result }]);
  } catch (error) {
    console.error('Error generating follow-up:', error);
  }
  setIsLoading(false);
};

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const messagesEndRef = useRef(null)
const textFieldRef = useRef(null)

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}

useEffect(() => {
  scrollToBottom()
}, [messages])

useEffect(() => {
  if (!isLoading) {
    textFieldRef.current?.focus();
  }
}, [isLoading]);

//mobile compatible code

const handleResize = () => {
  if (typeof window !== 'undefined') {
    setIsMobile(window.innerWidth < 768);
  }
};

useEffect(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

return (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ 
        position: 'relative', 
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/tutor.png")',
          backgroundSize: 'cover',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          zIndex: 0,
        }}
      />
      <MaterialUISwitch
        sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          zIndex: 1,
        }}
        checked={mode === 'dark'}
        onChange={() => setMode((prevMode) => prevMode === 'light' ? 'dark' : 'light')}
      />

      <Stack
        direction={'column'}
        width={isMobile ? "90%" : "65%"}
        height={isMobile ? "80vh" : "80%"}
        p={2}
        spacing={3}
        border={2}
        style={{ 
          backdropFilter: 'blur(8px)', 
          backgroundColor: mode === 'light' 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(0, 0, 0, 0.7)', 
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', 
          borderColor: mode === 'light'
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(255, 255, 255, 0.2)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffffff',
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: pacifico.style.fontFamily,
          }}
        >
          Professor Darwin
        </Box>
        <Stack
          direction={'row'}
          spacing={2}
          justifyContent="space-between"
        >
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              label="Action"
            >
              <MenuItem value="chat">Chat</MenuItem>
              <MenuItem value="answerQuestion">Subject Q&A</MenuItem>
              <MenuItem value="solveProblem">Solve Problems: Step By Step</MenuItem>
              <MenuItem value="relateToRealWorld">Real World Connections</MenuItem>
              <MenuItem value="reflectionQuestion">Reflection Question and Critical Thinking</MenuItem>
              <MenuItem value="generateQuiz">Generate Quiz & Exam Prep</MenuItem>
              <MenuItem value="visualAid">Visual Aids</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'system' ? 'flex-start' : 'flex-end'
              }
              sx={{
                maxWidth: '100%',
                margin: '8px 0',
              }}
            >
              <Box
                bgcolor={message.role === 'system' 
                  ? theme.palette.chat.system 
                  : theme.palette.chat.user}
                color={theme.palette.text.primary}
                p={isMobile ? 2 : 3}
                borderRadius={isMobile ? 12 : 16}
                sx={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '& p': { m: 0 },
                  '& pre': {
                    backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    p: 1,
                    borderRadius: 1,
                    overflowX: 'auto'
                  },
                  '& code': {
                    fontFamily: 'monospace',
                    backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    p: 0.5,
                    borderRadius: 0.5
                  }
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack 
          direction={'row'} 
          spacing={isMobile ? 1 : 2}
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{ 
              backgroundColor: mode === 'light' 
                ? 'rgba(255, 255, 255, 1)' 
                : 'rgba(30, 30, 30, 1)' 
            }}
            inputProps={{ style: { fontSize: isMobile ? '0.9rem' : '1rem' } }}
            inputRef={textFieldRef} 
          />
          <Button 
            variant="contained" 
            onClick={sendMessage} 
            disabled={isLoading}
            sx={{ backgroundColor: '#4CAF50', color: 'white', '&:hover': { backgroundColor: '#388E3C' }, minWidth: '60px' }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
          {/* <Button 
            variant="outlined" 
            onClick={generateFollowUp} 
            disabled={isLoading || messages.length === 0}
            sx={{ minWidth: '120px' }}
          >
            Follow Up
          </Button> */}
        </Stack>
      </Stack>
    </Box>
  </ThemeProvider>
);
}