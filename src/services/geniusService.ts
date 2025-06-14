const GENIUS_API_URL = 'https://api.genius.com';

export class GeniusService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchSong(query: string) {
    try {
      const response = await fetch(`${GENIUS_API_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search song');
      }

      const data = await response.json();
      return data.response.hits[0]?.result;
    } catch (error) {
      console.error('Error searching song:', error);
      throw error;
    }
  }

  async getLyrics(songId: number) {
    try {
      // First get the song details
      const response = await fetch(`${GENIUS_API_URL}/songs/${songId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get song details');
      }

      const data = await response.json();
      const song = data.response.song;

      // Then fetch the lyrics from the song's URL
      const lyricsResponse = await fetch(song.url);
      const html = await lyricsResponse.text();

      // Extract lyrics from the HTML
      // This is a simple implementation - you might want to use a proper HTML parser
      const lyricsMatch = html.match(/<div class="Lyrics__Container-sc-[^>]*>([\s\S]*?)<\/div>/);
      if (lyricsMatch) {
        const lyrics = lyricsMatch[1]
          .replace(/<[^>]*>/g, '\n') // Replace HTML tags with newlines
          .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
          .trim();
        return {
          lyrics,
          title: song.title,
          artist: song.primary_artist.name
        };
      }

      throw new Error('Could not extract lyrics');
    } catch (error) {
      console.error('Error getting lyrics:', error);
      throw error;
    }
  }
} 