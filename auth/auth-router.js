const bcryptjs = require('bcryptjs');

const router = require('express').Router();

const Users = require('../users/users-model');

router.post('/register', (req, res) => {
	const { username, password } = req.body;

	const rounds = process.env.HASH_ROUNDS || 9;
	const hash = bcryptjs.hashSync(password, rounds);

	Users.add({ username, password: hash })
		.then((user) => {
			res.status(200).json(user);
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json(error);
		});
});

router.post('/login', (req, res) => {
	const { username, password } = req.body;

	Users.findBy({ username })
		.then(([ user ]) => {
			if (user && bcryptjs.compareSync(password, user.password)) {
				req.session.user = { id: user.id, username: user.username };

				res.status(200).json({ successMessage: `Sweet, You're In!`, session: req.session });
			} else {
				res.status(401).json({ errorMessage: 'Please enter the correct credentials' });
			}
		})
		.catch((error) => {
			console.log(error);
			res.status(500).json(error);
		});
});

router.get('/logout', (req, res) => {
	if (req.session) {
		req.session.destroy((error) => {
			if (error) {
				res.status(500).json({ message: 'EEK, You are stuck!' });
			} else {
				res.status(204).end();
			}
		});
	} else {
		res.status(204).end();
	}
});

module.exports = router;