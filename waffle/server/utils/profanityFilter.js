// List of profanities to filter (keeping it relatively clean but comprehensive)
const profanityList = [
  'ass',
  'asshole',
  'bastard',
  'bitch',
  'bollocks',
  'bullshit',
  'cock',
  'crap',
  'cunt',
  'damn',
  'dick',
  'douche',
  'fag',
  'fuck',
  'goddamn',
  'hell',
  'homo',
  'jerk',
  'nigger',
  'nigga',
  'piss',
  'prick',
  'pussy',
  'retard',
  'shit',
  'slut',
  'twat',
  'whore',
  'wanker',
];

/**
 * Check if a name contains profanity
 * @param {string} name - The name to check
 * @returns {{ isClean: boolean, reason?: string }}
 */
function checkProfanity(name) {
  const lowerName = name.toLowerCase().replace(/[^a-z]/g, '');

  for (const word of profanityList) {
    if (lowerName.includes(word)) {
      return {
        isClean: false,
        reason: 'Name contains inappropriate language',
      };
    }
  }

  return { isClean: true };
}

module.exports = { checkProfanity, profanityList };
