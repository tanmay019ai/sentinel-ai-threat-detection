const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/scan-url", async (req, res) => {
	try {
		const { url } = req.body;
		const response = await axios.post("http://127.0.0.1:8000/predict", {
			url,
		});

		res.json(response.data);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: "AI service failed",
		});
	}
});

module.exports = router;
