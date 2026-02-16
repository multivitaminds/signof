import React, { useRef, useState, useEffect, useCallback } from 'react';
import './SignaturePad.css';

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  width?: number;
  height?: number;
  penColor?: string;
  penSize?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  width,
  height = 300,
  penColor = '#000000',
  penSize = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const isEmpty = strokes.length === 0 && currentStroke.length === 0;

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      let clientX: number;
      let clientY: number;

      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (!('touches' in e)) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return { x: 0, y: 0 };
      }

      // Coordinates in CSS pixel space (ctx.scale handles DPR)
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, points: Point[]) => {
      if (points.length < 2) return;
      const firstPoint = points[0];
      if (!firstPoint) return;
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        if (point) {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    },
    [penColor, penSize]
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => drawStroke(ctx, stroke));
  }, [strokes, drawStroke]);

  // Resize canvas to match CSS dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: cssWidth, height: cssHeight } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, []);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const point = getCanvasPoint(e);
      setIsDrawing(true);
      setCurrentStroke([point]);
    },
    [getCanvasPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const point = getCanvasPoint(e);
      setCurrentStroke((prev) => {
        const updated = [...prev, point];
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw incremental line segment for smooth rendering
            const prevPoint = prev[prev.length - 1];
            if (prevPoint) {
              ctx.strokeStyle = penColor;
              ctx.lineWidth = penSize;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.beginPath();
              ctx.moveTo(prevPoint.x, prevPoint.y);
              ctx.lineTo(point.x, point.y);
              ctx.stroke();
            }
          }
        }
        return updated;
      });
    },
    [isDrawing, getCanvasPoint, penColor, penSize]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentStroke((prev) => {
      if (prev.length > 1) {
        setStrokes((s) => [...s, prev]);
      }
      return [];
    });
  }, [isDrawing]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL());
  }, [onSave, isEmpty]);

  const canvasStyle: React.CSSProperties = {
    width: width ?? '100%',
    height,
  };

  return (
    <div className="signature-pad">
      <div className="signature-pad__canvas-wrapper">
        <canvas
          ref={canvasRef}
          className={`signature-pad__canvas${isEmpty ? ' signature-pad__canvas--empty' : ''}`}
          style={canvasStyle}
          role="img"
          aria-label="Signature drawing area. Use mouse or touch to draw your signature."
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        {isEmpty && (
          <span className="signature-pad__placeholder">
            Sign here
          </span>
        )}
      </div>
      <div className="signature-pad__toolbar">
        <div className="signature-pad__toolbar-group">
          <button
            type="button"
            className="signature-pad__btn signature-pad__btn--secondary"
            onClick={handleClear}
            disabled={isEmpty}
          >
            Clear
          </button>
          <button
            type="button"
            className="signature-pad__btn signature-pad__btn--secondary"
            onClick={handleUndo}
            disabled={isEmpty}
          >
            Undo
          </button>
        </div>
        <div className="signature-pad__toolbar-group signature-pad__toolbar-group--actions">
          {onCancel && (
            <button
              type="button"
              className="signature-pad__btn signature-pad__btn--cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            className="signature-pad__btn signature-pad__btn--primary"
            onClick={handleSave}
            disabled={isEmpty}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
