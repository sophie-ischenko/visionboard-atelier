import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Grid3x3, ArrowUp } from 'lucide-react';
import { CanvasItem } from './CanvasItem';

const generateId = () => Math.random().toString(36).slice(2, 11);
const getRandomRotation = () => Math.random() * 6 - 3;
const GRID_SIZE = 40;

interface MoodboardItem {
  id: string;
  type: 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  zIndex: number;
  rotation: number;
}

interface DragState {
  isDragging: boolean;
  mode: 'move' | 'resize';
  itemId: string | null;
  startX: number;
  startY: number;
  originalX: number;
  originalY: number;
  originalWidth: number;
}

const DEFAULT_BACKGROUND =
  'radial-gradient(circle at 50% 50%, #FFF7D3 0%, #FFE0B2 100%)';

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const App: React.FC = () => {
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(DEFAULT_BACKGROUND);
  const [backgroundHistory, setBackgroundHistory] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dragRef = useRef<DragState>({
    isDragging: false,
    mode: 'move',
    itemId: null,
    startX: 0,
    startY: 0,
    originalX: 0,
    originalY: 0,
    originalWidth: 0,
  });

  const [, forceRender] = useState(0);

  const getTopZ = useCallback(() => {
    return items.reduce((max, i) => Math.max(max, i.zIndex), 0);
  }, [items]);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    dragRef.current = {
      isDragging: true,
      mode: 'move',
      itemId: id,
      startX: e.clientX,
      startY: e.clientY,
      originalX: item.x,
      originalY: item.y,
      originalWidth: item.width,
    };

    forceRender(x => x + 1);
  }, [items]);

  const handleResizeStart = useCallback((e: React.PointerEvent, id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    dragRef.current = {
      isDragging: true,
      mode: 'resize',
      itemId: id,
      startX: e.clientX,
      startY: e.clientY,
      originalX: item.x,
      originalY: item.y,
      originalWidth: item.width,
    };

    forceRender(x => x + 1);
  }, [items]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.isDragging || !drag.itemId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    setItems(prev =>
      prev.map(item => {
        if (item.id !== drag.itemId) return item;

        if (drag.mode === 'move') {
          let x = drag.originalX + dx;
          let y = drag.originalY + dy;

          if (showGrid) {
            x = Math.round(x / GRID_SIZE) * GRID_SIZE;
            y = Math.round(y / GRID_SIZE) * GRID_SIZE;
          }

          return { ...item, x, y };
        }

        return {
          ...item,
          width: Math.max(50, drag.originalWidth + dx),
        };
      })
    );
  }, [showGrid]);

  const handlePointerUp = useCallback(() => {
    dragRef.current.isDragging = false;
    forceRender(x => x + 1);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const addItem = (content: string) => {
    setItems(prev => [
      ...prev,
      {
        id: generateId(),
        type: 'image',
        content,
        x: 200 + Math.random() * 40 - 20,
        y: 200 + Math.random() * 40 - 20,
        width: 250,
        zIndex: getTopZ() + 1,
        rotation: showGrid ? 0 : getRandomRotation(),
      },
    ]);
  };

  const setBackground = (content: string) => {
    setBackgroundHistory(prev => [...prev, backgroundImage]);
    setBackgroundImage(content);
  };

  const resetBackground = () => {
    setBackgroundHistory(prev => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setBackgroundImage(last);
      return prev.slice(0, -1);
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <div ref={containerRef} className="flex-1 relative">
        {items.map(item => (
          <CanvasItem
            key={item.id}
            item={item}
            isActive={dragRef.current.itemId === item.id}
            onPointerDown={handlePointerDown}
            onResizeStart={handleResizeStart}
            onResizeDiscrete={(id, delta) =>
              setItems(prev =>
                prev.map(i =>
                  i.id === id ? { ...i, width: i.width + delta } : i
                )
              )
            }
            onRemove={(id) =>
              setItems(prev => prev.filter(i => i.id !== id))
            }
            onBringToFront={(id) =>
              setItems(prev => {
                const max = getTopZ();
                return prev.map(i =>
                  i.id === id ? { ...i, zIndex: max + 1 } : i
                );
              })
            }
            onSetBackground={setBackground}
          />
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <button onClick={() => fileInputRef.current?.click()}>
          <Upload />
        </button>

        <button onClick={() => setShowGrid(v => !v)}>
          <Grid3x3 />
        </button>

        <button onClick={resetBackground}>
          <ArrowUp />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        multiple
        onChange={e => {
          if (!e.target.files) return;
          Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
              if (ev.target?.result) addItem(ev.target.result as string);
            };
            reader.readAsDataURL(file);
          });
        }}
      />
    </div>
  );
};

export default App;
