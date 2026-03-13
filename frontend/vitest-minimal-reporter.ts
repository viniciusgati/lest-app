import type { Reporter, File, TaskResultPack } from 'vitest';

export default class MinimalReporter implements Reporter {
  private failures: Array<{ name: string; file: string; message: string }> = [];

  onTaskUpdate(packs: TaskResultPack[]): void {
    for (const [, result, meta] of packs) {
      if (result?.state === 'fail' && meta?.type === 'test') {
        const message = result.errors?.[0]?.message?.split('\n')[0] ?? '';
        this.failures.push({
          name: String(meta.name ?? ''),
          file: String(meta.file ?? ''),
          message
        });
      }
    }
  }

  onFinished(files: File[]): void {
    let passed = 0;
    let failed = 0;

    for (const file of files) {
      for (const task of file.tasks ?? []) {
        if (task.type === 'test') {
          if (task.result?.state === 'pass') passed++;
          else if (task.result?.state === 'fail') failed++;
        }
        for (const sub of (task as any).tasks ?? []) {
          if (sub.result?.state === 'pass') passed++;
          else if (sub.result?.state === 'fail') failed++;
        }
      }
    }

    console.log(`\nTests: ${passed} passed, ${failed} failed`);

    if (this.failures.length > 0) {
      console.log('\nFAILED:');
      for (const f of this.failures) {
        const rel = f.file.replace(process.cwd(), '');
        console.log(`  [frontend] ${rel} — ${f.name} — ${f.message}`);
      }
    }
  }
}
