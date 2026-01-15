
import React, { useState } from 'react';
import { GeminiService } from '../services/gemini.ts';

interface AnimateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnimateModal: React.FC<AnimateModalProps> = ({ isOpen, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const url = await GeminiService.animateImage(image, prompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-secondary text-white">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-film text-primary"></i>
            Animate Memories
          </h3>
          <button onClick={onClose} className="hover:text-red-400 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {!videoUrl ? (
            <>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase">1. Upload Image</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer relative">
                  {image ? (
                    <img src={image} className="max-h-48 mx-auto rounded-lg shadow-md" alt="Preview" />
                  ) : (
                    <div className="py-4">
                      <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-300 mb-2"></i>
                      <p className="text-gray-500">Click to upload a financial milestone or memory</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 uppercase">2. Describe Animation (Optional)</label>
                <textarea 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-primary focus:bg-white outline-none"
                  placeholder="e.g. A gentle pan across the scene with warm lighting..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Aspect Ratio</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setAspectRatio('16:9')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm ${aspectRatio === '16:9' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            16:9
                        </button>
                        <button 
                            onClick={() => setAspectRatio('9:16')}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm ${aspectRatio === '9:16' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            9:16
                        </button>
                    </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              <button 
                disabled={!image || loading}
                onClick={handleGenerate}
                className="w-full py-4 bg-secondary text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-black disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Create Cinematic Video
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video flex items-center justify-center">
                <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full" />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setVideoUrl(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Create Another
                </button>
                <a 
                  href={videoUrl} 
                  download="smart-expense-memory.mp4"
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-download"></i> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimateModal;
