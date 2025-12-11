import React, { useReducer, useEffect, useState } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { AppState, AppAction, FontType } from './types';
import { COLORS, FONTS } from './constants';
import { generateNewBlessing } from './services/blessingService';

const initialState: AppState = {
  fontType: FontType.SERIF,
  primaryColor: COLORS.GOLD,
  horseSpeed: 1.2,
  snowSpeed: 0.5,
  isExploded: false,
  introProgress: 0,
  currentBlessing: null,
  blessingId: 0,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FONT': return { ...state, fontType: action.payload };
    case 'SET_COLOR': return { ...state, primaryColor: action.payload };
    case 'SET_HORSE_SPEED': return { ...state, horseSpeed: action.payload };
    case 'SET_SNOW_SPEED': return { ...state, snowSpeed: action.payload };
    case 'EXPLODE': return { ...state, isExploded: action.payload };
    case 'SET_INTRO_PROGRESS': return { ...state, introProgress: action.payload };
    case 'GENERATE_BLESSING': return { 
      ...state, 
      currentBlessing: action.payload,
      isExploded: true,
      blessingId: state.blessingId + 1 
    };
    default: return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [introDone, setIntroDone] = useState(false);

  // Intro Animation Logic
  useEffect(() => {
    let startTime = Date.now();
    const duration = 4000; // 4 seconds intro

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      dispatch({ type: 'SET_INTRO_PROGRESS', payload: eased });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIntroDone(true);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const handleBlessingRequest = async () => {
    if (state.isExploded) {
      // Reset
      dispatch({ type: 'EXPLODE', payload: false });
      setTimeout(() => {
         // Clear blessing after animation down
        dispatch({ type: 'GENERATE_BLESSING', payload: null as any }); // Hack to clear, logic handles null
         dispatch({ type: 'EXPLODE', payload: false });
      }, 500);
    } else {
      // Explode and Generate
      const blessing = await generateNewBlessing();
      dispatch({ type: 'GENERATE_BLESSING', payload: blessing });
    }
  };

  const fontFamily = state.fontType === FontType.SERIF ? FONTS.SERIF : FONTS.SANS;

  return (
    <div 
      className="w-full h-full flex overflow-hidden relative"
      style={{ fontFamily }}
    >
      {/* 3D Stage (75% on desktop, full on mobile with overlay) */}
      <div className="relative w-full lg:w-3/4 h-full">
        <Scene state={state} />
        
        {/* Mobile Title Overlay (Hidden on Desktop) */}
        <div className="absolute top-4 left-4 lg:hidden text-white pointer-events-none">
          <h1 className="text-2xl font-bold" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>马年祈福</h1>
        </div>
      </div>

      {/* Sidebar (25% on desktop) */}
      <div className={`
        fixed inset-0 lg:static lg:w-1/4 h-full z-10 transition-transform duration-500
        ${introDone ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0
      `}>
        <Overlay 
          state={state} 
          dispatch={dispatch} 
          onBlessingRequest={handleBlessingRequest} 
        />
      </div>
    </div>
  );
}
