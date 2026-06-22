const { execSync } = require('child_process');

function runCommand(cmd) {
    try {
        console.log(`Running: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
    } catch (err) {
        console.error(`Command failed: ${cmd}`);
        throw err;
    }
}

function getFiles() {
    try {
        const output = execSync('git status --porcelain').toString();
        const lines = output.split('\n').filter(l => l.trim().length > 0);
        // lines look like " M file.txt" or "?? file.txt"
        const files = lines.map(l => l.substring(3).trim());
        return files;
    } catch (err) {
        console.error('Failed to get git status');
        return [];
    }
}

async function pushInChunks() {
    console.log('Fetching files to push...');
    const files = getFiles();
    if (files.length === 0) {
        console.log('No files to push!');
        return;
    }

    console.log(`Found ${files.length} files to push. We will push them in chunks of 5.`);

    const CHUNK_SIZE = 5;
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        console.log(`\n--- Pushing chunk ${Math.floor(i/CHUNK_SIZE) + 1} of ${Math.ceil(files.length/CHUNK_SIZE)} ---`);
        
        try {
            // Unstage everything first to be safe
            try { execSync('git reset HEAD', { stdio: 'ignore' }); } catch (e) {}

            for (const file of chunk) {
                // using double quotes to handle spaces in filenames
                runCommand(`git add "${file}"`);
            }

            runCommand(`git commit -m "Chunked upload: Part ${Math.floor(i/CHUNK_SIZE) + 1}"`);
            
            // Retry push up to 3 times for bad internet
            let pushed = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`Push attempt ${attempt}...`);
                    // We increase postBuffer for this push
                    execSync('git config http.postBuffer 524288000'); 
                    runCommand('git push');
                    pushed = true;
                    break;
                } catch (pushErr) {
                    console.error(`Push attempt ${attempt} failed. Retrying in 5 seconds...`);
                    execSync('node -e "setTimeout(()=>{}, 5000)"'); // sleep 5s
                }
            }

            if (!pushed) {
                console.error(`Failed to push chunk ${Math.floor(i/CHUNK_SIZE) + 1} after 3 attempts. Stopping.`);
                process.exit(1);
            }
        } catch (err) {
            console.error(`Failed on chunk ${Math.floor(i/CHUNK_SIZE) + 1}`, err);
            process.exit(1);
        }
    }

    console.log('\n✅ All chunks pushed successfully!');
}

pushInChunks();
