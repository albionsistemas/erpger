const { main } = require('./src/run');

main().catch((err) => {
    console.error('\nMigracion ABORTADA:', err);
    process.exitCode = 1;
});
