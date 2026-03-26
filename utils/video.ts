/**
 * Converts common video URLs (YouTube, Vimeo) to their embed equivalents.
 * Returns the original URL if no conversion is possible.
 */
export function getEmbedUrl(url: string | null | undefined): string {
    if (!url) return "";

    // YouTube
    // Matches: youtube.com/watch?v=ID, youtube.com/shorts/ID, youtu.be/ID, youtube-nocookie.com/embed/ID
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    // Matches: vimeo.com/ID, vimeo.com/channels/*/ID, vimeo.com/groups/*/videos/ID, player.vimeo.com/video/ID
    const vimeoRegex = /(?:vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/[^\/]+\/video\/|)|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
}

/**
 * Extracts a thumbnail URL for a video if possible.
 */
export function getVideoThumbnail(url: string | null | undefined): string | null {
    if (!url) return null;

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }

    return null;
}
