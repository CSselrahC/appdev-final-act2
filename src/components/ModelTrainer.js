import { useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

// Normalization helper functions for arrays
function computeNormalization(arrs) {
  const len = arrs[0].length;
  const mins = Array(len).fill(Infinity);
  const maxs = Array(len).fill(-Infinity);
  arrs.forEach(row => {
    row.forEach((val, i) => {
      if (val < mins[i]) mins[i] = val;
      if (val > maxs[i]) maxs[i] = val;
    });
  });
  return { mins, maxs };
}

function normalize(arrs, mins, maxs) {
  return arrs.map(row =>
    row.map((v, i) =>
      maxs[i] === mins[i] ? 0 : (v - mins[i]) / (maxs[i] - mins[i])
    )
  );
}

export default function ModelTrainer({ products, onModelTrained }) {
  useEffect(() => {
    if (!products.length) return;

    async function trainModel() {
      // Prepare inputs and outputs from products
      const inputArrs = products.map(p => [
        p.currentInventory,
        p.avgSalesPerWeek,
        p.leadTimeDays,
      ]);

      // Label rule: reorder if inventory is less than avgSales * leadTime
      const outputArrs = products.map(p =>
        p.currentInventory < (p.avgSalesPerWeek * p.leadTimeDays) ? 1 : 0
      );

      // Normalize inputs
      const { mins, maxs } = computeNormalization(inputArrs);
      const inputsNorm = normalize(inputArrs, mins, maxs);

      const inputTensor = tf.tensor2d(inputsNorm);
      const outputTensor = tf.tensor2d(outputArrs, [outputArrs.length, 1]);

      // Define model
      const model = tf.sequential();
      model.add(tf.layers.dense({ inputShape: [3], units: 8, activation: "relu" }));
      model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

      model.compile({
        optimizer: "adam",
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      await model.fit(inputTensor, outputTensor, {
        epochs: 200,
        shuffle: true,
      });

      // Attach normalization params to model instance for prediction phase
      model.mins = mins;
      model.maxs = maxs;

      onModelTrained(model);

      // Dispose tensors
      inputTensor.dispose();
      outputTensor.dispose();
    }

    trainModel();
  }, [products, onModelTrained]);

  return null; // no UI in this component
}
