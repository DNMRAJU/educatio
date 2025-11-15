import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader, AlertCircle } from 'lucide-react';
import { generateFreepikImage } from '../services/api';

const SceneDisplay = ({ scene, sceneIndex }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      // Check if scene has image or visual prompt
      const prompt = scene.image_prompt || scene.visual_prompt;
      
      if (prompt) {
        setIsLoading(true);
        setError(null);
        
        try {
          const url = await generateFreepikImage(prompt);
          if (url) {
            setImageUrl(url);
          } else {
            setError('Image generation failed');
          }
        } catch (err) {
          console.error('Error generating image:', err);
          setError('Failed to load image');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadImage();
  }, [scene.image_prompt, scene.visual_prompt]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      {/* Concept Label */}
      {scene.concept_label && (
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {scene.concept_label}
          </span>
        </div>
      )}

      {/* Educational Text */}
      {scene.educational_text && (
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {scene.educational_text}
          </p>
        </div>
      )}

      {/* Onscreen Text (if present) */}
      {scene.onscreen_text && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-gray-700 font-medium">{scene.onscreen_text}</p>
        </div>
      )}

      {/* Image Display */}
      {(scene.image_prompt || scene.visual_prompt) && (
        <div className="mt-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
              <Loader className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">Generating image...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {imageUrl && !isLoading && (
            <div className="relative">
              <img
                src={imageUrl}
                alt={scene.alt_text || scene.concept_label || 'Educational illustration'}
                className="w-full rounded-lg shadow-md"
                loading="lazy"
              />
              {scene.alt_text && (
                <p className="mt-2 text-sm text-gray-500 italic">{scene.alt_text}</p>
              )}
            </div>
          )}

          {!imageUrl && !isLoading && !error && (
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <ImageIcon className="w-8 h-8 text-gray-400 mr-2" />
              <span className="text-gray-500">Image will be generated</span>
            </div>
          )}
        </div>
      )}

      {/* Duration indicator */}
      {scene.duration_sec && (
        <div className="mt-3 text-xs text-gray-400">
          Duration: {scene.duration_sec}s
        </div>
      )}
    </div>
  );
};

export default SceneDisplay;
