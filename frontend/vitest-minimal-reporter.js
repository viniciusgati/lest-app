/**
 * Vitest minimal reporter — exibe apenas contagem total e falhas.
 * Compatível com Vitest 4.x / @angular/build:unit-test
 */

function countTests(tasks) {
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const task of tasks ?? []) {
    if (task.type === 'test' || task.type === 'custom') {
      if (task.result?.state === 'pass') passed++;
      else if (task.result?.state === 'fail') {
        failed++;
        failures.push(task);
      }
    }
    if (task.tasks?.length) {
      const sub = countTests(task.tasks);
      passed += sub.passed;
      failed += sub.failed;
      failures.push(...sub.failures);
    }
  }

  return { passed, failed, failures };
}

export default class MinimalReporter {
  onFinished(files = []) {
    let totalPassed = 0;
    let totalFailed = 0;
    const allFailures = [];

    for (const file of files) {
      const { passed, failed, failures } = countTests(file.tasks ?? []);
      totalPassed += passed;
      totalFailed += failed;

      for (const t of failures) {
        const rel = (file.filepath ?? file.name ?? '').replace(process.cwd(), '');
        const msg = t.result?.errors?.[0]?.message?.split('\n')[0] ?? 'unknown error';
        allFailures.push(`  [frontend] ${rel} — ${t.name} — ${msg}`);
      }
    }

    console.log(`\nTests: ${totalPassed} passed, ${totalFailed} failed`);

    if (allFailures.length > 0) {
      console.log('\nFAILED:');
      allFailures.forEach(f => console.log(f));
    }
  }
}
