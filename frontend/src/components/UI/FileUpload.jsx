import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useSettings } from '../../context/SettingsContext.jsx';
// import LazyImage from './LazyImage';

const FileUpload = React.memo(({ onFileSelect, accept, maxSize, multiple = false, selectedFile = null }) => {
  const { settings } = useSettings();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileSize = settings?.analysis?.maxFileSize || 500;

  useEffect(() => {
    if (selectedFile) {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 50);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setIsVideo(selectedFile.type.startsWith('video/'));
      
      // Extract metadata
      const metadata = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: new Date(selectedFile.lastModified).toLocaleDateString(),
        dimensions: null
      };

      // Get image dimensions
      if (selectedFile.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          setFileMetadata({ ...metadata, dimensions: `${img.width} × ${img.height}px` });
        };
        img.src = objectUrl;
      } else {
        setFileMetadata(metadata);
      }

      return () => {
        URL.revokeObjectURL(objectUrl);
        clearInterval(progressInterval);
      };
    } else {
      setPreview(null);
      setIsVideo(false);
      setFileMetadata(null);
      setUploadProgress(0);
    }
  }, [selectedFile]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      onFileSelect(null, error.message);
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0], null);
    }
  }, [onFileSelect]);

  const dropzoneConfig = useMemo(() => ({
    onDrop,
    accept,
    maxSize,
    multiple,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  }), [onDrop, accept, maxSize, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneConfig);

  return (
    <motion.div
      {...getRootProps()}
      className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragActive || dragActive 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input {...getInputProps()} />
      
      <AnimatePresence>
        {(isDragActive || dragActive) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>
      
      <div className="relative flex flex-col items-center space-y-4">
        <AnimatePresence mode="wait">
          {selectedFile && preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full space-y-4"
            >
              <div className="relative group">
                {isVideo ? (
                  <video 
                    src={preview} 
                    className="w-full h-64 object-contain rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={preview} 
                    alt={selectedFile.name}
                    className="w-full h-64 object-contain rounded-xl shadow-2xl bg-gradient-to-br from-gray-50 to-gray-100"
                  />
                )}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1">
                  <span>{isVideo ? '🎥' : '🖼️'}</span>
                  <span>{isVideo ? 'Video' : 'Image'}</span>
                </div>
                {uploadProgress < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="text-gray-900 font-bold text-base truncate mb-2" title={selectedFile.name}>
                  📄 {selectedFile.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">Size:</span>
                    <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">Type:</span>
                    <span>{selectedFile.type.split('/')[1]?.toUpperCase()}</span>
                  </div>
                  {fileMetadata?.dimensions && (
                    <div className="flex items-center space-x-1 col-span-2">
                      <span className="font-semibold">Dimensions:</span>
                      <span>{fileMetadata.dimensions}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 col-span-2">
                    <span className="font-semibold">Modified:</span>
                    <span>{fileMetadata?.lastModified}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null, null);
                }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove File</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: isDragActive ? [1, 1.1, 1] : 1,
                    rotate: isDragActive ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-4xl">{isDragActive ? '🎯' : '📁'}</span>
                </motion.div>
                <motion.p 
                  className="text-2xl font-bold text-gray-900 mb-2"
                  animate={{ scale: isDragActive ? 1.05 : 1 }}
                >
                  {isDragActive ? 'Drop Your File Here!' : 'Upload Your File'}
                </motion.p>
                <p className="text-gray-600">
                  Drag & drop or <span className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">click to browse</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-xl p-4 border-2 border-green-200 shadow-sm"
                >
                  <div className="flex items-center space-x-2 text-green-700 font-bold mb-2">
                    <span>✓</span>
                    <span>Supported Formats</span>
                  </div>
                  <div className="text-gray-700 text-xs space-y-1">
                    <div>📷 Images: JPG, PNG, GIF, WebP</div>
                    <div>🎬 Videos: MP4, AVI, MOV, WebM</div>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-200 shadow-sm"
                >
                  <div className="flex items-center space-x-2 text-blue-700 font-bold mb-2">
                    <span>📊</span>
                    <span>Max File Size</span>
                  </div>
                  <div className="text-gray-700 text-xs space-y-1">
                    <div>🖼️ Images: Up to {fileSize}MB</div>
                    <div>🎥 Videos: Up to {fileSize}MB</div>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Secure & encrypted upload</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
