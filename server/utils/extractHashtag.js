export const extractHashtags = (caption) => {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;

    while ((match = hashtagRegex.exec(caption)) !== null) {
        hashtags.push(match[1]);
    }

    return hashtags;
};