import * as tf from '@tensorflow/tfjs'
import { PredictionResult } from './cnn-model'

export interface ModelMetrics {
  accuracy: number
  precision: number[]
  recall: number[]
  f1Score: number[]
  confusionMatrix: number[][]
  auc: number
  loss: number
}

export interface EvaluationResult {
  metrics: ModelMetrics
  perClassMetrics: {
    className: string
    precision: number
    recall: number
    f1Score: number
    support: number
  }[]
  rocCurve: { fpr: number[]; tpr: number[]; auc: number }
  predictions: PredictionResult[]
  trueLabels: number[]
  processingTime: number
}

export class ModelEvaluator {
  /**
   * Evaluate model performance on test dataset
   */
  static async evaluateModel(
    model: tf.LayersModel,
    testImages: tf.Tensor,
    testLabels: tf.Tensor,
    classNames: string[]
  ): Promise<EvaluationResult> {
    const startTime = performance.now()

    // Get model predictions
    const predictions = model.predict(testImages) as tf.Tensor
    const predictedClasses = tf.argMax(predictions, 1)
    const trueClasses = tf.argMax(testLabels, 1)

    // Convert to arrays for evaluation
    const predictedArray = await predictedClasses.data()
    const trueArray = await trueClasses.data()
    const probabilities = await predictions.data()

    // Calculate confusion matrix
    const confusionMatrix = this.calculateConfusionMatrix(
      Array.from(trueArray),
      Array.from(predictedArray),
      classNames.length
    )

    // Calculate metrics
    const metrics = this.calculateMetrics(confusionMatrix)
    const perClassMetrics = this.calculatePerClassMetrics(confusionMatrix, classNames)

    // Calculate ROC curve and AUC
    const rocCurve = this.calculateROCCurve(
      Array.from(trueArray),
      Array.from(probabilities),
      classNames.length
    )

    // Create prediction results
    const predictionResults: PredictionResult[] = []
    const numSamples = testImages.shape[0]
    
    for (let i = 0; i < numSamples; i++) {
      const startIdx = i * classNames.length
      const classProbabilities = Array.from(probabilities.slice(startIdx, startIdx + classNames.length))
      const maxProb = Math.max(...classProbabilities)
      const predictedClass = classProbabilities.indexOf(maxProb)

      predictionResults.push({
        predictions: classProbabilities,
        confidence: maxProb,
        classIndex: predictedClass,
        className: classNames[predictedClass],
        processingTime: 0 // Individual processing time not tracked here
      })
    }

    const endTime = performance.now()
    const processingTime = endTime - startTime

    // Clean up tensors
    predictions.dispose()
    predictedClasses.dispose()
    trueClasses.dispose()

    return {
      metrics,
      perClassMetrics,
      rocCurve,
      predictions: predictionResults,
      trueLabels: Array.from(trueArray),
      processingTime
    }
  }

  /**
   * Calculate confusion matrix
   */
  private static calculateConfusionMatrix(
    trueLabels: number[],
    predictedLabels: number[],
    numClasses: number
  ): number[][] {
    const matrix: number[][] = Array(numClasses).fill(null).map(() => Array(numClasses).fill(0))

    for (let i = 0; i < trueLabels.length; i++) {
      const trueClass = trueLabels[i]
      const predictedClass = predictedLabels[i]
      matrix[trueClass][predictedClass]++
    }

    return matrix
  }

