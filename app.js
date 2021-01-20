const express = require('express');
const app = express();
const axios = require('axios');

app.get('/api/rates', async function (req, res) {
	let { base = '', currency = '' } = req.query;
	let filteredRates = {};

	if (!base) {
		return res.status(400).json({
			error: 'base query is required',
		});
	}

	base = base.toUpperCase();
	currency = currency.toUpperCase();

	try {
		const results = await axios.get(
			`https://api.exchangeratesapi.io/latest?base=${base}`,
		);

		if (!results.data) {
			return res.status(404).json({
				error: `Base ${base} is not supported`,
			});
		}

		const { date, rates } = results.data;

		if (currency) {
			let currencies = currency.trimStart().trimEnd().split(',');
			currencies = currencies.map((c) => c.trimStart().trimEnd());

			currencies.map((cur) => {
				if (cur in rates) {
					filteredRates[cur] = rates[cur];
				}
			});
		} else {
			filteredRates = rates;
		}

		return res.status(200).json({
			results: { base, date, rates: filteredRates },
		});
	} catch (error) {
		if ((error.response || {}).status === 400) {
			return res.status(400).json({
				error: `Base ${base} is not supported`,
			});
		}

		return res.status(500).json({
			error: 'Awww snap! Please try again or contact me at oleesir@gmail.com',
		});
	}
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`listening at http://localhost:${port}`);
});
