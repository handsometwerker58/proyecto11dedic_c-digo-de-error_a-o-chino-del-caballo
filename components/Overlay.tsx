import React from 'react';
import { AppState, AppAction, FontType } from '../types';
import { COLORS } from '../constants';

interface OverlayProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onBlessingRequest: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ state, dispatch, onBlessingRequest }) => {
  return (
    <div className="h-full w-full bg-white/10 backdrop-blur-xl border-l border-white/20 p-6 flex flex-col gap-6 text-white overflow-y-auto shadow-2xl">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2 tracking-widest" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
          马年祈福
        </h1>
        <p className="text-xs opacity-70 font-sans">Year of the Horse • 2026</p>
      </header>

      {/* Controls */}
      <section className="space-y-6">
        
        {/* Font Toggle */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider opacity-60">Typography</label>
          <div className="flex bg-black/20 rounded-lg p-1">
            <button
              onClick={() => dispatch({ type: 'SET_FONT', payload: FontType.SERIF })}
              className={`flex-1 py-2 text-sm rounded-md transition-all ${state.fontType === FontType.SERIF ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
            >
              Serif (衬线)
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_FONT', payload: FontType.SANS })}
              className={`flex-1 py-2 text-sm rounded-md transition-all ${state.fontType === FontType.SANS ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
            >
              Sans (无衬线)
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider opacity-60">Aura Color</label>
          <div className="flex gap-3">
            {[COLORS.GOLD, COLORS.CINNABAR, '#4cc9f0', '#7209b7'].map((c) => (
              <button
                key={c}
                onClick={() => dispatch({ type: 'SET_COLOR', payload: c })}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${state.primaryColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-80">
              <span>Spirit Pace</span>
              <span>{(state.horseSpeed * 10).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={state.horseSpeed}
              onChange={(e) => dispatch({ type: 'SET_HORSE_SPEED', payload: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-80">
              <span>Snow Intensity</span>
              <span>{(state.snowSpeed * 10).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={state.snowSpeed}
              onChange={(e) => dispatch({ type: 'SET_SNOW_SPEED', payload: parseFloat(e.target.value) })}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>
      </section>

      <div className="flex-grow" />

      {/* Action Button */}
      <button
        onClick={onBlessingRequest}
        disabled={state.isExploded && !!state.currentBlessing}
        className="w-full group relative py-4 bg-gradient-to-r from-red-800 to-red-600 rounded-xl overflow-hidden shadow-lg hover:shadow-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
        <span className="relative text-lg font-bold tracking-widest text-white flex items-center justify-center gap-2" style={{ fontFamily: '"Ma Shan Zheng", cursive' }}>
          {state.isExploded ? "Reset Vision (重置)" : "Reveal Destiny (求签)"}
        </span>
      </button>

      <footer className="text-[10px] text-center opacity-40">
        Interactive WebGL Experience <br/> Three.js • React • Tailwind
      </footer>
    </div>
  );
};
