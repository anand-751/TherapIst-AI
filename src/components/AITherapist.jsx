import React, { useState, useEffect, useRef } from 'react';
import { jsonrepair } from 'jsonrepair';
import { Mic, MicOff, Brain, Clock, MessageCircle, FileText, Zap, Heart, Activity, Shield, Cpu, Waves } from 'lucide-react';

const AITherapist = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [rawReportText, setRawReportText] = useState('');
  const [responses, setResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [report, setReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [systemStatus, setSystemStatus] = useState('ONLINE');
  const [neuralActivity, setNeuralActivity] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const synthRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const questions = [
    "Hello! I'm your AI therapist. How have you been feeling emotionally this past week?",
    "What thoughts or situations have been causing you the most stress or anxiety lately?",
    "Can you describe your sleep patterns and how they've been affecting your daily life?",
    "How would you rate your energy levels and motivation for activities you usually enjoy?",
    "What support systems do you have in place, and how connected do you feel to others?",
    "Are there any recurring thoughts or worries that seem to occupy your mind frequently?"
  ];

  // Neural network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const nodes = [];
    const connections = [];

    // Create nodes
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        const intensity = Math.sin(node.pulse) * 0.5 + 0.5;
        const size = 2 + intensity * 3;

        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`;
        ctx.fill();

        // Draw connections
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.strokeStyle = `rgba(139, 92, 246, ${(100 - distance) / 500})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Neural activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuralActivity(prev => (prev + Math.random() * 20 - 10 + 50) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(finalTranscript + interimTranscript);
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setSystemStatus('ERROR');
        setTimeout(() => setSystemStatus('ONLINE'), 2000);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isRecording]);

  const speakQuestion = (question) => {
    if (!synthRef.current) return;

    setAiSpeaking(true);
    setSystemStatus('PROCESSING');
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onend = () => {
      setAiSpeaking(false);
      setSystemStatus('LISTENING');
      setTimeout(() => {
        startRecording();
      }, 1000);
    };

    synthRef.current.speak(utterance);
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;

    setIsRecording(true);
    setTimeLeft(120);
    setCurrentTranscript('');
    setTranscript('');
    setSystemStatus('RECORDING');
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setTimeLeft(0);
    setSystemStatus('ANALYZING');

    if (transcript || currentTranscript) {
      const finalAnswer = transcript || currentTranscript;
      const newResponse = {
        question: questions[currentQuestionIndex],
        answer: finalAnswer,
        timestamp: new Date()
      };

      setResponses(prev => [...prev, newResponse]);
      setCurrentTranscript('');
      setTranscript('');

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSystemStatus('ONLINE');
        } else {
          setSessionComplete(true);
          setSystemStatus('COMPLETE');
        }
      }, 2000);
    }
  };

  const generateReport = async () => {
    if (responses.length === 0) return;

    setIsGeneratingReport(true);
    setSystemStatus('GENERATING');

    const prompt = `
You are an expert AI mental health analyst. Analyze the following therapy session responses and provide a comprehensive mental health assessment:
1. **Psychological Summary** (5–6 sentences): synthesize emotional patterns, stressors, sleep/energy issues, social supports.
2. **Clinical Risk Assessment**: elaborate on protective and risk factors, with rationale.
3. **Neuroscience Insights**: briefly reference relevant mechanisms (e.g., HPA axis, sleep-wake regulation, neurotransmitters) in lay terms.
4. **Advanced Self-Care Protocols**: at least 7 highly specific, evidence-based daily practices (mindfulness, breathing protocols, light therapy, etc.), with “why it works.”
5. **Life-Changing Behavioral Techniques**: 4 concrete, step-by-step interventions (e.g., anchoring routines, cognitive reframing exercises).
6. **Professional Directives**: 4–5 next steps if in-person therapy or medical referral is needed.

Session Data:
${responses.map((r, i) => `Q${i + 1}: ${r.question}
Answer: ${r.answer}`).join('\n')}


Now return your analysis in the following JSON format (write full paragraphs):

\`\`\`json
{
  "summary": "Detailed psychological analysis of the user's mental and emotional state",
  "riskAssessment": "Explain the risk level in terms of known indicators and reasoning",
  "therapeuticRecommendations": [
    {
      "title": "Cognitive Behavioral Reframing",
      "description": "Guide the user through identifying negative thought loops and replacing them with realistic alternatives. This combats catastrophizing and rumination."
    },
    {
      "title": "Daily Dopamine Routine",
      "description": "Suggest morning walks, light exposure, and task completion cycles to reset motivation circuits and reduce anhedonia."
    }
  ],
  "clinicalNextSteps": [
    "Begin structured CBT sessions (weekly)",
    "Consider SSRIs if symptoms persist for >6 weeks — consult a psychiatrist",
    "Use a mood tracking journal daily for 30 days"
  ]
}
\`\`\`
`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a licensed clinical psychologist with expertise in CBT, neuroscience, and emotional regulation. You provide structured, evidence-based mental health assessments and therapeutic guidance. Speak like a compassionate doctor writing a patient’s post-session report.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      const reportText = data.choices?.[0]?.message?.content || '';

      // Save raw text in case parsing fails
      setRawReportText(reportText);

      // Try to extract JSON block
      const jsonMatch = reportText.match(/```json([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : reportText;

      // Try to parse the JSON
      const parsedReport = JSON.parse(jsonrepair(jsonText));
      setReport(parsedReport);
    } catch (error) {
      console.error('Report generation error:', error);

      // Don't overwrite with generic fallback — rely on rawReportText display
      setReport(null); // Allow conditional UI to show raw fallback
    } finally {
      setSystemStatus('REPORT_READY');
      setIsGeneratingReport(false);
    }
  };



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartSession = () => {
    setCurrentQuestionIndex(0);
    setResponses([]);
    setSessionComplete(false);
    setReport(null);
    setTranscript('');
    setCurrentTranscript('');
    setTimeLeft(0);
    setSystemStatus('ONLINE');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20"></div>

      {/* Neural Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-30"
        style={{ filter: 'blur(0.5px)' }}
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* System Status Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-blue-500/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${systemStatus === 'ONLINE' ? 'bg-green-400 animate-pulse' :
                    systemStatus === 'ERROR' ? 'bg-red-400 animate-pulse' :
                      'bg-yellow-400 animate-pulse'
                    }`}></div>
                  <span className="text-sm font-mono text-blue-300">SYSTEM: {systemStatus}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-mono text-purple-300">NEURAL: {neuralActivity.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-mono text-green-300">SECURE</span>
                </div>
              </div>
              <div className="text-sm font-mono text-gray-400">
                AI-THERAPIST v2.1.0
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-20">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              {/* Holographic AI Avatar */}
              <div className="relative">
                <div className="w-32 h-32 mx-auto relative">
                  {/* Outer Ring */}
                  <div className={`absolute inset-0 rounded-full border-2 border-blue-400 ${aiSpeaking ? 'animate-spin' : 'animate-pulse'}`}></div>
                  <div className={`absolute inset-2 rounded-full border border-purple-400 ${aiSpeaking ? 'animate-spin animate-reverse' : 'animate-pulse'}`} style={{ animationDelay: '0.5s' }}></div>

                  {/* Core Avatar */}
                  <div className={`absolute inset-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl ${aiSpeaking ? 'animate-pulse' : ''}`}>
                    <Brain className={`w-12 h-12 text-white ${aiSpeaking ? 'animate-bounce' : ''}`} />
                  </div>

                  {/* Holographic Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-blue-400/20 to-transparent animate-pulse"></div>

                  {/* Speaking Waves */}
                  {aiSpeaking && (
                    <>
                      <div className="absolute -inset-8 rounded-full border border-blue-400/30 animate-ping"></div>
                      <div className="absolute -inset-12 rounded-full border border-purple-400/20 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                      <div className="absolute -inset-16 rounded-full border border-pink-400/10 animate-ping" style={{ animationDelay: '0.6s' }}></div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ZAK AI
            </h1>
            <p className="text-xl text-gray-300 mb-2">AI-Powered Mental Health Therapist</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-blue-300">
              <Cpu className="w-4 h-4" />
              <span>Anonymous</span>
              <Waves className="w-4 h-4" />
              <span>Personalised Experience</span>
            </div>
          </div>

          {/* Main Interface */}
          <div className="max-w-6xl mx-auto">
            {!sessionComplete ? (
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/30 relative overflow-hidden">
                {/* Holographic Border Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>

                <div className="relative z-10">
                  {/* Progress Hologram */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-mono text-blue-300">SESSION PROGRESS</span>
                      <span className="text-lg font-mono text-purple-300">{currentQuestionIndex + 1} / {questions.length}</span>
                    </div>
                    <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden border border-blue-500/30">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 relative"
                        style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Question Display */}
                  <div className="mb-10">
                    <div className="flex items-center mb-6">
                      <MessageCircle className="w-8 h-8 text-blue-400 mr-4" />
                      <h2 className="text-3xl font-bold text-white">QUERY {currentQuestionIndex + 1}</h2>
                    </div>
                    <div className="relative bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-blue-500/40 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                      <p className="text-2xl leading-relaxed text-white relative z-10 font-light">{questions[currentQuestionIndex]}</p>
                    </div>
                  </div>

                  {/* Control Interface */}
                  <div className="flex flex-col items-center space-y-8">
                    {!isRecording && timeLeft === 0 && (
                      <button
                        onClick={() => speakQuestion(questions[currentQuestionIndex])}
                        disabled={aiSpeaking}
                        className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold py-6 px-12 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-105 disabled:opacity-50 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-center space-x-4 relative z-10">
                          <Zap className="w-8 h-8" />
                          <span className="text-xl">{aiSpeaking ? 'AI PROCESSING...' : 'INITIATE QUERY'}</span>
                        </div>
                      </button>
                    )}

                    {isRecording && (
                      <div className="text-center space-y-6">
                        {/* Recording Indicator */}
                        <div className="flex items-center justify-center space-x-6">
                          <div className="relative">
                            <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
                          </div>
                          <span className="text-2xl font-bold text-red-400 font-mono">RECORDING ACTIVE</span>
                        </div>

                        {/* Timer Display */}
                        <div className="flex items-center justify-center space-x-4">
                          <Clock className="w-8 h-8 text-yellow-400" />
                          <span className="text-4xl font-mono font-bold text-yellow-400">{formatTime(timeLeft)}</span>
                        </div>

                        {/* Timer Progress */}
                        <div className="w-full max-w-md mx-auto">
                          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden border border-yellow-500/30">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 relative"
                              style={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={stopRecording}
                          className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-2xl transform hover:scale-105 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="flex items-center space-x-3 relative z-10">
                            <MicOff className="w-6 h-6" />
                            <span className="text-lg">TERMINATE RECORDING</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Live Transcript */}
                    {currentTranscript && (
                      <div className="w-full bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-green-500/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent animate-pulse"></div>
                        <h3 className="text-lg font-bold text-green-300 mb-3 font-mono">LIVE NEURAL TRANSCRIPT:</h3>
                        <p className="text-white text-lg relative z-10">{currentTranscript}</p>
                      </div>
                    )}
                  </div>

                  {/* Response History */}
                  {responses.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold mb-6 flex items-center text-white">
                        <FileText className="w-8 h-8 mr-3 text-purple-400" />
                        NEURAL MEMORY BANK
                      </h3>
                      <div className="space-y-6">
                        {responses.map((response, index) => (
                          <div key={index} className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/40 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent animate-pulse"></div>
                            <p className="text-sm text-purple-300 mb-3 font-mono relative z-10">QUERY {index + 1}: {response.question}</p>
                            <p className="text-white text-lg relative z-10">{response.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-green-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>

                <div className="text-center mb-12 relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <Heart className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                  <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    SESSION COMPLETE
                  </h2>
                  <p className="text-xl text-gray-300">Neural analysis ready for processing</p>
                </div>

                <div className="flex justify-center space-x-6 mb-12 relative z-10">
                  <button
                    onClick={generateReport}
                    disabled={isGeneratingReport}
                    className="group bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 text-white font-bold py-6 px-12 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-105 disabled:opacity-50 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center space-x-4 relative z-10">
                      <Brain className="w-8 h-8" />
                      <span className="text-xl">{isGeneratingReport ? 'ANALYZING...' : 'GENERATE MENTAL-HEALTH REPORT'}</span>
                    </div>
                  </button>

                  <button
                    onClick={restartSession}
                    className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-6 px-12 rounded-full transition-all duration-300 shadow-2xl transform hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="text-xl relative z-10">NEW SESSION</span>
                  </button>
                </div>

                {/* Report Display */}
                {systemStatus === 'REPORT_READY' && (
                  <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-10 border border-blue-500/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

                    <h3 className="text-4xl font-bold mb-8 flex items-center text-white relative z-10">
                      <FileText className="w-10 h-10 mr-4 text-blue-400" />
                      ANALYSIS REPORT
                    </h3>

                    <div className="space-y-8 relative z-10">
                      {report ? (
                        <>
                          {/* Psychological Summary */}
                          <div className="bg-black/40 rounded-2xl p-6 border border-blue-500/30">
                            <h4 className="text-2xl font-bold text-blue-300 mb-4">PSYCHOLOGICAL SUMMARY</h4>
                            <p className="text-gray-100 leading-relaxed text-lg">{report.summary}</p>
                          </div>

                          {/* Risk Assessment */}
                          <div className="bg-black/40 rounded-2xl p-6 border border-purple-500/30">
                            <h4 className="text-2xl font-bold text-purple-300 mb-4">RISK ASSESSMENT</h4>
                            <span className="px-6 py-3 rounded-full text-lg font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                              {report.riskAssessment}
                            </span>
                          </div>

                          {/* Therapeutic Recommendations */}
                          <div className="bg-black/40 rounded-2xl p-6 border border-green-500/30">
                            <h4 className="text-2xl font-bold text-green-300 mb-4">THERAPEUTIC RECOMMENDATIONS</h4>
                            <ul className="space-y-3">
                              {report.therapeuticRecommendations?.map((rec, idx) => (
                                <li key={idx} className="flex flex-col space-y-1">
                                  <strong className="text-green-400">{rec.title}</strong>
                                  <span className="text-gray-100 text-lg">{rec.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Clinical Next Steps */}
                          <div className="bg-black/40 rounded-2xl p-6 border border-pink-500/30">
                            <h4 className="text-2xl font-bold text-pink-300 mb-4">CLINICAL NEXT STEPS</h4>
                            <ul className="list-disc list-inside text-gray-100 space-y-2">
                              {report.clinicalNextSteps?.map((step, idx) => (
                                <li key={idx} className="text-lg">{step}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <div className="bg-black/40 rounded-2xl p-6 border border-red-500/30">
                          <h4 className="text-2xl font-bold text-red-400 mb-4">⚠️ Could not parse JSON – displaying raw response:</h4>
                          <pre className="text-sm text-white bg-gray-800 p-4 rounded overflow-auto whitespace-pre-wrap max-h-[400px]">
                            {rawReportText}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITherapist;