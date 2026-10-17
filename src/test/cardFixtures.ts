// Test data for saved cards: what the Create page saves for Pikachu.
// The answers + photo + sticker, the Pokémon, and its genus and attacks
export const newPikachuCard = {
  card: {
    name: 'Amit',
    age: 30,
    superpower: 'Super speed',
    aboutYou: 'I love Pokémon cards!',
    photo: { dataUrl: 'data:image/jpeg;base64,AAAA', type: 'image/jpeg' as const, size: 3 },
    stickerPosition: { x: 69.8, y: 52 },
  },
  pokemon: {
    id: 25,
    name: 'pikachu',
    gameTypes: ['electric'],
    height: 4,
    weight: 60,
    artworkUrl: 'https://example.com/25.png',
  },
  info: {
    genus: 'Mouse Pokémon',
    attacks: [{ name: 'Thunder Shock', damage: 40, cost: ['Lightning' as const, 'Colorless' as const] }],
  },
}
