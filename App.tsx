import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateInitialScene, generateNextScene } from './services/geminiService';
import { GameScene, PlayerStats, GameHistoryItem } from './types';
import { Typewriter } from './components/Typewriter';
import { StatsBar } from './components/StatsBar';
import { LagosCity3D } from './components/LagosCity3D';
import { CharacterPortrait } from './components/CharacterPortrait';
import { Play, RotateCcw, Volume2, AlertTriangle, ShieldAlert, HeartCrack, BatteryWarning, Heart, Zap } from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentScene, setCurrentScene] = useState<GameScene | null>(null);
  // Default Stats with Health and Energy
  const [stats, setStats] = useState<PlayerStats>({ 
    cash: 5000, 
    streetCred: 10, 
    heat: 10,
    health: 100,
    energy: 100
  });
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  
  // Initial Load
  const startGame = async () => {
    setLoading(true);
    setGameStarted(true);
    const scene = await generateInitialScene();
    setCurrentScene(scene);
    setHistory([{ speaker: scene.speaker, dialogue: scene.dialogue }]);
    setLoading(false);
    setTypingComplete(false);
  };

  const handleChoice = async (choiceIndex: number) => {
    if (!currentScene) return;

    const choice = currentScene.choices[choiceIndex];
    
    // Apply stats logic with constraints
    if (choice.statsChange) {
        setStats(prev => ({
            cash: Math.max(0, prev.cash + (choice.statsChange?.cash || 0)),
            streetCred: Math.min(100, Math.max(0, prev.streetCred + (choice.statsChange?.streetCred || 0))),
            heat: Math.min(100, Math.max(0, prev.heat + (choice.statsChange?.heat || 0))),
            // Health and Energy logic
            health: Math.min(100, Math.max(0, prev.health + (choice.statsChange?.health || 0))),
            energy: Math.min(100, Math.max(0, prev.energy + (choice.statsChange?.energy || 0)))
        }));
    }

    setLoading(true);
    
    // Optimistic Update / History Log
    const newHistory = [
      ...history, 
      { 
          speaker: "Player", 
          dialogue: `Selected: ${choice.text}`,
          choiceMade: choice.effect 
      }
    ];
    setHistory(newHistory);

    // Fetch next scene
    const nextScene = await generateNextScene(newHistory, choice.effect, stats);
    setCurrentScene(nextScene);
    
    // Append AI response to history
    setHistory([...newHistory, { speaker: nextScene.speaker, dialogue: nextScene.dialogue }]);
    
    setLoading(false);
    setTypingComplete(false);
  };

  const handleRestart = () => {
    setStats({ cash: 5000, streetCred: 10, heat: 10, health: 100, energy: 100 });
    setHistory([]);
    setCurrentScene(null);
    setGameStarted(false);
  };
  
  const handleTypingComplete = useCallback(() => {
    setTypingComplete(true);
  }, []);

  // Intro Screen
  if (!gameStarted) {
    return (
      <div className="h-screen w-full bg-yellow-400 flex flex-col items-center justify-center p-6 text-black relative overflow-hidden">
        {/* Intro 3D Background (faint) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
             <LagosCity3D mood="chaotic" />
        </div>
        
        <div className="z-10 text-center max-w-2xl">
          <div className="mb-6 inline-block bg-black text-yellow-400 px-4 py-1 transform -rotate-2 font-bold uppercase tracking-widest text-sm">
            Interactive 3D Visual Novel
          </div>
          <h1 className="text-8xl font-black mb-2 tracking-tighter uppercase glitch-text">
            HUSTLETERS
          </h1>
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-wide">
            LAGOS CHAOS
          </h2>
          <p className="text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">
            "Sapa is watching. Police are watching. Can you survive the streets of Lagos?"
          </p>
          
          <button 
            onClick={startGame}
            disabled={loading}
            className="group relative inline-flex items-center justify-center px-12 py-4 text-xl font-bold text-white transition-all duration-200 bg-black font-rubik focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-black hover:bg-gray-900"
          >
             {loading ? 'LOADING ENGINE...' : 'START HUSTLE'}
             {!loading && <Play className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />}
          </button>
        </div>
      </div>
    );
  }

  // Determine Game Over State
  const isDead = stats.health <= 0;
  const isArrested = stats.heat >= 100;
  const isBroke = stats.cash <= -5000;
  const isExhausted = stats.energy <= 0;

  if (currentScene?.isGameOver || isDead || isArrested || isBroke || isExhausted) {
     let title = "GAME OVER";
     let message = "The streets don't love you.";
     let Icon = ShieldAlert;

     if (isDead) {
        title = "WASTED";
        message = "Village people finally got you. You died.";
        Icon = HeartCrack;
     } else if (isArrested) {
        title = "BUSTED";
        message = "SARS don carry you. Indomie generation in cell.";
        Icon = ShieldAlert;
     } else if (isExhausted) {
        title = "COLLAPSED";
        message = "Body no be firewood. You passed out in traffic.";
        Icon = BatteryWarning;
     }

     return (
        <div className="h-screen w-full bg-red-900 flex flex-col items-center justify-center p-6 text-white relative">
            <div className="absolute inset-0 opacity-50">
                 <LagosCity3D mood="danger" />
            </div>
            <div className="absolute inset-0 bg-black/60 z-0"></div>
            <div className="z-10 text-center animate-bounce">
                <Icon size={80} className="mx-auto mb-6 text-red-500" />
                <h1 className="text-6xl font-black mb-4 uppercase">{title}</h1>
                <p className="text-2xl mb-8 font-mono">{message}</p>
                <div className="bg-black/50 p-6 rounded-lg mb-8 border border-red-500/30">
                    <p className="italic text-gray-300">"{currentScene?.dialogue}"</p>
                </div>
                <button 
                    onClick={handleRestart}
                    className="bg-white text-red-900 px-8 py-3 font-black text-lg hover:bg-gray-200 uppercase"
                >
                    Try Another Hustle
                </button>
            </div>
        </div>
     );
  }

  return (
    <div className="h-screen w-full relative flex flex-col justify-end overflow-hidden">
      
      {/* 3D World Background */}
      <LagosCity3D mood={currentScene?.backgroundMood} />

      {/* Screen Shake Effect container */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 bg-gradient-to-t from-black/80 via-transparent to-black/20 ${currentScene?.screenShake ? 'shake border-4 border-red-500/50' : ''}`}></div>

      {/* Character Portrait Layer (Behind Stats/UI, In Front of 3D) */}
      <CharacterPortrait 
        speaker={currentScene?.speaker || ''} 
        mood={currentScene?.backgroundMood} 
      />

      {/* Stats UI */}
      <StatsBar stats={stats} />

      {/* Main Content Area */}
      <div className="relative z-20 w-full max-w-4xl mx-auto p-4 md:mb-8">
        
        {/* Character Name Tag */}
        <div className="flex justify-start mb-0 ml-4">
            <div className="bg-yellow-400 text-black px-6 py-1 transform -skew-x-12 border-2 border-black origin-bottom-left shadow-lg">
                <h3 className="font-black text-xl uppercase tracking-wider transform skew-x-12">
                    {currentScene?.speaker || "..."}
                </h3>
            </div>
        </div>

        {/* Dialogue Box */}
        <div className="bg-black/90 border-2 border-white/20 backdrop-blur-sm p-6 md:p-8 shadow-2xl rounded-tr-3xl rounded-bl-3xl h-[180px] flex flex-col relative">
            
            {/* Decorative decorative lines */}
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-yellow-400 rounded-tr-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-yellow-400 rounded-bl-2xl pointer-events-none"></div>

            {/* Scrollable Text Area */}
            <div className="overflow-y-auto custom-scrollbar pr-2 h-full">
                <p className="text-lg md:text-2xl font-medium leading-relaxed font-sans text-gray-100">
                    {currentScene ? (
                        <Typewriter 
                            text={currentScene.dialogue} 
                            speed={20} 
                            onComplete={handleTypingComplete} 
                        />
                    ) : (
                        <span className="animate-pulse">Loading story...</span>
                    )}
                </p>
            </div>

            {loading && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-yellow-400 text-xs font-mono animate-pulse bg-black/50 px-2 rounded">
                    <AlertTriangle size={12} />
                    <span>GENERATING...</span>
                </div>
            )}
        </div>

        {/* Choice Buttons */}
        <div className="mt-4 grid gap-3 md:grid-cols-1">
            {currentScene?.choices.map((choice, index) => (
                <button
                    key={choice.id}
                    onClick={() => handleChoice(index)}
                    disabled={!typingComplete || loading}
                    className={`
                        text-left p-4 md:p-5 border-2 transition-all duration-200 group relative overflow-hidden
                        ${!typingComplete || loading 
                            ? 'opacity-50 cursor-not-allowed border-gray-700 bg-black text-gray-500' 
                            : 'bg-black/80 hover:bg-yellow-400 hover:text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-white/30 text-white'
                        }
                    `}
                >
                    <div className="flex items-center justify-between relative z-10">
                        <span className="font-bold text-lg md:text-xl font-rubik mr-4">
                            {choice.text}
                        </span>
                        {/* Cost/Gain Indicators inside button */}
                        <div className="flex flex-wrap gap-2 text-xs font-mono opacity-80">
                            {choice.statsChange?.cash && choice.statsChange.cash !== 0 && (
                                <span className={choice.statsChange.cash > 0 ? "text-green-400" : "text-red-400"}>
                                    {choice.statsChange.cash > 0 ? '+' : ''}₦{choice.statsChange.cash}
                                </span>
                            )}
                            {choice.statsChange?.health && choice.statsChange.health !== 0 && (
                                <span className={choice.statsChange.health > 0 ? "text-green-400" : "text-red-400"}>
                                    <Heart size={10} className="inline mr-1" />
                                    {choice.statsChange.health > 0 ? '+' : ''}{choice.statsChange.health}
                                </span>
                            )}
                             {choice.statsChange?.energy && choice.statsChange.energy !== 0 && (
                                <span className={choice.statsChange.energy > 0 ? "text-blue-400" : "text-orange-400"}>
                                    <Zap size={10} className="inline mr-1" />
                                    {choice.statsChange.energy > 0 ? '+' : ''}{choice.statsChange.energy}
                                </span>
                            )}
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}