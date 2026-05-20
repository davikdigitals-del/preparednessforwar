import { supabase } from "@/integrations/supabase/client";
import type { OfflineContent, OfflineContentStats } from "@/types/memberPortal";

export class OfflineService {
  private static serviceWorker: ServiceWorker | null = null;

  /**
   * Register service worker for offline capability
   */
  static async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      
      if (registration.active) {
        this.serviceWorker = registration.active;
      }

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Check if user is online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Download content for offline access
   */
  static async downloadContent(
    userId: string,
    contentType: 'course' | 'video' | 'podcast' | 'library' | 'article',
    contentId: string,
    contentTitle: string,
    contentUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Send message to service worker to cache the content
      const messageChannel = new MessageChannel();
      
      const promise = new Promise<{ success: boolean; error?: string }>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: event.data.error });
          }
        };
      });

      if (this.serviceWorker) {
        this.serviceWorker.postMessage(
          {
            type: 'CACHE_CONTENT',
            url: contentUrl,
            contentType,
            contentId,
          },
          [messageChannel.port2]
        );
      }

      const result = await promise;

      if (result.success) {
        // Record in database
        const { error } = await supabase.from('offline_content').upsert({
          user_id: userId,
          content_type: contentType,
          content_id: contentId,
          content_title: contentTitle,
          downloaded_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      return result;
    } catch (error: any) {
      console.error('Download failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove content from offline storage
   */
  static async removeContent(
    userId: string,
    contentId: string,
    contentUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove from service worker cache
      const messageChannel = new MessageChannel();
      
      const promise = new Promise<{ success: boolean; error?: string }>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: event.data.error });
          }
        };
      });

      if (this.serviceWorker) {
        this.serviceWorker.postMessage(
          {
            type: 'REMOVE_CACHED_CONTENT',
            url: contentUrl,
          },
          [messageChannel.port2]
        );
      }

      const result = await promise;

      if (result.success) {
        // Remove from database
        const { error } = await supabase
          .from('offline_content')
          .delete()
          .eq('user_id', userId)
          .eq('content_id', contentId);

        if (error) throw error;
      }

      return result;
    } catch (error: any) {
      console.error('Remove failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's offline content
   */
  static async getUserOfflineContent(userId: string): Promise<OfflineContent[]> {
    try {
      const { data, error } = await supabase
        .from('offline_content')
        .select('*')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch offline content:', error);
      return [];
    }
  }

  /**
   * Get offline content statistics
   */
  static async getOfflineStats(userId: string): Promise<OfflineContentStats> {
    try {
      const content = await this.getUserOfflineContent(userId);

      const stats: OfflineContentStats = {
        totalItems: content.length,
        totalSize: content.reduce((sum, item) => sum + (item.content_size || 0), 0),
        byType: {
          course: content.filter(c => c.content_type === 'course').length,
          video: content.filter(c => c.content_type === 'video').length,
          podcast: content.filter(c => c.content_type === 'podcast').length,
          library: content.filter(c => c.content_type === 'library').length,
          article: content.filter(c => c.content_type === 'article').length,
        },
      };

      return stats;
    } catch (error) {
      console.error('Failed to get offline stats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        byType: { course: 0, video: 0, podcast: 0, library: 0, article: 0 },
      };
    }
  }

  /**
   * Check if content is available offline
   */
  static async isContentOffline(userId: string, contentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('offline_content')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update last accessed time
   */
  static async updateLastAccessed(userId: string, contentId: string): Promise<void> {
    try {
      await supabase
        .from('offline_content')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('content_id', contentId);
    } catch (error) {
      console.error('Failed to update last accessed:', error);
    }
  }

  /**
   * Clear all offline content
   */
  static async clearAllContent(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear service worker cache
      const messageChannel = new MessageChannel();
      
      const promise = new Promise<{ success: boolean; error?: string }>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve({ success: true });
          } else {
            resolve({ success: false, error: event.data.error });
          }
        };
      });

      if (this.serviceWorker) {
        this.serviceWorker.postMessage(
          { type: 'CLEAR_ALL_CACHE' },
          [messageChannel.port2]
        );
      }

      const result = await promise;

      if (result.success) {
        // Clear database records
        const { error } = await supabase
          .from('offline_content')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      }

      return result;
    } catch (error: any) {
      console.error('Clear all failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Format bytes to human readable size
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
