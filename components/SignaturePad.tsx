"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, PenTool } from "lucide-react";

interface SignaturePadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [hasSignature, setHasSignature] = React.useState(false);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0f172a"; // Slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      onChange(canvas.toDataURL("image/png"));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  // Ajustar tamaño del canvas al montar
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Si ya hay un valor y el canvas está vacío, podríamos restaurar, pero típicamente se firma directamente
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!value) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      return;
    }
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setHasSignature(true);
    };
    image.src = value;
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <PenTool className="w-3.5 h-3.5 text-[#E31E24]" />
          <span>Firma Digital del Asesor (Dibuja con el mouse o tu dedo)</span>
        </div>
        {hasSignature && (
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Check className="w-3 h-3" /> Firma capturada
          </span>
        )}
      </div>

      <div className="relative border-2 border-dashed border-slate-300 hover:border-slate-400 transition-colors rounded-xl bg-white overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-32 touch-none cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Línea guía de firma */}
        <div className="absolute bottom-6 left-8 right-8 border-b border-slate-200 pointer-events-none flex justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
            X Línea de firma
          </span>
        </div>

        {/* Placeholder mientras no hay firma */}
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
            Haz clic o desliza aquí para firmar tu compromiso
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
          className="text-xs text-slate-500 hover:text-rose-600 h-7 px-2"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Limpiar firma
        </Button>
      </div>
    </div>
  );
}
