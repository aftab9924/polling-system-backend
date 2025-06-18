import Poll from '../models/Poll.js';

export const getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    console.error('❌ Failed to fetch past polls:', err.message);
    res.status(500).json({ error: 'Server error while fetching polls' });
  }
};
