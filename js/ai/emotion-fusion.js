// js/ai/emotion-fusion.js
/**
 * Emotion Fusion Engine
 * Combines multiple emotion sources with intelligent weighting
 */

class EmotionFusionEngine {
    constructor() {
        this.sources = {};
        this.weights = {
            facial: { weight: 0.5, reliability: 0.8, lastUpdate: 0 },
            text: { weight: 0.3, reliability: 0.7, lastUpdate: 0 },
            behavior: { weight: 0.15, reliability: 0.6, lastUpdate: 0 },
            manual: { weight: 0.05, reliability: 1.0, lastUpdate: 0 }
        };
        
        this.config = {
            fusionMethod: 'weighted_average', // 'weighted_average', 'bayesian', 'dempster_shafer'
            timeDecay: 0.1, // Per second decay for stale data
            minConfidence: 0.3,
            conflictThreshold: 0.5,
            smoothingFactor: 0.3
        };
        
        this.emotionModels = {
            happy: { valence: 0.8, arousal: 0.6, engagement: 0.9 },
            sad: { valence: -0.8, arousal: -0.4, engagement: 0.2 },
            angry: { valence: -0.7, arousal: 0.8, engagement: 0.4 },
            frustrated: { valence: -0.6, arousal: 0.5, engagement: 0.3 },
            confused: { valence: -0.3, arousal: 0.2, engagement: 0.4 },
            bored: { valence: -0.4, arousal: -0.7, engagement: 0.1 },
            excited: { valence: 0.9, arousal: 0.9, engagement: 1.0 },
            neutral: { valence: 0.0, arousal: 0.0, engagement: 0.5 },
            anxious: { valence: -0.5, arousal: 0.7, engagement: 0.6 },
            proud: { valence: 0.7, arousal: 0.5, engagement: 0.8 },
            surprised: { valence: 0.3, arousal: 0.9, engagement: 0.7 }
        };
        
        this.fusionHistory = [];
        this.conflictHistory = [];
        
        this.listeners = {};
    }
    
    registerSource(sourceId, initialWeight = 0.1) {
        this.sources[sourceId] = {
            data: null,
            weight: initialWeight,
            reliability: 0.5,
            lastUpdate: 0,
            updateCount: 0,
            consistency: 1.0
        };
        
        console.log(`Registered emotion source: ${sourceId}`);
    }
    
    updateSource(sourceId, emotionData) {
        if (!this.sources[sourceId]) {
            this.registerSource(sourceId);
        }
        
        const source = this.sources[sourceId];
        const previousData = source.data;
        
        // Update source data
        source.data = {
            ...emotionData,
            timestamp: Date.now()
        };
        source.lastUpdate = Date.now();
        source.updateCount++;
        
        // Calculate source reliability
        this.calculateSourceReliability(sourceId, previousData);
        
        // Perform fusion
        const fusedResult = this.performFusion();
        
        // Check for conflicts
        this.detectConflicts();
        
        // Store in history
        this.fusionHistory.push({
            timestamp: Date.now(),
            sources: Object.keys(this.sources).reduce((obj, key) => {
                if (this.sources[key].data) {
                    obj[key] = this.sources[key].data.emotion;
                }
                return obj;
            }, {}),
            fused: fusedResult,
            weights: Object.keys(this.sources).reduce((obj, key) => {
                obj[key] = this.sources[key].weight;
                return obj;
            }, {})
        });
        
        // Trim history
        if (this.fusionHistory.length > 100) {
            this.fusionHistory = this.fusionHistory.slice(-100);
        }
        
        // Emit result
        this.emit('fusionUpdate', fusedResult);
        
        return fusedResult;
    }
    
    calculateSourceReliability(sourceId, previousData) {
        const source = this.sources[sourceId];
        if (!source.data || !previousData) return;
        
        // Factor 1: Temporal consistency
        const timeDiff = (source.data.timestamp - previousData.timestamp) / 1000;
        const temporalConsistency = Math.exp(-timeDiff / 10); // Decay over 10 seconds
        
        // Factor 2: Emotion consistency
        let emotionConsistency = 1.0;
        if (previousData.emotion) {
            emotionConsistency = source.data.emotion === previousData.emotion ? 1.0 : 0.5;
        }
        
        // Factor 3: Confidence consistency
        const confidenceDiff = Math.abs(source.data.confidence - previousData.confidence);
        const confidenceConsistency = 1.0 - (confidenceDiff / 2);
        
        // Combined reliability
        source.reliability = (
            temporalConsistency * 0.3 +
            emotionConsistency * 0.4 +
            confidenceConsistency * 0.3
        );
        
        // Update weight based on reliability
        source.weight = source.reliability * 0.8 + 0.1; // Scale to 0.1-0.9
    }
    
