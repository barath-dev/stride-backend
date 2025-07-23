const models = require('../../models');

const createChallenge = async (req, res) => {
  try {
    const challenge = await models.Challenge.create({
      title: req.body.name,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      creatorId: req.user.id,
    });
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Error creating challenge' });
  }
};

module.exports = createChallenge;
