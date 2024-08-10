import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { spawn } from "child_process";
import fs from "fs";
import Docker from "dockerode";

// Initialize Docker client
const docker = new Docker();

async function executeCoder(language, code, input) {
    function cleanOutput(output) {
        return output.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    }
    // Start time
    const startTime = process.hrtime();
    // Initial memory usage
    const startMemoryUsage = process.memoryUsage();
    let output;

    switch (language) {
        case 'java':
            output = await runJavaCode(code, input);
            break;
        // Add cases for other languages as needed
        default:
            throw new ApiError('Unsupported language', 404);
    }
    
    // End time
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6) + " ms";

    // After execution memory usage
    const endMemoryUsage = process.memoryUsage();
    const memoryUsed = ((endMemoryUsage.rss - startMemoryUsage.rss) / 1024 / 1024).toFixed(2) + " MB";

    return {output:cleanOutput( output), executionTime, memoryUsed };
}

// Compile Java code locally and then run it in Docker
async function runJavaCode(code, input) {
    const javaFileName = 'TempCode.java';
    const className = 'TempCode';
    
    return new Promise((resolve, reject) => {
        // Write the Java code to a file
        fs.writeFileSync(javaFileName, code);

        // Compile the Java code
        const javacProcess = spawn('javac', [javaFileName]);

        javacProcess.on('close', async (code) => {
            if (code !== 0) {
                reject(new Error('Compilation failed'));
                return;
            }

            try {
                // After successful compilation, run the code inside Docker
                const output = await runJavaInDocker(className, input);
                fs.unlinkSync(javaFileName);
                fs.unlinkSync(`${className}.class`);
                resolve(output);
            } catch (err) {
                fs.unlinkSync(javaFileName);
                fs.unlinkSync(`${className}.class`);
                reject(err);
            }
        });
    });
}

// Run compiled Java code inside Docker
async function runJavaInDocker(className, input) {
    return new Promise(async (resolve, reject) => {
        const tempDir = process.cwd(); // Use current working directory for Docker binding

        try {
            // Create Docker container for running the Java class
            const container = await docker.createContainer({
                Image: 'openjdk:18-slim',
                Cmd: ['sh', '-c', `echo "${input}" | java ${className}`],
                Tty: false,
                HostConfig: {
                    AutoRemove: true, // Automatically remove after execution
                    Binds: [`${tempDir}:/usr/src/app`],
                    NetworkMode: 'none', // Disable network access
                    Memory: 512 * 1024 * 1024, // 512MB memory limit
                    CpuPeriod: 100000,
                    CpuQuota: 50000, // 50% of one CPU
                },
                WorkingDir: '/usr/src/app',
            });

            // Start the container
            await container.start();

            // Capture the output from the Docker container
            const stream = await container.logs({ stdout: true, stderr: true, follow: true });
            let output = '';

            stream.on('data', (data) => {
                output += data.toString();
            });

            // Set a timeout for execution
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Execution timed out')), 5000) // 5 seconds timeout
            );

            // Wait for execution to finish or timeout
            await Promise.race([
                new Promise((resolve, reject) => {
                    container.wait((err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                }),
                timeoutPromise
            ]);

            resolve(output);
        } catch (err) {
            reject(`Error running Docker container: ${err.message}`);
        }
    });
}

const executeCode = AsyncHandler(async (req, res) => {
    const { language, code, input } = req.body;
    const output = await executeCoder(language, code, input);
    res.json({ success: true, output: output.output, memoryUsed: output.memoryUsed, executionTime: output.executionTime });
});

export { executeCode };
