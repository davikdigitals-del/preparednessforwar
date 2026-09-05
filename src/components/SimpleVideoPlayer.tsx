import React, { useState } from 'react';

interface SimpleVideoPlayerProps {
  url: string;
  title: string;
}

export function SimpleVideoPlayer({ url, title }: SimpleVideoPlayerProps) {
  const [loadError, setLoadError] = useState(false);

  // Simple iframe embed for basic video display in rich text
  return (
    <div className="relative w-full my-6">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {loadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-2">Video Unavailable</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View Original
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={true}
            onError={() => setLoadError(true)}
            style={{
              border: 'none',
              outline: 'none',
              background: '#f3f4f6'
            }}
          />
        )}
      </div>
    </div>
  );
}