import { describe, it, expect, vi } from 'vitest';
import { uploadAvatar, validateImageFile } from '../supabaseHelpers';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({
          data: { path: 'avatars/user-123.jpg' },
          error: null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/avatar.jpg' },
        })),
      })),
    },
  },
}));

describe('uploadAvatar Security Tests', () => {
  it('should reject files larger than 5MB', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    await expect(uploadAvatar(largeFile, 'user-123')).rejects.toThrow(
      'trop volumineux'
    );
  });

  it('should reject non-image MIME types', async () => {
    const maliciousFile = new File(['malicious content'], 'malicious.exe', {
      type: 'application/x-executable',
    });

    await expect(uploadAvatar(maliciousFile, 'user-123')).rejects.toThrow(
      'Type de fichier non autorisé'
    );
  });

  it('should reject files with dangerous extensions', async () => {
    const dangerousFile = new File(['content'], 'script.php', {
      type: 'image/jpeg', // Fake MIME type
    });

    await expect(uploadAvatar(dangerousFile, 'user-123')).rejects.toThrow(
      'Extension de fichier non autorisée'
    );
  });

  it('should reject files where MIME type does not match extension', async () => {
    const mismatchedFile = new File(['content'], 'image.jpg', {
      type: 'image/png', // Valid image type but doesn't match .jpg extension
    });

    await expect(uploadAvatar(mismatchedFile, 'user-123')).rejects.toThrow(
      'Le type MIME du fichier ne correspond pas'
    );
  });

  it('should accept valid image files', async () => {
    const validFile = new File(['image content'], 'avatar.jpg', {
      type: 'image/jpeg',
    });

    // This should not throw
    await expect(uploadAvatar(validFile, 'user-123')).resolves.toBeDefined();
  });

  it('should sanitize file extensions', async () => {
    const fileWithUppercase = new File(['content'], 'AVATAR.JPG', {
      type: 'image/jpeg',
    });

    // Should handle uppercase extensions
    await expect(
      uploadAvatar(fileWithUppercase, 'user-123')
    ).resolves.toBeDefined();
  });
});

describe('validateImageFile', () => {
  it('should validate file size', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    expect(() => validateImageFile(largeFile)).toThrow('trop volumineux');
  });

  it('should validate MIME type', () => {
    const invalidFile = new File(['content'], 'file.txt', {
      type: 'text/plain',
    });

    expect(() => validateImageFile(invalidFile)).toThrow(
      'Type de fichier non autorisé'
    );
  });
});