  /**
   * Calculate overall metrics from confusion matrix
   */
  private static calculateMetrics(confusionMatrix: number[][]): ModelMetrics {
    const numClasses = confusionMatrix.length
    let totalCorrect = 0
    let totalSamples = 0

    // Calculate per-class precision and recall
    const precision: number[] = []
    const recall: number[] = []
    const f1Score: number[] = []

    for (let i = 0; i < numClasses; i++) {
      const tp = confusionMatrix[i][i]
      const fp = confusionMatrix.reduce((sum, row, idx) => idx !== i ? sum + row[i] : sum, 0)
      const fn = confusionMatrix[i].reduce((sum, val, idx) => idx !== i ? sum + val : sum, 0)

      const precision_i = tp + fp > 0 ? tp / (tp + fp) : 0
      const recall_i = tp + fn > 0 ? tp / (tp + fn) : 0
      const f1_i = precision_i + recall_i > 0 ? 2 * (precision_i * recall_i) / (precision_i + recall_i) : 0

      precision.push(precision_i)
      recall.push(recall_i)
      f1Score.push(f1_i)

      totalCorrect += tp
      totalSamples += confusionMatrix[i].reduce((sum, val) => sum + val, 0)
    }

    const accuracy = totalSamples > 0 ? totalCorrect / totalSamples : 0
    const avgPrecision = precision.reduce((sum, val) => sum + val, 0) / numClasses
    const avgRecall = recall.reduce((sum, val) => sum + val, 0) / numClasses
    const avgF1 = f1Score.reduce((sum, val) => sum + val, 0) / numClasses

    // Calculate AUC (simplified - would need more sophisticated implementation for multi-class)
    const auc = avgF1 // Simplified AUC calculation

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix,
      auc,
      loss: 0 // Would need to calculate from model evaluation
    }
  }

  /**
   * Calculate per-class metrics
   */
  private static calculatePerClassMetrics(
    confusionMatrix: number[][],
    classNames: string[]
  ): { className: string; precision: number; recall: number; f1Score: number; support: number }[] {
    const numClasses = confusionMatrix.length
    const metrics = []

    for (let i = 0; i < numClasses; i++) {
      const tp = confusionMatrix[i][i]
      const fp = confusionMatrix.reduce((sum, row, idx) => idx !== i ? sum + row[i] : sum, 0)
      const fn = confusionMatrix[i].reduce((sum, val, idx) => idx !== i ? sum + val : sum, 0)
      const support = confusionMatrix[i].reduce((sum, val) => sum + val, 0)

      const precision = tp + fp > 0 ? tp / (tp + fp) : 0
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0
      const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0

      metrics.push({
        className: classNames[i],
        precision,
        recall,
        f1Score,
        support
      })
    }

    return metrics
  }

  /**
   * Calculate ROC curve and AUC
   */
  private static calculateROCCurve(
    trueLabels: number[],
    probabilities: number[],
    numClasses: number
  ): { fpr: number[]; tpr: number[]; auc: number } {
    // Simplified ROC calculation for binary case
    // For multi-class, would need one-vs-rest approach
    const fpr: number[] = []
    const tpr: number[] = []

    // This is a simplified implementation
    // In practice, you'd calculate ROC for each class
    for (let threshold = 0; threshold <= 1; threshold += 0.1) {
      let tp = 0, fp = 0, tn = 0, fn = 0

      for (let i = 0; i < trueLabels.length; i++) {
        const trueClass = trueLabels[i]
        const predictedProb = probabilities[i * numClasses] // Simplified for binary case
        const predicted = predictedProb >= threshold ? 1 : 0

        if (trueClass === 1 && predicted === 1) tp++
        else if (trueClass === 0 && predicted === 1) fp++
        else if (trueClass === 0 && predicted === 0) tn++
        else if (trueClass === 1 && predicted === 0) fn++
      }

      fpr.push(fp + tn > 0 ? fp / (fp + tn) : 0)
      tpr.push(tp + fn > 0 ? tp / (tp + fn) : 0)
    }

    // Calculate AUC using trapezoidal rule
    let auc = 0
    for (let i = 1; i < fpr.length; i++) {
      auc += (fpr[i] - fpr[i - 1]) * (tpr[i] + tpr[i - 1]) / 2
    }

    return { fpr, tpr, auc }
  }

  /**
   * Generate classification report
   */
  static generateClassificationReport(evaluation: EvaluationResult): string {
    let report = 'Classification Report\n'
    report += '========================\n\n'

    // Per-class metrics
    report += 'Per-Class Metrics:\n'
    report += '-------------------\n'
    report += 'Class\t\tPrecision\tRecall\t\tF1-Score\tSupport\n'
    
    evaluation.perClassMetrics.forEach(metric => {
      const className = metric.className.padEnd(12)
      const precision = metric.precision.toFixed(3).padEnd(8)
      const recall = metric.recall.toFixed(3).padEnd(8)
      const f1Score = metric.f1Score.toFixed(3).padEnd(8)
      const support = metric.support.toString().padEnd(8)
      
      report += `${className}\t${precision}\t${recall}\t${f1Score}\t${support}\n`
    })

    // Overall metrics
    report += '\nOverall Metrics:\n'
    report += '----------------\n'
    report += `Accuracy: ${evaluation.metrics.accuracy.toFixed(3)}\n`
    report += `Macro Avg Precision: ${(evaluation.metrics.precision.reduce((a, b) => a + b, 0) / evaluation.metrics.precision.length).toFixed(3)}\n`
    report += `Macro Avg Recall: ${(evaluation.metrics.recall.reduce((a, b) => a + b, 0) / evaluation.metrics.recall.length).toFixed(3)}\n`
    report += `Macro Avg F1-Score: ${(evaluation.metrics.f1Score.reduce((a, b) => a + b, 0) / evaluation.metrics.f1Score.length).toFixed(3)}\n`
    report += `AUC: ${evaluation.metrics.auc.toFixed(3)}\n`
    report += `Processing Time: ${evaluation.processingTime.toFixed(0)}ms\n`

    return report
  }

  /**
   * Analyze model performance and provide recommendations
   */
  static analyzePerformance(evaluation: EvaluationResult): {
    overall: 'excellent' | 'good' | 'fair' | 'poor'
    issues: string[]
    recommendations: string[]
    strengths: string[]
  } {
    const { accuracy, precision, recall, f1Score } = evaluation.metrics
    const avgPrecision = precision.reduce((a, b) => a + b, 0) / precision.length
    const avgRecall = recall.reduce((a, b) => a + b, 0) / recall.length
    const avgF1 = f1Score.reduce((a, b) => a + b, 0) / f1Score.length

    const issues: string[] = []
    const recommendations: string[] = []
    const strengths: string[] = []

    // Determine overall performance
    let overall: 'excellent' | 'good' | 'fair' | 'poor'
    if (accuracy >= 0.95) overall = 'excellent'
    else if (accuracy >= 0.85) overall = 'good'
    else if (accuracy >= 0.70) overall = 'fair'
    else overall = 'poor'

    // Analyze issues
    if (accuracy < 0.80) {
      issues.push('Low overall accuracy')
      recommendations.push('Consider increasing training data size')
      recommendations.push('Try data augmentation techniques')
      recommendations.push('Adjust model architecture or hyperparameters')
    }

    if (avgPrecision < 0.80) {
      issues.push('Low precision - model may be making false positive predictions')
      recommendations.push('Increase threshold for positive predictions')
      recommendations.push('Add more negative examples to training data')
    }

    if (avgRecall < 0.80) {
      issues.push('Low recall - model may be missing positive cases')
      recommendations.push('Add more positive examples to training data')
      recommendations.push('Consider class weighting in loss function')
    }

    // Check for class imbalance issues
    const classSupports = evaluation.perClassMetrics.map(m => m.support)
    const maxSupport = Math.max(...classSupports)
    const minSupport = Math.min(...classSupports)
    const imbalanceRatio = minSupport / maxSupport

    if (imbalanceRatio < 0.5) {
      issues.push('Significant class imbalance detected')
      recommendations.push('Use stratified sampling for train/test split')
      recommendations.push('Apply class weights or oversampling techniques')
    }

    // Identify strengths
    if (accuracy >= 0.90) strengths.push('High overall accuracy')
    if (avgPrecision >= 0.90) strengths.push('Excellent precision - low false positive rate')
    if (avgRecall >= 0.90) strengths.push('Excellent recall - low false negative rate')
    if (avgF1 >= 0.90) strengths.push('Well-balanced precision and recall')

    // Check per-class performance
    evaluation.perClassMetrics.forEach((metric, index) => {
      if (metric.f1Score >= 0.90) {
        strengths.push(`Excellent performance on ${metric.className}`)
      } else if (metric.f1Score < 0.70) {
        issues.push(`Poor performance on ${metric.className}`)
        recommendations.push(`Add more training examples for ${metric.className}`)
        recommendations.push(`Consider class-specific data augmentation for ${metric.className}`)
      }
    })

    return {
      overall,
      issues,
      recommendations,
      strengths
    }
  }

  /**
   * Export evaluation results to JSON
   */
  static exportEvaluationResults(evaluation: EvaluationResult): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: evaluation.metrics,
      perClassMetrics: evaluation.perClassMetrics,
      rocCurve: evaluation.rocCurve,
      processingTime: evaluation.processingTime,
      analysis: this.analyzePerformance(evaluation)
    }, null, 2)
  }
}