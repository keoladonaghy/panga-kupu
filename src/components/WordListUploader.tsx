import React, { useRef, useState } from 'react';
import { Upload, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface WordListUploaderProps {
  onWordsUpdated: (words: string[]) => void;
  onClose: () => void;
}

const WordListUploader: React.FC<WordListUploaderProps> = ({ onWordsUpdated, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewWords, setPreviewWords] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      
      // Parse words from file - support both line-separated and comma-separated
      let words: string[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Handle CSV format
        words = text.split(/[,\n\r]+/).map(word => word.trim()).filter(word => word.length > 0);
      } else {
        // Handle text format (line-separated)
        words = text.split(/[\n\r]+/).map(word => word.trim()).filter(word => word.length > 0);
      }

      // Basic validation and normalization
      const validWords = words.filter(word => {
        // Remove quotes if present
        let cleanWord = word.replace(/^["']|["']$/g, '');
        
        // Normalize different apostrophe characters to Unicode 2018 (')
        // Handle: ' (U+0027), ʻ (U+02BB), ` (U+0060) → ' (U+2018)
        cleanWord = cleanWord.replace(/['ʻ`]/g, '\u2018');
        
        // Check if it's a valid Hawaiian word (now expecting Unicode 2018)
        const isValid = /^[a-zA-ZāēīōūĀĒĪŌŪ\u2018]+$/.test(cleanWord) && cleanWord.length >= 2;
        
        // Debug: log all words to see what's being processed
        console.log('Processing word:', word, '→ cleaned:', cleanWord, '→ valid:', isValid);
        
        return isValid;
      }).map(word => {
        // Apply the same normalization to the final words
        let cleanWord = word.replace(/^["']|["']$/g, '');
        cleanWord = cleanWord.replace(/['ʻ`]/g, '\u2018');
        return cleanWord;
      });

      if (validWords.length === 0) {
        throw new Error('No valid words found in file');
      }

      setPreviewWords(validWords);
      
      toast({
        title: "File processed successfully",
        description: `Found ${validWords.length} valid words`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const validTypes = ['.txt', '.csv'];
    const isValidType = validTypes.some(type => file.name.toLowerCase().endsWith(type));
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .csv file",
        variant: "destructive"
      });
      return;
    }

    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleConfirmUpload = () => {
    if (previewWords.length > 0) {
      onWordsUpdated(previewWords);
      toast({
        title: "Word list updated!",
        description: `Updated with ${previewWords.length} words`,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Word List</h2>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {!previewWords.length ? (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop your word list file
              </div>
              <div className="text-gray-600 mb-4">
                or click to browse
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Choose File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Supported formats:</div>
                  <div>• Text files (.txt) - one word per line</div>
                  <div>• CSV files (.csv) - comma-separated words</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                {previewWords.length} words ready to upload
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="text-sm font-medium text-gray-700 mb-2">Preview (first 50 words):</div>
              <div className="grid grid-cols-4 gap-1 text-sm">
                {previewWords.slice(0, 50).map((word, index) => (
                  <div key={index} className="px-2 py-1 bg-white rounded text-gray-800">
                    {word}
                  </div>
                ))}
              </div>
              {previewWords.length > 50 && (
                <div className="text-gray-600 text-sm mt-2">
                  ...and {previewWords.length - 50} more words
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setPreviewWords([])}>
                Choose Different File
              </Button>
              <Button onClick={handleConfirmUpload}>
                Update Word List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordListUploader;