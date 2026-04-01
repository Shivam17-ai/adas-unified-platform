const express = require('express');
const router = express.Router();
const AdasData = require('../models/AdasData');
const { execSync } = require('child_process');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const csv = require('csv-parser');

// 1. HISTORICAL DATA (MongoDB)
router.get('/analytics/kpis', async (req, res) => {
  try {
    const avgSafetyResult = await AdasData.aggregate([
        { $group: { _id: null, avgSafety: { $avg: "$Safety_Pct" }, avgAggression: { $avg: "$Aggression_Score" } } }
    ]);
    const totalHardTurns = await AdasData.countDocuments({ Status_Label: "HARD TURN" });
    const totalCriticalBrakes = await AdasData.countDocuments({ Status_Label: "CRITICAL BRAKE" });

    res.json({
      avgSafety: avgSafetyResult[0]?.avgSafety || 0,
      avgAggression: avgSafetyResult[0]?.avgAggression || 0,
      totalHardTurns, 
      totalCriticalBrakes
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. LIVE SESSION PIPELINE (Node -> R -> PySpark)
let currentSessionData = [];
let engineeredSessionKpis = null;

router.post('/session/start', (req, res) => {
    currentSessionData = []; 
    engineeredSessionKpis = null;
    res.json({ message: "Ready to record." });
});

router.post('/session/record', (req, res) => {
    currentSessionData.push(req.body);
    res.status(200).send("Recorded");
});

router.post('/session/stop', async (req, res) => {
    if (currentSessionData.length === 0) return res.status(400).json({error: "No data collected"});

    try {
        // 1. Save Raw Data
        const csvWriter = createObjectCsvWriter({
            path: 'session_raw.csv',
            header: Object.keys(currentSessionData[0]).map(k => ({id: k, title: k}))
        });
        await csvWriter.writeRecords(currentSessionData);

        // 2. Run R Feature Engineering
        console.log("Running R Feature Engineering...");
        execSync('Rscript feature_engineering.R');

        // 3. Run PySpark Machine Learning
        console.log("Running PySpark ML Pipeline...");
        execSync('python3 spark_model.py');

        // 4. Parse Final Spark Results
        const finalData = [];
        fs.createReadStream('session_final_spark.csv')
          .pipe(csv())
          .on('data', (row) => finalData.push(row))
          .on('end', () => {
              const criticalRiskCount = finalData.filter(d => d.Engineered_Status === 'CRITICAL RISK').length;
              const avgRearThreat = finalData.reduce((acc, curr) => acc + parseFloat(curr.Rear_Threat || 0), 0) / (finalData.length || 1);
              
              // NEW: Spark Predictions (Danger Level 3 or 4)
              const mlPredictedCollisions = finalData.filter(d => parseFloat(d.prediction) >= 3).length;
              
              engineeredSessionKpis = {
                  totalCriticalRisk: criticalRiskCount,
                  avgRearThreat: avgRearThreat,
                  totalFrames: finalData.length,
                  sparkPredictedAnomalies: mlPredictedCollisions
              };
              res.json({ message: "Pipelines executed successfully", kpis: engineeredSessionKpis });
          });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

router.get('/analytics/session', (req, res) => {
    if (!engineeredSessionKpis) return res.status(404).json({ message: "No session data engineered yet." });
    res.json(engineeredSessionKpis);
});

module.exports = router;