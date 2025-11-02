import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Mic, MicOff, Send, X, Volume2, Minimize2, Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const VoiceChatbot = memo(function VoiceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your FestEats AI assistant 🍔 Ask me about any food item, our menu, or how to place an order!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Initialize Gemini AI
  useEffect(() => {
    if (GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
        setGenAI(ai);
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
      }
    } else {
      console.warn('⚠️ Gemini API key not found in environment variables');
    }
  }, [GEMINI_API_KEY]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Input Handler
  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Text-to-Speech Handler
  const speakResponse = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  // Stop Speech
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Send Message Handler - USE CORRECT MODEL NAME
  const handleSendMessage = useCallback(async (text: string = inputText) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    console.log('🤖 Starting message send:', text.trim());
    console.log('🔑 API Key available:', !!GEMINI_API_KEY);
    console.log('🧠 GenAI initialized:', !!genAI);

    try {
      if (!genAI) {
        console.error('❌ GenAI not initialized');
        throw new Error('AI assistant is not initialized. Please refresh the page.');
      }

      console.log('✅ Creating Gemini model...');
      // ✅ Use the CORRECT model name (gemini-2.5-flash is the latest stable model)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.9,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 256,
        }
      });

      console.log('✅ Model created successfully');

      // ✅ Fetch menu context
      let menuContext = '';
      try {
        const menuResponse = await fetch(`${API_BASE}/api/food`);
        if (menuResponse.ok) {
          const menuItems = await menuResponse.json();
          menuContext = menuItems
            .slice(0, 15)
            .map((item: any) => `${item.name} (${item.category}) - ₹${item.price}`)
            .join(', ');
          console.log('✅ Menu context fetched:', menuContext);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch menu:', error);
      }

      // ✅ Build prompt
      const contextPrompt = menuContext
        ? `You are FestEats AI helping students order food. Menu: ${menuContext}. Question: ${text.trim()}. Answer in 2-3 friendly sentences with emojis.`
        : `You are FestEats AI for college food delivery. Question: ${text.trim()}. Answer in 2-3 friendly sentences with emojis.`;

      console.log('📤 Sending prompt to Gemini:', contextPrompt.substring(0, 100) + '...');

      // ✅ CORRECT Gemini API call
      const result = await model.generateContent(contextPrompt);
      console.log('📥 Gemini response received:', result);

      const response = await result.response;
      console.log('📝 Response object:', response);
      
      const botReply = response.text();
      console.log('✅ Bot reply extracted:', botReply);

      // ✅ Display bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

      speakResponse(botReply);

    } catch (error: any) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);

      let errorText = 'Sorry, I couldn\'t process that. Please try again! 😅';

      if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('API key')) {
        errorText = '🔑 API key expired or invalid. Please get a new key from https://aistudio.google.com/app/apikey';
      } else if (error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('429')) {
        errorText = '⏰ API quota exceeded. Please try again later!';
      } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        errorText = '🔄 AI model not available. Please check your API key or try again later.';
      } else if (error?.message?.includes('blocked')) {
        errorText = '🚫 Content blocked by safety filters. Try rephrasing your question!';
      } else if (error?.message?.includes('initializing')) {
        errorText = '⏳ AI is starting up. Please wait a moment and try again!';
      } else {
        // Show actual error in development
        errorText = `Error: ${error?.message || 'Unknown error'}`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, genAI, GEMINI_API_KEY, API_BASE, speakResponse]);

  // Quick Actions
  const quickActions = [
    'What\'s on the menu?',
    'Tell me about Biryani',
    'Popular items?',
    'How to order?',
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
        {/* Floating text tooltip with breathing animation */}
        <div className="animate-bounce">
          <div className="bg-gradient-golden text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-medium whitespace-nowrap">
            🤖 Ask me anything!
          </div>
        </div>

        {/* Main chatbot button with breathing effect */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-2xl bg-gradient-golden hover:opacity-90 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Open AI Assistant"
        >
          {/* Breathing animation rings */}
          <span className="absolute inset-0 rounded-full bg-golden opacity-75 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-golden-glare opacity-50 animate-pulse" />

          {/* Bot icon */}
          <div className="relative flex items-center justify-center w-full h-full">
            <Bot className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
          </div>

          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Chatbot modal always at right-bottom */}
      <Card
        className="fixed bottom-8 right-8 z-50 w-[90vw] max-w-[500px] h-[600px] shadow-2xl border-2 border-cloud-blue animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-golden text-white p-3 sm:p-4 rounded-t-lg flex items-center justify-between relative overflow-hidden flex-shrink-0">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              {/* Active indicator */}
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">FestEats AI</h3>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                Online · Powered by Gemini
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 h-7 w-7 sm:h-9 sm:w-9 p-0 rounded-full"
            >
              <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-7 w-7 sm:h-9 sm:w-9 p-0 rounded-full"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col overflow-hidden flex-1 sm:max-h-[calc(90vh-8rem)]">
            {/* Messages - SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-b from-orange-50/30 to-white scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50 hover:scrollbar-thumb-orange-400 transition-colors">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-sm break-words ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-100'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'opacity-80' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="bg-white text-gray-800 rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-3 sm:p-4 border-t bg-white/80 backdrop-blur-sm flex-shrink-0">
                <p className="text-xs text-gray-600 mb-2 font-medium">✨ Try asking:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(action)}
                      className="text-xs bg-orange-100 text-orange-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-orange-200 transition-all hover:scale-105 active:scale-95 font-medium"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area - AT BOTTOM OF CONTAINER */}
            <div className="px-2 sm:px-3 py-1 sm:py-2 border-t bg-white rounded-b-lg flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type or speak your question..."
                  className="flex-1 border-2 border-orange-100 focus:border-orange-300 rounded-full px-3 sm:px-4 py-1 h-8 sm:h-9 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={toggleVoiceInput}
                  variant={isListening ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg' : 'border-2 border-orange-200'}`}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Mic className="w-3 h-3 sm:w-4 sm:h-4" />}
                </Button>
                {isSpeaking ? (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    size="sm"
                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 animate-pulse border-2 border-orange-200"
                  >
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSendMessage()}
                    size="sm"
                    disabled={isLoading || !inputText.trim()}
                    className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
        
        {/* Add custom scrollbar styles */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 3s infinite;
          }
          
          /* Custom Scrollbar Styles */
          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #fed7aa;
            border-radius: 2px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #fb923c;
            border-radius: 2px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #f97316;
          }
          
          /* Firefox Scrollbar */
          .scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #fb923c #fed7aa;
          }
        `}</style>
      </Card>
    </>
  );
});
