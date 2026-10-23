#!/usr/bin/env python3
"""Verify pack_ml.js tests against references and unfinished starters."""
import json
import math
from pathlib import Path

PACK = Path(__file__).resolve().parents[1] / "assets/js/data/pack_ml.js"


def sigmoid_bce(logits, labels):
    probabilities = []
    total = 0.0
    for x, y in zip(logits, labels):
        if x >= 0:
            probabilities.append(1.0 / (1.0 + math.exp(-x)))
        else:
            e = math.exp(x)
            probabilities.append(e / (1.0 + e))
        total += max(x, 0.0) - x * y + math.log1p(math.exp(-abs(x)))
    return probabilities, total / len(logits)


def standardize_train_test(train, test):
    rows = len(train)
    dimensions = len(train[0])
    means = [sum(row[j] for row in train) / rows for j in range(dimensions)]
    scales = []
    for j, mean in enumerate(means):
        scale = math.sqrt(sum((row[j] - mean) ** 2 for row in train) / rows)
        scales.append(scale if scale != 0.0 else 1.0)

    def transform(matrix):
        return [[(row[j] - means[j]) / scales[j] for j in range(dimensions)] for row in matrix]

    return transform(train), transform(test), means, scales


def linear_regression_step(features, targets, weights, bias, learning_rate):
    n = len(features)
    weight_sums = [0.0] * len(weights)
    bias_sum = 0.0
    for row, target in zip(features, targets):
        error = sum(x * w for x, w in zip(row, weights)) + bias - target
        bias_sum += error
        for j, value in enumerate(row):
            weight_sums[j] += error * value
    factor = 2.0 / n
    new_weights = [w - learning_rate * factor * g for w, g in zip(weights, weight_sums)]
    return new_weights, bias - learning_rate * factor * bias_sum


def binary_metrics(y_true, y_pred):
    tp = fp = fn = 0
    for truth, prediction in zip(y_true, y_pred):
        if prediction == 1:
            if truth == 1:
                tp += 1
            else:
                fp += 1
        elif truth == 1:
            fn += 1
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return precision, recall, f1


def knn_predict(train_points, train_labels, query, k):
    neighbors = []
    for index, (point, label) in enumerate(zip(train_points, train_labels)):
        distance = sum((a - b) ** 2 for a, b in zip(point, query))
        neighbors.append((distance, index, label))
    neighbors.sort(key=lambda item: (item[0], item[1]))
    votes = {}
    for distance, _, label in neighbors[:k]:
        count, distance_sum = votes.get(label, (0, 0.0))
        votes[label] = (count + 1, distance_sum + distance)
    return min(votes, key=lambda label: (-votes[label][0], votes[label][1] / votes[label][0], label))


def kmeans_step(points, centroids):
    k = len(centroids)
    dimensions = len(centroids[0])
    assignments = []
    sums = [[0.0] * dimensions for _ in range(k)]
    counts = [0] * k
    for point in points:
        cluster = min(range(k), key=lambda i: (sum((point[j] - centroids[i][j]) ** 2 for j in range(dimensions)), i))
        assignments.append(cluster)
        counts[cluster] += 1
        for j, value in enumerate(point):
            sums[cluster][j] += value
    updated = []
    for i in range(k):
        if counts[i]:
            updated.append([value / counts[i] for value in sums[i]])
        else:
            updated.append(list(centroids[i]))
    return assignments, updated


def load_problems():
    source = PACK.read_text(encoding="utf-8")
    start = source.index("[")
    end = source.rindex("]);") + 1
    return json.loads(source[start:end])


def main():
    problems = load_problems()
    expected_ids = [f"ml-{number}" for number in range(901, 907)]
    assert [problem["id"] for problem in problems] == expected_ids
    references = {
        "ml-901": sigmoid_bce,
        "ml-902": standardize_train_test,
        "ml-903": linear_regression_step,
        "ml-904": binary_metrics,
        "ml-905": knn_predict,
        "ml-906": kmeans_step,
    }
    for problem in problems:
        name = references[problem["id"]].__name__
        reference_namespace = {name: references[problem["id"]]}
        exec(problem["tests"]["python"], reference_namespace)

        starter_namespace = {}
        exec(problem["starter"]["python"], starter_namespace)
        try:
            exec(problem["tests"]["python"], starter_namespace)
        except (AssertionError, NotImplementedError):
            pass
        else:
            raise AssertionError(f"starter unexpectedly passed for {problem['id']}")
        print(f"PASS {problem['id']}: reference passed, starter failed")
    print(f"Verified {len(problems)} ML problems from {PACK}")


if __name__ == "__main__":
    main()