    performFusion() {
        const activeSources = Object.entries(this.sources).filter(
            ([_, source]) => source.data && this.isSourceRecent(source)
        );
        
        if (activeSources.length === 0) {
            return this.getFallbackEmotion();
        }
        
        switch (this.config.fusionMethod) {
            case 'weighted_average':
                return this.weightedAverageFusion(activeSources);
            case 'bayesian':
                return this.bayesianFusion(activeSources);
            case 'dempster_shafer':
                return this.dempsterShaferFusion(activeSources);
            default:
                return this.weightedAverageFusion(activeSources);
        }
    }
    
    weightedAverageFusion(sources) {
        // Convert emotions to vector space (valence, arousal, engagement)
        const vectors = [];
        const weights = [];
        
        for (const [sourceId, source] of sources) {
            const emotion = source.data.emotion;
            const model = this.emotionModels[emotion];
            
            if (model) {
                vectors.push([
                    model.valence,
                    model.arousal,
                    model.engagement
                ]);
                
                // Weight = source weight * data confidence
                const weight = source.weight * source.data.confidence;
                weights.push(weight);
            }
        }
        
        if (vectors.length === 0) {
            return this.getFallbackEmotion();
        }
        
        // Calculate weighted average vector
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let fusedVector = [0, 0, 0];
        
        for (let i = 0; i < vectors.length; i++) {
            const weight = weights[i] / totalWeight;
            fusedVector[0] += vectors[i][0] * weight;
            fusedVector[1] += vectors[i][1] * weight;
            fusedVector[2] += vectors[i][2] * weight;
        }
        
        // Find closest emotion to fused vector
        const fusedEmotion = this.findClosestEmotion(fusedVector);
        
        // Calculate fusion confidence
        const avgConfidence = sources.reduce((sum, [_, s]) => 
            sum + s.data.confidence, 0) / sources.length;
        
        const weightDiversity = this.calculateWeightDiversity(weights);
        const fusionConfidence = avgConfidence * weightDiversity;
        
        return {
            emotion: fusedEmotion.emotion,
            confidence: fusionConfidence,
            vector: fusedVector,
            valence: fusedVector[0],
            arousal: fusedVector[1],
            engagement: fusedVector[2],
            sources: sources.map(([id, s]) => ({
                source: id,
                emotion: s.data.emotion,
                confidence: s.data.confidence,
                weight: s.weight
            })),
            method: 'weighted_average',
            timestamp: Date.now()
        };
    }
    
    bayesianFusion(sources) {
        // Simplified Bayesian fusion
        const emotionProbabilities = {};
        
        // Initialize probabilities
        for (const emotion in this.emotionModels) {
            emotionProbabilities[emotion] = 0.1; // Prior
        }
        
        // Update with each source
        for (const [sourceId, source] of sources) {
            const emotion = source.data.emotion;
            const confidence = source.data.confidence;
            const weight = source.weight;
            
            if (emotionProbabilities[emotion] !== undefined) {
                // Bayesian update
                const likelihood = confidence * weight;
                const prior = emotionProbabilities[emotion];
                
                // Simplified: P(emotion|evidence) ∝ likelihood * prior
                emotionProbabilities[emotion] = likelihood * prior;
            }
        }
        
        // Normalize probabilities
        const total = Object.values(emotionProbabilities).reduce((sum, p) => sum + p, 0);
        for (const emotion in emotionProbabilities) {
            emotionProbabilities[emotion] /= total;
        }
        
        // Find emotion with highest probability
        let fusedEmotion = 'neutral';
        let maxProbability = 0;
        
        for (const [emotion, probability] of Object.entries(emotionProbabilities)) {
            if (probability > maxProbability) {
                maxProbability = probability;
                fusedEmotion = emotion;
            }
        }
        
        // Calculate entropy (uncertainty)
        const entropy = this.calculateEntropy(emotionProbabilities);
        const fusionConfidence = 1 - entropy;
        
        return {
            emotion: fusedEmotion,
            confidence: Math.max(this.config.minConfidence, fusionConfidence),
            probabilities: emotionProbabilities,
            entropy: entropy,
            sources: sources.map(([id, s]) => id),
            method: 'bayesian',
            timestamp: Date.now()
        };
    }
    
