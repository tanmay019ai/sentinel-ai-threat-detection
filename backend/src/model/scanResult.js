const mongoose = require("mongoose");

const ScanResultSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true,
		},
		domain: {
			type: String,
		},
		prediction: {
			type: String,
		},
		confidence: {
			type: Number,
		},
		severity: {
			type: String,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
		features: {
			type: mongoose.Schema.Types.Mixed,
		},
		html_analysis: {
			type: mongoose.Schema.Types.Mixed,
		},
		fetch_status: {
			type: Number,
		},
		error: {
			type: String,
		},
		has_https: {
			type: Number,
		},
		suspicious_keyword_count: {
			type: Number,
		},
		form_count: {
			type: Number,
		},
		iframe_count: {
			type: Number,
		},
		script_count: {
			type: Number,
		},
		external_script_count: {
			type: Number,
		},
		password_input_count: {
			type: Number,
		},
		hidden_element_count: {
			type: Number,
		},
		scan_duration: {
			type: Number,
		},
	},
	{
		minimize: false,
	}
);

module.exports = mongoose.model("ScanResult", ScanResultSchema);
