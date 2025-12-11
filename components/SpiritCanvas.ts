import { Blessing } from '../types';
import { COLORS, FONTS } from '../constants';

export const drawSpiritSign = (canvas: HTMLCanvasElement, blessing: Blessing) => {
  const ctx = canvas.getContext('2d');
  if (!ctx || !blessing) return;

  const W = canvas.width;
  const H = canvas.height;

  // 1. Background (Yellow Kraft Paper)
  ctx.fillStyle = COLORS.PAPER;
  ctx.fillRect(0, 0, W, H);

  // 2. Add Noise/Grain
  for (let i = 0; i < 50000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const alpha = Math.random() * 0.05;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // 3. Rough Border (Hand-drawn effect)
  ctx.strokeStyle = '#5c3a21';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const padding = 20;
  ctx.moveTo(padding + Math.random() * 5, padding + Math.random() * 5);
  ctx.lineTo(W - padding - Math.random() * 5, padding + Math.random() * 5);
  ctx.lineTo(W - padding - Math.random() * 5, H - padding - Math.random() * 5);
  ctx.lineTo(padding + Math.random() * 5, H - padding - Math.random() * 5);
  ctx.closePath();
  ctx.stroke();

  // 4. Header (Level)
  ctx.fillStyle = '#cc0000'; // Stamp red
  ctx.font = `60px ${FONTS.CALLIGRAPHY}`;
  ctx.textAlign = 'center';
  ctx.fillText(blessing.level, W / 2, 100);

  // 5. Title
  ctx.fillStyle = '#222';
  ctx.font = `bold 40px ${FONTS.CALLIGRAPHY}`;
  ctx.fillText(blessing.title, W / 2, 160);

  // 6. Vertical Poetry
  // Draw from right to left, top to bottom
  ctx.fillStyle = '#333';
  ctx.font = `32px ${FONTS.CALLIGRAPHY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const startX = W - 80;
  const startY = 220;
  const lineHeight = 50; // Spacing between columns
  
  if (blessing.poetry) {
      blessing.poetry.forEach((line, colIndex) => {
        const x = startX - (colIndex * lineHeight);
        const chars = line.split('');
        chars.forEach((char, charIndex) => {
          const y = startY + (charIndex * 40);
          ctx.fillText(char, x, y);
        });
      });
  }

  // 7. Decorative Stamp (Seal)
  ctx.save();
  ctx.translate(60, H - 80);
  ctx.rotate(-0.2);
  ctx.strokeStyle = 'rgba(200, 20, 20, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 50, 50);
  ctx.fillStyle = 'rgba(200, 20, 20, 0.8)';
  ctx.font = `20px ${FONTS.CALLIGRAPHY}`;
  ctx.fillText("甲午", 25, 15); // Year of Horse cycle name
  ctx.restore();
};