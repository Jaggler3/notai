export function hasNonFaceEmojis(text: string): boolean {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1FAB0}-\u{1FABF}]|[\u{1F4A0}-\u{1F4AF}]|[\u{1F4B0}-\u{1F4BF}]|[\u{1F4C0}-\u{1F4CF}]|[\u{1F4D0}-\u{1F4DF}]|[\u{1F4E0}-\u{1F4EF}]|[\u{1F4F0}-\u{1F4FF}]|[\u{1F500}-\u{1F50F}]|[\u{1F510}-\u{1F51F}]|[\u{1F520}-\u{1F52F}]|[\u{1F530}-\u{1F53F}]|[\u{1F540}-\u{1F54F}]|[\u{1F550}-\u{1F55F}]|[\u{1F560}-\u{1F56F}]|[\u{1F570}-\u{1F57F}]|[\u{1F580}-\u{1F58F}]|[\u{1F590}-\u{1F59F}]|[\u{1F5A0}-\u{1F5AF}]|[\u{1F5B0}-\u{1F5BF}]|[\u{1F5C0}-\u{1F5CF}]|[\u{1F5D0}-\u{1F5DF}]|[\u{1F5E0}-\u{1F5EF}]|[\u{1F5F0}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F650}-\u{1F65F}]|[\u{1F660}-\u{1F66F}]|[\u{1F670}-\u{1F67F}]|[\u{1F680}-\u{1F68F}]|[\u{1F690}-\u{1F69F}]|[\u{1F6A0}-\u{1F6AF}]|[\u{1F6B0}-\u{1F6BF}]|[\u{1F6C0}-\u{1F6CF}]|[\u{1F6D0}-\u{1F6DF}]|[\u{1F6E0}-\u{1F6EF}]|[\u{1F6F0}-\u{1F6FF}]|[\u{1F910}-\u{1F91F}]|[\u{1F920}-\u{1F92F}]|[\u{1F930}-\u{1F93F}]|[\u{1F940}-\u{1F94F}]|[\u{1F950}-\u{1F95F}]|[\u{1F960}-\u{1F96F}]|[\u{1F970}-\u{1F97F}]|[\u{1F980}-\u{1F98F}]|[\u{1F990}-\u{1F99F}]|[\u{1F9A0}-\u{1F9AF}]|[\u{1F9B0}-\u{1F9BF}]|[\u{1F9C0}-\u{1F9CF}]|[\u{1F9D0}-\u{1F9DF}]|[\u{1F9E0}-\u{1F9EF}]|[\u{1F9F0}-\u{1F9FF}]/gu;
  
  const emojis = text.match(emojiRegex);
  if (!emojis) return false;
  
  const faceEmojiRanges: [number, number][] = [
    [0x1F600, 0x1F64F], // Emoticons
    [0x1F910, 0x1F92F], // Face with hand covering mouth, nauseated face, etc.
    [0x1F930, 0x1F93F], // Pregnant woman, etc.
    [0x1F970, 0x1F97F], // Smiling face with hearts, etc.
    [0x1F9D0, 0x1F9DF], // Yawning face, etc.
    [0x1FA70, 0x1FA7F], // Ballet shoes, etc.
    [0x1FA80, 0x1FA8F], // Yo-yo, etc.
    [0x1FA90, 0x1FA9F], // Ringed planet, etc.
    [0x1FAA0, 0x1FAAF], // Hamsa, etc.
    [0x1FAB0, 0x1FABF], // Fly, etc.
    [0x1FAC0, 0x1FAFF]  // Heart hands, etc.
  ];
  
  for (const emoji of emojis) {
    const codePoint = emoji.codePointAt(0);
    if (codePoint === undefined) continue;
    
    let isFaceEmoji = false;
    
    for (const [start, end] of faceEmojiRanges) {
      if (codePoint >= start && codePoint <= end) {
        isFaceEmoji = true;
        break;
      }
    }
    
    if (!isFaceEmoji) {
      return true;
    }
  }
  
  return false;
}
