/**
 * Terminal progress reporter for thumbnail generation.
 */
export class Progress {
  constructor(total) {
    this.total = total;
    this.current = 0;
    this.successes = 0;
    this.failures = [];
    this.skipped = [];
    this.startTime = Date.now();
  }

  skip(name, reason) {
    this.current++;
    this.skipped.push({ name, reason });
    this._print(`SKIP`, name, reason);
  }

  success(name) {
    this.current++;
    this.successes++;
    this._print(`OK  `, name);
  }

  fail(name, error) {
    this.current++;
    this.failures.push({ name, error });
    this._print(`FAIL`, name, error);
  }

  _print(status, name, detail = '') {
    const pct = Math.round((this.current / this.total) * 100);
    const bar = `[${this.current}/${this.total}] ${pct}%`;
    const detailStr = detail ? ` — ${detail}` : '';
    process.stdout.write(`${bar}  ${status}  ${name}${detailStr}\n`);
  }

  summary() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const lines = [
      '',
      '─'.repeat(50),
      `Thumbnail generation complete in ${elapsed}s`,
      `  Successes: ${this.successes}`,
      `  Failures:  ${this.failures.length}`,
      `  Skipped:   ${this.skipped.length}`,
      `  Total:     ${this.total}`,
    ];

    if (this.failures.length > 0) {
      lines.push('', 'Failed projects:');
      for (const { name, error } of this.failures) {
        lines.push(`  - ${name}: ${error}`);
      }
    }

    if (this.skipped.length > 0) {
      lines.push('', 'Skipped projects:');
      for (const { name, reason } of this.skipped) {
        lines.push(`  - ${name}: ${reason}`);
      }
    }

    lines.push('─'.repeat(50));
    console.log(lines.join('\n'));
  }
}
