import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database connection with a busy timeout
const dbPromise = open({
    filename: 'database.db',
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    verbose: true
});

dbPromise.then(db => {
    db.configure('busyTimeout', 5000);  // Wait up to 5000 ms (5 seconds) if the database is busy
});

export default dbPromise;
