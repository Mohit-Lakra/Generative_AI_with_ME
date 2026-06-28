const aiClient = {
  ocr: async (imageBase64) => {
    const response = await fetch(`${process.env.AI_SERVICE_URL}/internal/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY
      },
      body: JSON.stringify({ image_base64: imageBase64 })
    });
    if (!response.ok) throw new Error('AI Service OCR failed');
    return await response.json();
  },
  embed: async (noteId, userId, text) => {
    const response = await fetch(`${process.env.AI_SERVICE_URL}/internal/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY
      },
      body: JSON.stringify({ note_id: noteId, user_id: userId, text })
    });
    if (!response.ok) throw new Error('AI Service Embed failed');
    return await response.json();
  },
  ask: async (userId, question) => {
    const response = await fetch(`${process.env.AI_SERVICE_URL}/internal/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY
      },
      body: JSON.stringify({ user_id: userId, question })
    });
    if (!response.ok) throw new Error('AI Service Ask failed');
    return await response.json();
  },
  generateFlashcards: async (topicId, chunks, count = 8) => {
    const response = await fetch(`${process.env.AI_SERVICE_URL}/internal/flashcards/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Key': process.env.INTERNAL_API_KEY
      },
      body: JSON.stringify({ topic_id: topicId, chunks, count })
    });
    if (!response.ok) throw new Error('AI Service Flashcards failed');
    return await response.json();
  }
};

module.exports = aiClient;
