
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadSectionProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploadSection = ({ files, onFilesChange }: FileUploadSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(`Type de fichier non autorisé: ${file.name}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Fichier trop volumineux: ${file.name} (max 10MB)`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(validateFile);
    
    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
      toast.success(`${validFiles.length} fichier(s) ajouté(s)`);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Fichiers du produit</h3>
      
      <div 
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Téléchargez vos images</p>
        <p className="text-muted-foreground mb-4">
          Photos du produit, logo, visuels à utiliser (JPG, PNG, PDF)
        </p>
        <Button variant="outline" type="button">
          Choisir des fichiers
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{files.length} fichier(s) sélectionné(s)</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
