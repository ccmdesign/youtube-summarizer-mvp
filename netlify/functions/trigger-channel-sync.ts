import type { Handler, HandlerEvent } from '@netlify/functions';

interface GitHubWorkflowResponse {
  id?: number;
  message?: string;
}

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Get environment variables
  const githubToken = process.env.GITHUB_PAT;
  const githubRepo = process.env.GITHUB_REPO; // format: owner/repo

  if (!githubToken || !githubRepo) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Server configuration error',
        message: 'GITHUB_PAT and GITHUB_REPO environment variables must be set'
      })
    };
  }

  try {
    // Trigger GitHub Actions workflow for channel monitoring
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/workflows/monitor-channels.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          ref: 'main'
        })
      }
    );

    if (response.status === 204) {
      // Success - workflow dispatch returns 204 No Content
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Channel sync workflow triggered successfully. Check GitHub Actions for progress.',
          note: 'New summaries will be available after the workflow completes and Netlify rebuilds (typically 5-20 minutes).'
        })
      };
    }

    // Handle error responses
    const errorData: GitHubWorkflowResponse = await response.json().catch(() => ({}));

    return {
      statusCode: response.status,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Failed to trigger workflow',
        details: errorData.message || `GitHub API returned status ${response.status}`
      })
    };

  } catch (error) {
    console.error('Error triggering channel sync:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    };
  }
};

export { handler };
