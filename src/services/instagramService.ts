import { InstagramPost } from "../store/contentStore";

export const instagramService = {
  /**
   * Save the Instagram token securely on the server
   */
  async saveToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/instagram/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to save Instagram token:', error);
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
