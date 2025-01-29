/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const github = require('@actions/github');

async function getOctokitAndContext() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not provided');
  return { octokit: github.getOctokit(token), context: github.context };
}

async function run() {
  try {
    const { octokit, context } = await getOctokitAndContext();
    const { pull_request: pr, repository } = context.payload;

    if (!pr) throw new Error('This action only runs on pull request events.');

    await octokit.rest.issues.addAssignees({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: pr.number,
      assignees: [pr.user.login],
    });

    console.log(`Successfully assigned ${pr.user.login} to PR #${pr.number}`);
  } catch (error) {
    console.error('Failed to assign PR creator:', error.message);
    process.exit(1);
  }
}

run();