    dempsterShaferFusion(sources) {
        // Simplified Dempster-Shafer fusion
        const frameOfDiscernment = Object.keys(this.emotionModels);
        const massFunctions = [];
        
        // Create mass functions for each source
        for (const [_, source] of sources) {
            const emotion = source.data.emotion;
            const confidence = source.data.confidence;
            const weight = source.weight;
            
            const mass = {};
            
            // Assign mass to specific emotion
            mass[emotion] = confidence * weight;
            
            // Remaining mass to uncertainty (all emotions)
            mass['uncertainty'] = 1 - (confidence * weight);
            
            massFunctions.push(mass);
        }
        
        if (massFunctions.length === 0) {
            return this.getFallbackEmotion();
        }
        
        // Combine mass functions (simplified)
        let combinedMass = { ...massFunctions[0] };
        
        for (let i = 1; i < massFunctions.length; i++) {
            combinedMass = this.combineMasses(combinedMass, massFunctions[i]);
        }
        
        // Find emotion with highest belief
        let fusedEmotion = 'neutral';
        let maxBelief = 0;
        
        for (const emotion of frameOfDiscernment) {
            const belief = combinedMass[emotion] || 0;
            if (belief > maxBelief) {
                maxBelief = belief;
                fusedEmotion = emotion;
            }
        }
        
        // Calculate plausibility and confidence
        const uncertainty = combinedMass['uncertainty'] || 0;
        const fusionConfidence = 1 - uncertainty;
        
        return {
            emotion: fusedEmotion,
            confidence: Math.max(this.config.minConfidence, fusionConfidence),
            mass: combinedMass,
            uncertainty: uncertainty,
            sources: sources.map(([id, s]) => id),
            method: 'dempster_shafer',
            timestamp: Date.now()
        };
    }
    
    combineMasses(mass1, mass2) {
        const combined = {};
        const k = 0; // Conflict factor (simplified)
        
        // Combine specific emotions
        for (const emotion1 in mass1) {
            if (emotion1 === 'uncertainty') continue;
            
            for (const emotion2 in mass2) {
                if (emotion2 === 'uncertainty') continue;
                
                if (emotion1 === emotion2) {
                    combined[emotion1] = (combined[emotion1] || 0) + 
                                         (mass1[emotion1] * mass2[emotion2]) / (1 - k);
                }
            }
        }
        
        // Handle uncertainty
        combined['uncertainty'] = ((mass1['uncertainty'] || 0) * (mass2['uncertainty'] || 0)) / (1 - k);
        
        return combined;
    }
    
