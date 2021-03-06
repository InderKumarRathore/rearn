import requireLogin from '../middlewares/requireLogin';
import CardSet from '../models/CardSet';
import User from '../models/User';

export default function setRoutes(server) {
  server.post(
    '/api/newset',
    requireLogin,
    async (req, res) => {
      const { setName, cards } = req.body;
      const newSet = new CardSet({
        cards: cards.map(card =>
          ({
            question: card.question,
            answer: card.answer,
            hint: card.hint,
          })),
        createdAt: Date.now(),
        title: setName,
        score: 0,
        timeSpent: 0,
        _user: req.user.id,
      });
      // console.log(newSet);
      // Save set
      try {
        await newSet.save((err) => { // eslint-disable-next-line
        if (err) return console.error(err);
          return res.send(newSet);
        });
      } catch (err) {
        res.status(422);
      }
    },
  );

  server.get('/api/sets', requireLogin, async (req, res) => {
    const sets = await CardSet.find({ _user: req.user.id })
      .select('cards createdAt title score timeSpent');
    res.send(sets);
  });

  server.post('/api/lastset', requireLogin, async (req, res) => {
    const { setID, lastTime } = req.body;
    User.findOneAndUpdate({
      _id: req.user._id, // eslint-disable-line
    }, {
      $set: {
        lastStudied: lastTime,
        lastSetID: setID,
      },
    }, (error) => {
      if (error) console.error(error); // eslint-disable-line
    }).exec();
    res.send({}); // success
  });

  server.post('/api/setstats', requireLogin, async (req, res) => {
    const { setID, percent, seconds } = req.body;
    CardSet.findOne({ _id: setID })
      .then((thisSet, err) =>
        CardSet.updateOne({
          _id: thisSet._id, // eslint-disable-line
        }, {
          $set: { score: (thisSet.score === 0) ? percent : (thisSet.score + percent) / 2 },
          $inc: { timeSpent: seconds },
        }).exec(() => {
          if (err) console.error(err); // eslint-disable-line
        }));
    // console.log(setID, percent, seconds);
    res.send({}); // success
  });
}
