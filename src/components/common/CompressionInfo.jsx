import React from 'react';
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '../../utils/imageStorage';

const CompressionInfo = ({ imageData, className = '' }) => {
  if (!imageData || typeof imageData !== 'object' || !imageData.compressed) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <CheckCircleIcon className="h-4 w-4 text-green-600" />
      <span className="text-green-700">
        Compressed {imageData.compressionRatio}%
      </span>
      {imageData.compressedSize && (
        <span className="text-gray-500">
          ({formatFileSize(imageData.compressedSize)})
        </span>
      )}
    </div>
  );
};

export default CompressionInfo;