    findClosestEmotion(vector) {
        let closestEmotion = 'neutral';
        let minDistance = Infinity;
        
        for (const [emotion, model] of Object.entries(this.emotionModels)) {
            const distance = Math.sqrt(
                Math.pow(vector[0] - model.valence, 2) +
                Math.pow(vector[1] - model.arousal, 2) +
                Math.pow(vector[2] - model.engagement, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestEmotion = emotion;
            }
        }
        
        // Convert distance to similarity (0-1)
        const maxDistance = Math.sqrt(3 * 4); // Max possible distance in our space
        const similarity = 1 - (minDistance / maxDistance);
        
        return {
            emotion: closestEmotion,
            similarity: similarity
        };
    }
    
    calculateWeightDiversity(weights) {
        if (weights.length <= 1) return 1.0;
        
        const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
        const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
        const stdDev = Math.sqrt(variance);
        
        // Normalize to 0-1 range
        const normalizedDiversity = Math.min(1, stdDev / mean);
        
        return 1 - normalizedDiversity; // Higher diversity = lower confidence
    }
    
    calculateEntropy(probabilities) {
        let entropy = 0;
        
        for (const p of Object.values(probabilities)) {
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }
        
        // Normalize to 0-1 range
        const maxEntropy = Math.log2(Object.keys(probabilities).length);
        return entropy / maxEntropy;
    }
    
    detectConflicts() {
        const activeSources = Object.entries(this.sources).filter(
            ([_, source]) => source.data && this.isSourceRecent(source)
        );
        
        if (activeSources.length < 2) return;
        
        // Check for emotional conflicts
        const emotions = activeSources.map(([_, s]) => s.data.emotion);
        const uniqueEmotions = [...new Set(emotions)];
        
        if (uniqueEmotions.length > 1) {
            // Calculate conflict level
            const conflictLevel = this.calculateConflictLevel(activeSources);
            
            if (conflictLevel > this.config.conflictThreshold) {
                this.conflictHistory.push({
                    timestamp: Date.now(),
                    sources: activeSources.map(([id, s]) => ({
                        source: id,
                        emotion: s.data.emotion,
                        confidence: s.data.confidence
                    })),
                    conflictLevel: conflictLevel,
                    resolved: false
                });
                
                this.emit('emotionConflict', {
                    level: conflictLevel,
                    sources: activeSources.map(([id, _]) => id),
                    emotions: uniqueEmotions,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    calculateConflictLevel(sources) {
        if (sources.length < 2) return 0;
        
        // Convert emotions to vectors
        const vectors = sources.map(([_, s]) => {
            const emotion = s.data.emotion;
            const model = this.emotionModels[emotion];
            return model ? [model.valence, model.arousal] : [0, 0];
        });
        
        // Calculate pairwise distances
        let totalDistance = 0;
        let pairCount = 0;
        
        for (let i = 0; i < vectors.length; i++) {
            for (let j = i + 1; j < vectors.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(vectors[i][0] - vectors[j][0], 2) +
                    Math.pow(vectors[i][1] - vectors[j][1], 2)
                );
                totalDistance += distance;
                pairCount++;
            }
        }
        
        const avgDistance = totalDistance / pairCount;
        
        // Normalize to 0-1 range (max distance in valence-arousal space is ~2.8)
        return Math.min(1, avgDistance / 2.8);
    }
    
    isSourceRecent(source) {
        const timeSinceUpdate = (Date.now() - source.lastUpdate) / 1000;
        const decayFactor = Math.exp(-this.config.timeDecay * timeSinceUpdate);
        
        // Source is considered recent if decayed confidence > minConfidence
        const decayedConfidence = (source.data?.confidence || 0) * decayFactor;
        return decayedConfidence > this.config.minConfidence;
    }
    
    getFallbackEmotion() {
        return {
            emotion: 'neutral',
            confidence: 0.1,
            source: 'fallback',
            timestamp: Date.now()
        };
    }
    
    resolveConflict(sourceId, resolution) {
        const conflict = this.conflictHistory.find(c => !c.resolved);
        
        if (conflict) {
            conflict.resolved = true;
            conflict.resolution = resolution;
            conflict.resolvedAt = Date.now();
            
            // Adjust source weights based on resolution
            if (resolution.preferredSource) {
                const source = this.sources[resolution.preferredSource];
                if (source) {
                    source.weight = Math.min(1, source.weight * 1.2);
                }
            }
            
            this.emit('conflictResolved', {
                conflictId: conflict.timestamp,
                resolution: resolution,
                timestamp: Date.now()
            });
        }
    }
    
    // Public API Methods
    
    getFusedEmotion() {
        const activeSources = Object.entries(this.sources).filter(
            ([_, source]) => source.data && this.isSourceRecent(source)
        );
        
        if (activeSources.length === 0) {
            return this.getFallbackEmotion();
        }
        
        return this.performFusion();
    }
    
    getSourceWeights() {
        return Object.entries(this.sources).reduce((obj, [id, source]) => {
            obj[id] = {
                weight: source.weight,
                reliability: source.reliability,
                lastUpdate: source.lastUpdate,
                updateCount: source.updateCount
            };
            return obj;
        }, {});
    }
    
    getFusionHistory(duration = 3600000) {
        const cutoff = Date.now() - duration;
        return this.fusionHistory.filter(entry => entry.timestamp > cutoff);
    }
    
    getConflicts(duration = 3600000) {
        const cutoff = Date.now() - duration;
        return this.conflictHistory.filter(conflict => conflict.timestamp > cutoff);
    }
    
    setFusionMethod(method) {
        if (['weighted_average', 'bayesian', 'dempster_shafer'].includes(method)) {
            this.config.fusionMethod = method;
            console.log(`Fusion method changed to: ${method}`);
        }
    }
    
    adjustSourceWeight(sourceId, newWeight) {
        if (this.sources[sourceId]) {
            this.sources[sourceId].weight = Math.max(0, Math.min(1, newWeight));
            console.log(`Source ${sourceId} weight adjusted to: ${newWeight}`);
        }
    }
    
    reset() {
        for (const sourceId in this.sources) {
            this.sources[sourceId].data = null;
            this.sources[sourceId].weight = 0.1;
            this.sources[sourceId].reliability = 0.5;
        }
        
        this.fusionHistory = [];
        this.conflictHistory = [];
        
        console.log('Emotion Fusion Engine reset');
        this.emit('reset', { timestamp: Date.now() });
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionFusionEngine;
}

// Global instance
window.EmotionFusion = new EmotionFusionEngine();