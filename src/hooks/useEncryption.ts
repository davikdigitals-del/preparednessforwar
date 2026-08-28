import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Encryption from '@/lib/encryption';

/**
 * Hook for using end-to-end encryption in React components
 * Automatically encrypts/decrypts user data
 */
export function useEncryption() {
  const { user } = useAuth();
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Generate master key from user session
  useEffect(() => {
    if (user) {
      // In production, derive this from user's password during login
      // For now, use user ID as base
      const sessionKey = Encryption.generateSessionKey(user.id, user.email);
      setMasterKey(sessionKey);
      setIsUnlocked(true);
    } else {
      setMasterKey(null);
      setIsUnlocked(false);
    }
  }, [user]);

  /**
   * Encrypt data before sending to server
   */
  const encrypt = async (data: string): Promise<string | null> => {
    if (!masterKey) {
      console.error('Cannot encrypt: No master key available');
      return null;
    }

    try {
      return await Encryption.encrypt(data, masterKey);
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  /**
   * Decrypt data received from server
   */
  const decrypt = async (encryptedData: string): Promise<string | null> => {
    if (!masterKey) {
      console.error('Cannot decrypt: No master key available');
      return null;
    }

    try {
      return await Encryption.decrypt(encryptedData, masterKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  };

  /**
   * Encrypt and store data securely
   */
  const secureStore = async (key: string, value: string): Promise<void> => {
    if (!masterKey) return;
    await Encryption.secureStore(key, value, masterKey);
  };

  /**
   * Retrieve and decrypt stored data
   */
  const secureRetrieve = async (key: string): Promise<string | null> => {
    if (!masterKey) return null;
    return await Encryption.secureRetrieve(key, masterKey);
  };

  return {
    encrypt,
    decrypt,
    secureStore,
    secureRetrieve,
    isUnlocked,
    masterKey: masterKey ? '***hidden***' : null, // Never expose actual key
  };
}
