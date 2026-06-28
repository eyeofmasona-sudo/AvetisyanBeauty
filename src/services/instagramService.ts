import { InstagramPost } from "../store/contentStore";

export const instagramService = {
  /**
   * Save the Instagram token securely on the server
   */
  async saveToken(token: string, accountIndex: number = 0, handle: string = ''): Promise<boolean> {
    try {
      const response = await fetch('/api/instagram/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, accountIndex, handle }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to save Instagram token:', error);
      return false;
    }
  },

  /**
   * Fetch the connection status of Instagram accounts
   */
  async fetchStatus(): Promise<any[]> {
    try {
      const response = await fetch('/api/instagram/status');
      if (!response.ok) {
        throw new Error('Failed to fetch status from server');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Instagram status:', error);
      return [];
    }
  },

  /**
   * Remove the Instagram token from the server
   */
  async removeToken(accountIndex: number = 0): Promise<boolean> {
    try {
      const response = await fetch('/api/instagram/token/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountIndex }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to remove Instagram token:', error);
      return false;
    }
  },

  /**
   * Fetch latest posts using the securely stored token
   */
  async fetchPosts(): Promise<InstagramPost[]> {
    try {
      const response = await fetch('/api/instagram/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts from server');
      }
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Failed to fetch Instagram posts:', error);
      throw error;
    }
  }
};
