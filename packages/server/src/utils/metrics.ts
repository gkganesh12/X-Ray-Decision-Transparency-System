/**
 * Basic metrics tracking
 */

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 1000;

  increment(name: string, tags?: Record<string, string>): void {
    this.record(name, 1, tags);
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.record(name, value, tags);
  }

  private record(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return [...this.metrics];
  }

  getSummary(): Record<string, { count: number; total: number; avg: number }> {
    const summary: Record<string, { count: number; total: number; avg: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, total: 0, avg: 0 };
      }
      summary[metric.name].count++;
      summary[metric.name].total += metric.value;
    });

    Object.keys(summary).forEach((name) => {
      summary[name].avg = summary[name].total / summary[name].count;
    });

    return summary;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const metrics = new MetricsCollector();

