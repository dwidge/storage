import {
  S3Client,
  PutBucketVersioningCommand,
  PutObjectCommand,
  ListObjectVersionsCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * Enables versioning on an S3 bucket.
 *
 * @param bucketName The name of the S3 bucket.
 * @param region The AWS region of the bucket.
 * @returns A promise that resolves when versioning is enabled, or rejects on error.
 */
export async function enableBucketVersioning(
  s3Client: S3Client,
  bucketName: string,
  enableVersioning: boolean,
): Promise<void> {
  try {
    await s3Client.send(
      new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: {
          Status: enableVersioning ? "Enabled" : "Suspended",
        },
      }),
    );
    console.log(
      `enableBucketVersioning1: Versioning enabled for bucket: ${bucketName}`,
    );
  } catch (error) {
    console.error(
      "enableBucketVersioningE1: Error enabling bucket versioning:",
      error,
    );
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Tests if versioning is working on an S3 bucket by putting a file, overwriting it,
 * and then retrieving all versions of the file.
 * Cleans up the test file after completion.
 *
 * @param bucketName The name of the S3 bucket.
 * @param region The AWS region of the bucket.
 * @param fileKey The key (path/filename) of the file to test.
 * @param initialContent The initial content of the file.
 * @param overwriteContent The content to overwrite the file with.
 * @returns A promise that resolves to true if versioning is working, false otherwise, or rejects on error.
 */
export async function testBucketVersioning(
  bucketName: string,
  region: string,
  fileKey: string,
  initialContent: string,
  overwriteContent: string,
): Promise<boolean> {
  const s3Client = new S3Client({ region });
  let versioningWorking = false; // Initialize to false, updated if test passes

  try {
    // 1. Put the initial file
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: initialContent,
      }),
    );
    console.log(
      `Initial file "${fileKey}" uploaded to bucket "${bucketName}".`,
    );

    // 2. Overwrite the file
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: overwriteContent,
      }),
    );
    console.log(`File "${fileKey}" overwritten in bucket "${bucketName}".`);

    // 3. Get all versions of the file
    const versionsResponse = await s3Client.send(
      new ListObjectVersionsCommand({
        Bucket: bucketName,
        Prefix: fileKey, // Filter versions by the file key
      }),
    );

    if (!versionsResponse.Versions || versionsResponse.Versions.length < 2) {
      console.warn(
        "Versioning test failed: Less than 2 versions found after overwrite.",
      );
      versioningWorking = false;
    } else {
      console.log(
        `Found ${versionsResponse.Versions.length} versions for file "${fileKey}".`,
      );

      // 4. Optionally verify the content of the versions (for more thorough testing)
      if (versionsResponse.Versions.length >= 2) {
        // Get the latest version (should be the overwriteContent)
        const latestVersionId = versionsResponse.Versions[0].VersionId;
        const latestObjectResponse = await s3Client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            VersionId: latestVersionId,
          }),
        );
        const latestContent =
          await latestObjectResponse.Body?.transformToString();
        if (latestContent !== overwriteContent) {
          console.warn(
            `Versioning test failed: Latest version content does not match overwrite content. Expected: "${overwriteContent}", Got: "${latestContent}"`,
          );
          versioningWorking = false;
        } else {
          // Get the previous version (should be the initialContent)
          const previousVersionId = versionsResponse.Versions[1].VersionId; // Assuming versions are sorted by last modified desc
          const previousObjectResponse = await s3Client.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: fileKey,
              VersionId: previousVersionId,
            }),
          );
          const previousContent =
            await previousObjectResponse.Body?.transformToString();
          if (previousContent !== initialContent) {
            console.warn(
              `Versioning test failed: Previous version content does not match initial content. Expected: "${initialContent}", Got: "${previousContent}"`,
            );
            versioningWorking = false;
          } else {
            console.log("Version content verification successful.");
            versioningWorking = true; // Test passed all checks
          }
        }
      } else {
        versioningWorking = true; // Test passed version count check, but content verification skipped
      }
    }
  } catch (error) {
    console.error("Error testing bucket versioning:", error);
    versioningWorking = false; // Test failed due to error
  } finally {
    try {
      // Cleanup: Delete the test file (current version)
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileKey,
        }),
      );
      console.log(
        `Cleanup: Test file "${fileKey}" deleted from bucket "${bucketName}".`,
      );
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
      // In a real-world scenario, you might want to handle cleanup errors more robustly,
      // e.g., retry, log to a separate location, or implement a cleanup queue.
    }
  }

  return versioningWorking; // Return the final test result
}

// **Example Usage (Remember to replace with your actual bucket name and region):**

async function main() {
  const bucketName = "your-bucket-name"; // Replace with your bucket name
  const region = "your-aws-region"; // Replace with your AWS region
  const fileKey = "test-versioning.txt";
  const initialContent = "This is the initial content.";
  const overwriteContent = "This is the overwritten content.";

  try {
    // 1. Enable versioning (only need to do this once per bucket)
    await enableBucketVersioning(new S3Client({ region }), bucketName, true);

    // 2. Test versioning
    const versioningWorking = await testBucketVersioning(
      bucketName,
      region,
      fileKey,
      initialContent,
      overwriteContent,
    );

    if (versioningWorking) {
      console.log("Bucket versioning is working correctly!");
    } else {
      console.log(
        "Bucket versioning test failed. Please check logs for details.",
      );
    }
  } catch (error) {
    console.error("An error occurred during the process:", error);
  }
}

// Run the example
// main(); // Uncomment this line to run the example
