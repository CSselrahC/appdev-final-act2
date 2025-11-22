import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

export default function useReorderModel(products, reorderThreshold = 1.0) {
  const [model, setModel] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [predictions, setPredictions] = useState({});

  // Normalization helper functions
  const computeNormalization = (arrs) => {
    const len = arrs[0].length;
    const mins = Array(len).fill(Infinity);
    const maxs = Array(len).fill(-Infinity);
    arrs.forEach((row) => {
      row.forEach((val, i) => {
        if (val < mins[i]) mins[i] = val;
        if (val > maxs[i]) maxs[i] = val;
      });
    });
    return { mins, maxs };
  };

  const normalize = (arrs, mins, maxs) =>
    arrs.map((row) =>
      row.map((v, i) => (maxs[i] === mins[i] ? 0 : (v - mins[i]) / (maxs[i] - mins[i])))
    );

  useEffect(() => {
    if (!products.length) return;
    let disposed = false;

    async function trainModel() {
      setIsTraining(true);

      const inputArrs = products.map((p) => [
        p.currentInventory,
        p.avgSalesPerWeek,
        p.leadTimeDays,
      ]);
      const outputArrs = products.map((p) =>
        p.currentInventory < reorderThreshold * p.avgSalesPerWeek * p.leadTimeDays ? 1 : 0
      );

      const { mins, maxs } = computeNormalization(inputArrs);
      const inputsNorm = normalize(inputArrs, mins, maxs);

      const inputTensor = tf.tensor2d(inputsNorm, [inputsNorm.length, 3]);
      const labelTensor = tf.tensor2d(outputArrs, [outputArrs.length, 1]);

      const reorderModel = tf.sequential();
      reorderModel.add(tf.layers.dense({ inputShape: [3], units: 16, activation: "relu" }));
      reorderModel.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

      reorderModel.compile({
        optimizer: "adam",
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      await reorderModel.fit(inputTensor, labelTensor, {
        epochs: 100,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => setMetrics({ ...logs }),
        },
      });

      if (!disposed) setModel({ reorderModel, mins, maxs });

      inputTensor.dispose();
      labelTensor.dispose();

      setIsTraining(false);
    }

    trainModel();

    return () => {
      disposed = true;
    };
  }, [products, reorderThreshold]);

  useEffect(() => {
    if (!model || !products.length) return;
    const { reorderModel, mins, maxs } = model;

    const inputArrs = products.map((p) => [
      p.currentInventory,
      p.avgSalesPerWeek,
      p.leadTimeDays,
    ]);
    const inputsNorm = normalize(inputArrs, mins, maxs);

    const inputTensor = tf.tensor2d(inputsNorm, [inputsNorm.length, 3]);

    const predictionsTensor = reorderModel.predict(inputTensor);

    predictionsTensor.array().then((arrs) => {
      const result = {};
      arrs.forEach((value, idx) => {
        const prob = value[0];
        result[products[idx].id] = prob > 0.5 ? "Reorder" : "No Reorder";
      });
      setPredictions(result);
      predictionsTensor.dispose();
      inputTensor.dispose();
    });
  }, [model, products]);

  return { predictions, isTraining, metrics };
}
