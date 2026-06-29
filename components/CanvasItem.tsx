import React from 'react';
import { X, Scaling, Image as ImageIcon, ZoomIn, ZoomOut } from 'lucide-react';

export const CanvasItem = ({
  item,
  isActive,
  onPointerDown,
  onResizeStart,
  onResizeDiscrete,
  onRemove,
  onBringToFront,
  onSetBackground
}) => {
  return (
    <div
      className={`absolute select-none ${isActive ? 'z-50' : ''}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        zIndex: item.zIndex,
        transform: `rotate(${item.rotation}deg)`,
        cursor: isActive ? 'grabbing' : 'grab',
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onBringToFront(item.id);
        onPointerDown(e, item.id);
      }}
    >
      <div className="relative bg-[#FFF7D3]/50 p-2 rounded-sm shadow-lg">
        <img
          src={item.content}
          className="w-full h-auto pointer-events-none block"
          draggable={false}
        />

        {isActive && (
          <div className="absolute inset-0 border-2 border-[#CE7200] pointer-events-none" />
        )}

        {isActive && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 bg-[#804100]/80 p-2 rounded-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResizeDiscrete(item.id, -20);
              }}
            >
              <ZoomOut size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onResizeDiscrete(item.id, 20);
              }}
            >
              <ZoomIn size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetBackground(item.content);
              }}
            >
              <ImageIcon size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
            >
              <X size={16} />
            </button>

            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeStart(e, item.id);
              }}
              className="cursor-nwse-resize"
            >
              <Scaling size={14} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
